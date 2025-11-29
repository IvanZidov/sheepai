"""
Web Scraping Service
Scrapes The Hacker News for articles
"""

import re
import asyncio
import logging
from datetime import datetime
from typing import Optional
from concurrent.futures import ThreadPoolExecutor

import requests
from bs4 import BeautifulSoup

from ..config import HACKERNEWS_URL, OPENAI_MODEL
from ..database import get_supabase
from .analyzer import analyze_article, save_analysis, get_analysis_by_url

logger = logging.getLogger(__name__)

# Thread pool for running sync LLM calls concurrently
_executor = ThreadPoolExecutor(max_workers=5)


def get_article_urls(url: str = HACKERNEWS_URL) -> list[str]:
    """
    Scrape The Hacker News homepage for article URLs.
    Returns list of article URLs.
    """
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        article_containers = soup.select(".blog-posts > .body-post")

        urls = []
        for container in article_containers:
            link_element = container.select_one(".story-link")
            if link_element and link_element.has_attr("href"):
                urls.append(link_element["href"])
        
        logger.info(f"Found {len(urls)} article URLs on homepage")
        return urls
    except Exception as e:
        logger.error(f"Error fetching article URLs: {e}")
        return []


def extract_article_data(article_url: str) -> Optional[dict]:
    """
    Extract full article data from a single article page.
    """
    try:
        resp = requests.get(article_url, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        article_data = {}

        # 1. Title and URL
        title_link = soup.select_one('.story-title a')
        if title_link:
            article_data["title"] = title_link.get_text(strip=True)
            article_data["url"] = title_link.get("href", article_url)
        else:
            h1 = soup.select_one("h1.story-title")
            article_data["title"] = h1.get_text(strip=True) if h1 else "N/A"
            article_data["url"] = article_url

        # 2. Thumbnail Image
        thumbnail_meta = soup.select_one('div[itemprop="image"] meta[itemprop="url"]')
        if thumbnail_meta:
            article_data["thumbnail"] = thumbnail_meta.get("content", "")
        else:
            article_body_img = soup.select_one("#articlebody img")
            article_data["thumbnail"] = article_body_img["src"] if article_body_img and article_body_img.has_attr("src") else ""

        # 3. Metadata (Date, Author, Tags)
        postmeta_element = soup.select_one('.postmeta')
        post_head_tags = []
        if postmeta_element:
            # Date
            date_element = postmeta_element.select_one('.p-author .author')
            article_data["timestamp"] = date_element.get_text(strip=True) if date_element else None
            
            # Author
            author_meta = soup.select_one('div[itemprop="author"] meta[itemprop="name"]')
            if author_meta and author_meta.has_attr("content"):
                article_data["author"] = author_meta["content"]
            else:
                authors = postmeta_element.select('.author')
                article_data["author"] = authors[1].get_text(strip=True) if len(authors) > 1 else None
            
            # Tags
            tags_meta = postmeta_element.select_one('.p-tags')
            if tags_meta:
                post_head_tags = [t.strip() for t in tags_meta.text.strip().split(' / ') if t.strip()]

        # 4. Full Article Body Text
        article_body = soup.find(id="articlebody")
        if article_body:
            body_clone = BeautifulSoup(str(article_body), "html.parser")
            for selector in ['.separator', '.dog_two', '.cf.note-b']:
                for el in body_clone.select(selector):
                    el.decompose()
            full_text = body_clone.get_text("\n", strip=True)
            full_text = re.sub(r"\n\s*\n", "\n\n", full_text).strip()
            article_data["text"] = full_text
        else:
            article_data["text"] = ""

        # 5. Detailed Tags
        detailed_tags_element = soup.select_one('.tags .categ')
        if detailed_tags_element:
            section_spans = detailed_tags_element.select('a span[itemprop="articleSection"]')
            article_data["tags"] = " / ".join([span.get_text(strip=True) for span in section_spans])
        else:
            article_data["tags"] = " / ".join(post_head_tags)

        # Check if sponsored
        article_data["is_sponsored"] = "sponsored" in article_data.get("tags", "").lower()
        
        return article_data
        
    except Exception as e:
        logger.error(f"Error extracting article data from {article_url}: {e}")
        return None


def get_existing_urls() -> set[str]:
    """Get all existing article URLs from database"""
    try:
        supabase = get_supabase()
        result = supabase.table("news_articles").select("url").execute()
        return {row["url"] for row in result.data}
    except Exception as e:
        logger.error(f"Error fetching existing URLs: {e}")
        return set()


def save_article(article_data: dict) -> Optional[dict]:
    """Save article to database"""
    try:
        supabase = get_supabase()
        
        db_data = {
            "url": article_data.get("url"),
            "title": article_data.get("title"),
            "thumbnail": article_data.get("thumbnail"),
            "text": article_data.get("text"),
            "tags": article_data.get("tags"),
            "timestamp": article_data.get("timestamp"),
            "source": article_data.get("author"),
            "is_sponsored": article_data.get("is_sponsored", False),
        }
        
        result = supabase.table("news_articles").upsert(
            db_data,
            on_conflict="url"
        ).execute()
        
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"Error saving article: {e}")
        return None


async def analyze_article_async(article_data: dict, article_id: int) -> tuple[bool, str]:
    """
    Analyze a single article asynchronously.
    Returns (success, message)
    """
    url = article_data.get("url", "")
    title = article_data.get("title", "Unknown")
    
    try:
        # Check if already analyzed
        existing = get_analysis_by_url(url)
        if existing:
            return (True, f"⏭️ Already analyzed: {title[:40]}...")
        
        # Run LLM analysis in thread pool (non-blocking)
        loop = asyncio.get_event_loop()
        analysis = await loop.run_in_executor(
            _executor,
            lambda: analyze_article(
                title=title,
                content=article_data.get("text", "")[:15000],
                url=url,
                is_sponsored=article_data.get("is_sponsored", False)
            )
        )
        
        # Save to database
        save_analysis(
            analysis=analysis,
            article_url=url,
            article_title=title,
            article_id=article_id
        )
        
        return (True, f"✅ Analyzed: {analysis.headline[:40]}...")
        
    except Exception as e:
        return (False, f"❌ Failed: {title[:30]}... - {str(e)[:50]}")


async def analyze_articles_batch(articles_to_analyze: list[tuple[dict, int]]) -> tuple[int, int]:
    """
    Analyze multiple articles concurrently.
    Returns (success_count, error_count)
    """
    if not articles_to_analyze:
        return 0, 0
    
    logger.info(f"🤖 Starting async analysis of {len(articles_to_analyze)} articles...")
    
    # Create tasks for all articles
    tasks = [
        analyze_article_async(article_data, article_id)
        for article_data, article_id in articles_to_analyze
    ]
    
    # Run all concurrently
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    success_count = 0
    error_count = 0
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            error_count += 1
            logger.error(f"[{i+1}/{len(results)}] ❌ Exception: {result}")
        else:
            success, message = result
            if success:
                success_count += 1
                logger.info(f"[{i+1}/{len(results)}] {message}")
            else:
                error_count += 1
                logger.error(f"[{i+1}/{len(results)}] {message}")
    
    return success_count, error_count


def scrape_and_save() -> dict:
    """
    Main scraping job:
    1. Get article URLs from homepage
    2. Filter out duplicates (already in DB)
    3. Fetch full details for new articles
    4. Save to database
    5. Analyze all new articles ASYNC
    """
    logger.info("=" * 50)
    logger.info("Starting scrape job...")
    
    # Get URLs from homepage
    urls = get_article_urls()
    if not urls:
        logger.warning("No URLs found")
        return {"new_articles": 0, "analyzed": 0, "skipped": 0, "errors": 0, "timestamp": datetime.now().isoformat()}
    
    # Get existing URLs from database
    existing_urls = get_existing_urls()
    logger.info(f"Found {len(existing_urls)} existing articles in database")
    
    # Filter new URLs
    new_urls = [url for url in urls if url not in existing_urls]
    skipped = len(urls) - len(new_urls)
    logger.info(f"Found {len(new_urls)} new articles to fetch ({skipped} duplicates skipped)")
    
    # Phase 1: Fetch and save all articles (sequential - respects rate limits)
    saved_articles = []  # List of (article_data, article_id) tuples
    error_count = 0
    
    for url in new_urls:
        logger.info(f"Fetching: {url}")
        article_data = extract_article_data(url)
        
        if article_data:
            result = save_article(article_data)
            if result:
                logger.info(f"✅ Saved: {article_data.get('title', 'Unknown')[:50]}...")
                saved_articles.append((article_data, result.get("id")))
            else:
                error_count += 1
                logger.error(f"❌ Failed to save: {url}")
        else:
            error_count += 1
            logger.error(f"❌ Failed to extract: {url}")
    
    # Phase 2: Analyze all saved articles ASYNC (concurrent LLM calls)
    analyzed_count = 0
    analysis_errors = 0
    
    if saved_articles:
        # Run async analysis
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        analyzed_count, analysis_errors = loop.run_until_complete(
            analyze_articles_batch(saved_articles)
        )
    
    total_errors = error_count + analysis_errors
    
    logger.info(f"Scrape complete: {len(saved_articles)} saved, {analyzed_count} analyzed, {skipped} skipped, {total_errors} errors")
    logger.info("=" * 50)
    
    return {
        "new_articles": len(saved_articles),
        "analyzed": analyzed_count,
        "skipped": skipped,
        "errors": total_errors,
        "timestamp": datetime.now().isoformat()
    }

