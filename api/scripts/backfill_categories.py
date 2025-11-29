#!/usr/bin/env python3
"""
Category Backfill Script - Async scraping and analysis of The Hacker News categories
Scrapes articles from specific category pages with pagination support
"""

import os
import re
import asyncio
import logging
from datetime import datetime
from typing import Optional
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

# Category URLs to scrape
CATEGORY_URLS = {
    "data_breach": "https://thehackernews.com/search/label/data%20breach",
    "cyber_attack": "https://thehackernews.com/search/label/Cyber%20Attack",
    "vulnerability": "https://thehackernews.com/search/label/Vulnerability",
}

# Number of pages per category
DEFAULT_PAGES_PER_CATEGORY = 10

# Concurrent workers
MAX_SCRAPE_WORKERS = 3
MAX_ANALYZE_WORKERS = 5

# Delay between requests (be nice to the server)
REQUEST_DELAY = 1.0

# ============================================================================
# SUPABASE CLIENT
# ============================================================================

_supabase: Optional[Client] = None

def get_supabase() -> Client:
    """Get or create Supabase client"""
    global _supabase
    if _supabase is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
        _supabase = create_client(url, key)
    return _supabase


# ============================================================================
# LLM ANALYSIS
# ============================================================================

def get_llm():
    """Get LangChain ChatOpenAI with structured output"""
    from langchain_openai import ChatOpenAI
    from Article import ArticleAnalysis  # Import from root Article.py
    
    return ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        temperature=0.3,
        api_key=os.getenv("OPENAI_API_KEY")
    ).with_structured_output(ArticleAnalysis)


SYSTEM_PROMPT = """You are an expert news analyst. Analyze articles and provide structured summaries for busy professionals.

You handle ALL types of news: technology, AI, security, business, programming, tutorials, product launches, and more.

Guidelines:
- Be concise but comprehensive
- Prioritize actionable insights
- Rate priority: critical (breaking/urgent), high (important), medium (worth knowing), low (nice to know), info (reference)
- Assign up to 3 relevant categories
- relevance_score (1-10): practical value to readers
- confidence_score (1-10): how well you understood the content
- Mark highlight=True for most critical takeaways
- Mark is_technical=True for technical points
- short_summary: 1-2 sentences
- long_summary: 3-5 sentences
- headline: catchy, max 100 chars

IMPORTANT for regions:
- If specific countries or regions are mentioned, include them in the regions array
- Each region should have both the region code AND the flag emoji
- Example: {{"region": "south_korea", "flag": "🇰🇷"}}
- Common flags: 🇺🇸 USA, 🇬🇧 UK, 🇨🇳 China, 🇷🇺 Russia, 🇰🇷 South Korea, 🇰🇵 North Korea, 🇺🇦 Ukraine, 🇮🇷 Iran, 🇮🇱 Israel, 🌍 Global"""


# ============================================================================
# SCRAPING FUNCTIONS
# ============================================================================

def get_page_articles(page_url: str) -> tuple[list[str], Optional[str]]:
    """
    Scrape a single page for article URLs.
    Returns: (list of article URLs, next page URL or None)
    """
    try:
        resp = requests.get(page_url, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        
        # Extract article URLs
        article_containers = soup.select(".blog-posts > .body-post")
        urls = []
        for container in article_containers:
            link_element = container.select_one(".story-link")
            if link_element and link_element.has_attr("href"):
                urls.append(link_element["href"])
        
        # Find "Next Page" link
        next_page_url = None
        next_link = soup.select_one('a.blog-pager-older-link-mobile')
        if next_link and next_link.has_attr("href"):
            next_page_url = next_link["href"]
        else:
            next_link = soup.select_one('a.blog-pager-older-link')
            if next_link and next_link.has_attr("href"):
                next_page_url = next_link["href"]
        
        return urls, next_page_url
        
    except Exception as e:
        logger.error(f"Error fetching page {page_url[:60]}: {e}")
        return [], None


def extract_article_data(article_url: str) -> Optional[dict]:
    """Extract full article data from a single article page."""
    try:
        resp = requests.get(article_url, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        article_data = {}

        # Title and URL
        title_link = soup.select_one('.story-title a')
        if title_link:
            article_data["title"] = title_link.get_text(strip=True)
            article_data["url"] = title_link.get("href", article_url)
        else:
            h1 = soup.select_one("h1.story-title")
            article_data["title"] = h1.get_text(strip=True) if h1 else "N/A"
            article_data["url"] = article_url

        # Thumbnail
        thumbnail_meta = soup.select_one('div[itemprop="image"] meta[itemprop="url"]')
        if thumbnail_meta:
            article_data["thumbnail"] = thumbnail_meta.get("content", "")
        else:
            article_body_img = soup.select_one("#articlebody img")
            article_data["thumbnail"] = article_body_img["src"] if article_body_img and article_body_img.has_attr("src") else ""

        # Metadata
        postmeta_element = soup.select_one('.postmeta')
        post_head_tags = []
        if postmeta_element:
            date_element = postmeta_element.select_one('.p-author .author')
            article_data["timestamp"] = date_element.get_text(strip=True) if date_element else None
            
            author_meta = soup.select_one('div[itemprop="author"] meta[itemprop="name"]')
            if author_meta and author_meta.has_attr("content"):
                article_data["author"] = author_meta["content"]
            else:
                authors = postmeta_element.select('.author')
                article_data["author"] = authors[1].get_text(strip=True) if len(authors) > 1 else None
            
            tags_meta = postmeta_element.select_one('.p-tags')
            if tags_meta:
                post_head_tags = [t.strip() for t in tags_meta.text.strip().split(' / ') if t.strip()]

        # Article body
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

        # Tags
        detailed_tags_element = soup.select_one('.tags .categ')
        if detailed_tags_element:
            section_spans = detailed_tags_element.select('a span[itemprop="articleSection"]')
            article_data["tags"] = " / ".join([span.get_text(strip=True) for span in section_spans])
        else:
            article_data["tags"] = " / ".join(post_head_tags)

        article_data["is_sponsored"] = "sponsored" in article_data.get("tags", "").lower()
        
        return article_data
        
    except Exception as e:
        logger.error(f"Error extracting {article_url[:50]}: {e}")
        return None


# ============================================================================
# DATABASE OPERATIONS
# ============================================================================

def get_existing_urls() -> set[str]:
    """Get all existing article URLs from database"""
    try:
        supabase = get_supabase()
        result = supabase.table("news_articles").select("url").execute()
        return {row["url"] for row in result.data}
    except Exception as e:
        logger.error(f"Error fetching existing URLs: {e}")
        return set()


def get_analyzed_urls() -> set[str]:
    """Get all analyzed article URLs from database"""
    try:
        supabase = get_supabase()
        result = supabase.table("article_analyses").select("article_url").execute()
        return {row["article_url"] for row in result.data}
    except Exception as e:
        logger.error(f"Error fetching analyzed URLs: {e}")
        return set()


def save_article(article_data: dict) -> Optional[dict]:
    """Save article to database. Returns saved record or None."""
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


def save_analysis(article_data: dict, article_id: int, analysis) -> bool:
    """Save analysis to database"""
    try:
        supabase = get_supabase()
        
        data = {
            "article_url": article_data.get("url"),
            "article_title": article_data.get("title"),
            "article_id": article_id,
            "headline": analysis.headline,
            "tldr": analysis.tldr,
            "short_summary": analysis.short_summary,
            "long_summary": analysis.long_summary,
            "priority": analysis.priority.value,
            "categories": [c.value for c in analysis.categories],
            "content_type": analysis.content_type.value,
            "key_takeaways": [t.model_dump() for t in analysis.key_takeaways],
            "affected_entities": [e.model_dump() for e in analysis.affected_entities],
            "action_items": [a.model_dump() for a in analysis.action_items],
            "relevance_score": analysis.relevance_score,
            "confidence_score": analysis.confidence_score,
            "is_breaking_news": analysis.is_breaking_news,
            "is_sponsored": analysis.is_sponsored,
            "worth_full_read": analysis.worth_full_read,
            "read_time_minutes": analysis.read_time_minutes,
            "related_topics": analysis.related_topics,
            "mentioned_technologies": analysis.mentioned_technologies,
            "mentioned_companies": analysis.mentioned_companies,
            "regions": [{"region": r.region.value, "flag": r.flag} for r in analysis.regions] if analysis.regions else [],
            "model_used": os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
        }
        
        supabase.table("article_analyses").upsert(
            data,
            on_conflict="article_url"
        ).execute()
        
        return True
    except Exception as e:
        logger.error(f"Error saving analysis: {e}")
        return False


# ============================================================================
# ASYNC SCRAPING
# ============================================================================

async def scrape_category_async(
    category_name: str,
    start_url: str,
    num_pages: int,
    existing_urls: set[str],
    executor: ThreadPoolExecutor
) -> list[dict]:
    """
    Async scrape a single category.
    Returns list of new article data dicts.
    """
    logger.info(f"\n📂 Category: {category_name}")
    
    loop = asyncio.get_event_loop()
    all_urls = []
    current_url = start_url
    
    for page_num in range(1, num_pages + 1):
        if not current_url:
            break
        
        logger.info(f"  📄 Page {page_num}/{num_pages}")
        
        # Fetch page in thread pool
        urls, next_url = await loop.run_in_executor(
            executor,
            get_page_articles,
            current_url
        )
        
        all_urls.extend(urls)
        current_url = next_url
        
        # Small delay
        await asyncio.sleep(0.5)
    
    # Deduplicate
    new_urls = [url for url in all_urls if url not in existing_urls]
    logger.info(f"  📊 Found {len(all_urls)} URLs, {len(new_urls)} new")
    
    # Fetch article details
    articles = []
    for i, url in enumerate(new_urls):
        article_data = await loop.run_in_executor(
            executor,
            extract_article_data,
            url
        )
        
        if article_data:
            articles.append(article_data)
            logger.info(f"  [{i+1}/{len(new_urls)}] ✅ {article_data.get('title', 'Unknown')[:40]}...")
        else:
            logger.error(f"  [{i+1}/{len(new_urls)}] ❌ Failed: {url[:50]}")
        
        await asyncio.sleep(0.3)
    
    return articles


async def analyze_article_async(
    article_data: dict,
    article_id: int,
    llm,
    semaphore: asyncio.Semaphore,
    executor: ThreadPoolExecutor
) -> tuple[bool, str]:
    """
    Analyze a single article asynchronously.
    Returns (success, message)
    """
    async with semaphore:
        try:
            from langchain_core.prompts import ChatPromptTemplate
            
            prompt = ChatPromptTemplate.from_messages([
                ("system", SYSTEM_PROMPT),
                ("human", """Analyze this article:

Title: {title}
URL: {url}
Is Sponsored: {is_sponsored}

Content:
{content}

Provide a comprehensive structured analysis.""")
            ])
            
            chain = prompt | llm
            loop = asyncio.get_event_loop()
            
            analysis = await loop.run_in_executor(
                executor,
                lambda: chain.invoke({
                    "title": article_data.get("title", ""),
                    "url": article_data.get("url", ""),
                    "is_sponsored": article_data.get("is_sponsored", False),
                    "content": article_data.get("text", "")[:15000]
                })
            )
            
            analysis.is_sponsored = article_data.get("is_sponsored", False)
            
            if save_analysis(article_data, article_id, analysis):
                return (True, f"✅ {analysis.headline[:40]}...")
            else:
                return (False, f"❌ Save failed: {article_data.get('title', 'Unknown')[:30]}")
            
        except Exception as e:
            return (False, f"❌ {article_data.get('title', 'Unknown')[:30]}: {str(e)[:30]}")


async def batch_analyze_async(
    articles: list[tuple[dict, int]],  # (article_data, article_id)
    max_concurrent: int = MAX_ANALYZE_WORKERS
) -> tuple[int, int]:
    """
    Analyze multiple articles concurrently.
    Returns (success_count, error_count)
    """
    if not articles:
        return 0, 0
    
    logger.info(f"\n🤖 Analyzing {len(articles)} articles (max {max_concurrent} concurrent)...")
    
    semaphore = asyncio.Semaphore(max_concurrent)
    executor = ThreadPoolExecutor(max_workers=max_concurrent)
    llm = get_llm()
    
    tasks = [
        analyze_article_async(article_data, article_id, llm, semaphore, executor)
        for article_data, article_id in articles
    ]
    
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
    
    executor.shutdown(wait=False)
    return success_count, error_count


# ============================================================================
# MAIN BACKFILL FUNCTION
# ============================================================================

async def backfill_categories(
    categories: dict[str, str] = CATEGORY_URLS,
    pages_per_category: int = DEFAULT_PAGES_PER_CATEGORY,
    analyze: bool = True
) -> dict:
    """
    Backfill articles from multiple categories with async analysis.
    """
    start_time = datetime.now()
    
    logger.info("=" * 70)
    logger.info("🐑 SHEEPAI CATEGORY BACKFILL")
    logger.info("=" * 70)
    logger.info(f"Categories: {', '.join(categories.keys())}")
    logger.info(f"Pages per category: {pages_per_category}")
    logger.info(f"Analyze: {analyze}")
    logger.info("=" * 70)
    
    # Get existing data
    existing_urls = get_existing_urls()
    analyzed_urls = get_analyzed_urls() if analyze else set()
    logger.info(f"Existing articles: {len(existing_urls)}")
    logger.info(f"Existing analyses: {len(analyzed_urls)}")
    
    # Stats
    total_scraped = 0
    total_saved = 0
    total_analyzed = 0
    total_errors = 0
    
    # Scrape all categories
    all_articles = []  # List of (article_data, article_id) tuples
    executor = ThreadPoolExecutor(max_workers=MAX_SCRAPE_WORKERS)
    
    for category_name, category_url in categories.items():
        articles = await scrape_category_async(
            category_name=category_name,
            start_url=category_url,
            num_pages=pages_per_category,
            existing_urls=existing_urls,
            executor=executor
        )
        
        total_scraped += len(articles)
        
        # Save articles and collect for analysis
        for article_data in articles:
            result = save_article(article_data)
            if result:
                total_saved += 1
                existing_urls.add(article_data.get("url"))
                
                # Check if needs analysis
                if analyze and article_data.get("url") not in analyzed_urls:
                    all_articles.append((article_data, result.get("id")))
            else:
                total_errors += 1
    
    executor.shutdown(wait=False)
    
    # Analyze new articles
    if analyze and all_articles:
        logger.info(f"\n📊 {len(all_articles)} articles need analysis")
        analyzed, analysis_errors = await batch_analyze_async(all_articles)
        total_analyzed = analyzed
        total_errors += analysis_errors
    
    # Summary
    elapsed = (datetime.now() - start_time).total_seconds()
    
    logger.info("\n" + "=" * 70)
    logger.info("📊 BACKFILL COMPLETE")
    logger.info("=" * 70)
    logger.info(f"Categories scraped: {len(categories)}")
    logger.info(f"Articles scraped:   {total_scraped}")
    logger.info(f"Articles saved:     {total_saved}")
    logger.info(f"Articles analyzed:  {total_analyzed}")
    logger.info(f"Errors:             {total_errors}")
    logger.info(f"Time elapsed:       {elapsed:.1f}s")
    if total_analyzed > 0:
        logger.info(f"Analysis rate:      {total_analyzed/elapsed*60:.1f} articles/min")
    logger.info("=" * 70)
    
    return {
        "categories": len(categories),
        "scraped": total_scraped,
        "saved": total_saved,
        "analyzed": total_analyzed,
        "errors": total_errors,
        "elapsed_seconds": elapsed
    }


# ============================================================================
# ANALYZE RECENT ARTICLES
# ============================================================================

def get_recent_unanalyzed_articles(minutes: int = 15) -> list[tuple[dict, int]]:
    """
    Get articles ingested in the last N minutes that haven't been analyzed yet.
    Returns list of (article_data, article_id) tuples.
    """
    from datetime import datetime, timedelta, timezone
    
    supabase = get_supabase()
    
    # Calculate cutoff time
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    cutoff_iso = cutoff.isoformat()
    
    logger.info(f"Looking for articles since: {cutoff_iso}")
    
    # Get recent articles
    articles_result = supabase.table("news_articles").select("*").gte(
        "created_at", cutoff_iso
    ).execute()
    
    recent_articles = articles_result.data
    logger.info(f"Found {len(recent_articles)} articles in last {minutes} minutes")
    
    if not recent_articles:
        return []
    
    # Get already analyzed URLs
    analyzed_result = supabase.table("article_analyses").select("article_url").execute()
    analyzed_urls = {row["article_url"] for row in analyzed_result.data}
    
    # Filter to unanalyzed
    unanalyzed = [
        (article, article["id"])
        for article in recent_articles
        if article.get("url") not in analyzed_urls
    ]
    
    logger.info(f"Found {len(unanalyzed)} unanalyzed articles")
    return unanalyzed


async def analyze_recent_articles(minutes: int = 15) -> dict:
    """
    Analyze articles ingested in the last N minutes.
    """
    start_time = datetime.now()
    
    logger.info("=" * 70)
    logger.info(f"🕐 ANALYZING ARTICLES FROM LAST {minutes} MINUTES")
    logger.info("=" * 70)
    
    # Get recent unanalyzed articles
    articles_to_analyze = get_recent_unanalyzed_articles(minutes)
    
    if not articles_to_analyze:
        logger.info("✨ No new articles to analyze!")
        return {"total": 0, "analyzed": 0, "errors": 0}
    
    # Convert to expected format (article_data needs text, title, url, is_sponsored)
    formatted_articles = []
    for article, article_id in articles_to_analyze:
        formatted_articles.append((
            {
                "title": article.get("title", ""),
                "text": article.get("text", ""),
                "url": article.get("url", ""),
                "is_sponsored": article.get("is_sponsored", False),
            },
            article_id
        ))
    
    # Run batch analysis
    analyzed, errors = await batch_analyze_async(formatted_articles)
    
    elapsed = (datetime.now() - start_time).total_seconds()
    
    logger.info("=" * 70)
    logger.info("📊 ANALYSIS COMPLETE")
    logger.info(f"Total articles:     {len(articles_to_analyze)}")
    logger.info(f"Analyzed:           {analyzed}")
    logger.info(f"Errors:             {errors}")
    logger.info(f"Time elapsed:       {elapsed:.1f}s")
    logger.info("=" * 70)
    
    return {
        "total": len(articles_to_analyze),
        "analyzed": analyzed,
        "errors": errors,
        "elapsed_seconds": elapsed
    }


# ============================================================================
# CLI
# ============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Backfill articles from The Hacker News categories"
    )
    
    # Mode selection
    parser.add_argument(
        "--recent", "-r",
        type=int,
        metavar="MINUTES",
        help="Analyze articles from last N minutes instead of scraping"
    )
    
    # Scraping options
    parser.add_argument(
        "--pages", "-p",
        type=int,
        default=10,
        help="Number of pages per category (default: 10)"
    )
    parser.add_argument(
        "--no-analyze",
        action="store_true",
        help="Skip LLM analysis (only scrape and save)"
    )
    parser.add_argument(
        "--categories", "-c",
        nargs="+",
        choices=list(CATEGORY_URLS.keys()) + ["all"],
        default=["all"],
        help="Categories to scrape (default: all)"
    )
    
    args = parser.parse_args()
    
    # Check environment
    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_KEY"):
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set")
        exit(1)
    
    if not args.no_analyze and not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY must be set for analysis")
        print("   Use --no-analyze to skip analysis")
        exit(1)
    
    # Run in "recent" mode or "scrape" mode
    if args.recent:
        # Analyze recent articles only
        result = asyncio.run(analyze_recent_articles(minutes=args.recent))
        print(f"\n✅ Done! Analyzed {result['analyzed']} of {result['total']} recent articles.")
    else:
        # Full category scrape
        if "all" in args.categories:
            categories = CATEGORY_URLS
        else:
            categories = {k: v for k, v in CATEGORY_URLS.items() if k in args.categories}
        
        result = asyncio.run(backfill_categories(
            categories=categories,
            pages_per_category=args.pages,
            analyze=not args.no_analyze
        ))
    
    print(f"\n✅ Done! Saved {result['saved']}, analyzed {result['analyzed']} articles.")

