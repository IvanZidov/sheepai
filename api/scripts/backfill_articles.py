#!/usr/bin/env python3
"""
Backfill Script - Scrapes multiple pages of The Hacker News archive
Fetches historical articles and saves to Supabase
"""

import os
import re
import time
import logging
from urllib.parse import urljoin, urlparse, parse_qs
from typing import Optional

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

# Starting URL (page 1)
START_URL = "https://thehackernews.com/search?updated-max=2025-11-26T17:25:00%2B05:30&max-results=12"

# Number of pages to scrape
NUM_PAGES = 10

# Delay between requests (be nice to the server)
REQUEST_DELAY = 1.5  # seconds

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
# SCRAPING FUNCTIONS
# ============================================================================

def get_page_articles(page_url: str) -> tuple[list[str], Optional[str]]:
    """
    Scrape a single archive page for article URLs.
    
    Returns:
        tuple: (list of article URLs, next page URL or None)
    """
    try:
        logger.info(f"Fetching page: {page_url[:80]}...")
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
        
        logger.info(f"  Found {len(urls)} articles on this page")
        
        # Find "Next Page" link (mobile version has the URL)
        next_page_url = None
        next_link = soup.select_one('a.blog-pager-older-link-mobile')
        if next_link and next_link.has_attr("href"):
            next_page_url = next_link["href"]
            logger.info(f"  Found next page link")
        else:
            # Try desktop version
            next_link = soup.select_one('a.blog-pager-older-link')
            if next_link and next_link.has_attr("href"):
                next_page_url = next_link["href"]
                logger.info(f"  Found next page link (desktop)")
            else:
                logger.info(f"  No next page found (end of archive)")
        
        return urls, next_page_url
        
    except Exception as e:
        logger.error(f"Error fetching page {page_url}: {e}")
        return [], None


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


def save_article(article_data: dict) -> bool:
    """Save article to database. Returns True if successful."""
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
        
        supabase.table("news_articles").upsert(
            db_data,
            on_conflict="url"
        ).execute()
        
        return True
    except Exception as e:
        logger.error(f"Error saving article: {e}")
        return False


# ============================================================================
# MAIN BACKFILL FUNCTION
# ============================================================================

def backfill_articles(
    start_url: str = START_URL,
    num_pages: int = NUM_PAGES,
    delay: float = REQUEST_DELAY
) -> dict:
    """
    Backfill articles from multiple archive pages.
    
    Args:
        start_url: URL of first archive page
        num_pages: Number of pages to scrape
        delay: Delay between requests in seconds
    
    Returns:
        dict with statistics
    """
    logger.info("=" * 60)
    logger.info(f"BACKFILL: Scraping {num_pages} pages from The Hacker News")
    logger.info("=" * 60)
    
    # Get existing URLs for deduplication
    existing_urls = get_existing_urls()
    logger.info(f"Found {len(existing_urls)} existing articles in database")
    
    # Statistics
    total_urls_found = 0
    total_new = 0
    total_saved = 0
    total_skipped = 0
    total_errors = 0
    
    # Collect all URLs from all pages first
    all_article_urls = []
    current_url = start_url
    
    for page_num in range(1, num_pages + 1):
        if not current_url:
            logger.info(f"No more pages available after page {page_num - 1}")
            break
        
        logger.info(f"\n📄 Page {page_num}/{num_pages}")
        urls, next_url = get_page_articles(current_url)
        all_article_urls.extend(urls)
        total_urls_found += len(urls)
        
        current_url = next_url
        
        # Be nice to the server
        if page_num < num_pages and next_url:
            time.sleep(delay)
    
    logger.info(f"\n📊 Total URLs collected: {total_urls_found}")
    
    # Deduplicate
    new_urls = [url for url in all_article_urls if url not in existing_urls]
    total_skipped = total_urls_found - len(new_urls)
    total_new = len(new_urls)
    
    logger.info(f"   New articles to fetch: {total_new}")
    logger.info(f"   Duplicates skipped: {total_skipped}")
    
    # Fetch and save new articles
    if new_urls:
        logger.info(f"\n🔄 Fetching {len(new_urls)} new articles...")
        
        for i, url in enumerate(new_urls, 1):
            logger.info(f"\n[{i}/{len(new_urls)}] {url[:60]}...")
            
            article_data = extract_article_data(url)
            
            if article_data:
                if save_article(article_data):
                    total_saved += 1
                    logger.info(f"  ✅ Saved: {article_data.get('title', 'Unknown')[:50]}...")
                else:
                    total_errors += 1
                    logger.error(f"  ❌ Failed to save")
            else:
                total_errors += 1
                logger.error(f"  ❌ Failed to extract")
            
            # Be nice to the server
            if i < len(new_urls):
                time.sleep(delay)
    
    # Summary
    logger.info("\n" + "=" * 60)
    logger.info("BACKFILL COMPLETE")
    logger.info("=" * 60)
    logger.info(f"Pages scraped:     {num_pages}")
    logger.info(f"URLs found:        {total_urls_found}")
    logger.info(f"Already in DB:     {total_skipped}")
    logger.info(f"New articles:      {total_new}")
    logger.info(f"Successfully saved: {total_saved}")
    logger.info(f"Errors:            {total_errors}")
    logger.info("=" * 60)
    
    return {
        "pages_scraped": num_pages,
        "urls_found": total_urls_found,
        "skipped_duplicates": total_skipped,
        "new_articles": total_new,
        "saved": total_saved,
        "errors": total_errors
    }


# ============================================================================
# CLI
# ============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Backfill articles from The Hacker News archive")
    parser.add_argument(
        "--pages", "-p",
        type=int,
        default=10,
        help="Number of pages to scrape (default: 10)"
    )
    parser.add_argument(
        "--delay", "-d",
        type=float,
        default=1.5,
        help="Delay between requests in seconds (default: 1.5)"
    )
    parser.add_argument(
        "--url", "-u",
        type=str,
        default=START_URL,
        help="Starting URL (default: recent archive page)"
    )
    
    args = parser.parse_args()
    
    # Check environment
    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_KEY"):
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set")
        print("\nSet them with:")
        print("  export SUPABASE_URL='https://xxx.supabase.co'")
        print("  export SUPABASE_KEY='eyJ...'")
        exit(1)
    
    # Run backfill
    result = backfill_articles(
        start_url=args.url,
        num_pages=args.pages,
        delay=args.delay
    )
    
    print(f"\n✅ Done! Saved {result['saved']} new articles.")

