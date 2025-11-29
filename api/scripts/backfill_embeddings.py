#!/usr/bin/env python3
"""
Backfill Embeddings Script
Computes embeddings for existing article_analyses using OpenAI text-embedding-3-small
"""

import os
import asyncio
import logging
from typing import Optional
from concurrent.futures import ThreadPoolExecutor

import openai
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

# Configuration
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536
BATCH_SIZE = 100  # Process in batches
MAX_CONCURRENT = 10  # Concurrent OpenAI API calls

# ============================================================================
# CLIENTS
# ============================================================================

_supabase: Optional[Client] = None
_openai_client: Optional[openai.OpenAI] = None


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


def get_openai() -> openai.OpenAI:
    """Get or create OpenAI client"""
    global _openai_client
    if _openai_client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY must be set")
        _openai_client = openai.OpenAI(api_key=api_key)
    return _openai_client


# ============================================================================
# EMBEDDING FUNCTIONS
# ============================================================================

def compute_embedding(text: str) -> list[float]:
    """
    Compute embedding for text using OpenAI text-embedding-3-small.
    Returns a 1536-dimensional vector.
    """
    if not text or len(text.strip()) == 0:
        raise ValueError("Empty text provided for embedding")
    
    client = get_openai()
    
    response = client.embeddings.create(
        input=text,
        model=EMBEDDING_MODEL
    )
    
    return response.data[0].embedding


def format_embedding_for_pgvector(embedding: list[float]) -> str:
    """
    Format embedding as pgvector-compatible string.
    """
    return f"[{','.join(map(str, embedding))}]"


# ============================================================================
# DATABASE OPERATIONS
# ============================================================================

def get_articles_without_embeddings(limit: int = BATCH_SIZE) -> list[dict]:
    """
    Get article_analyses records that don't have embeddings yet.
    """
    supabase = get_supabase()
    
    result = supabase.table("article_analyses").select(
        "id", "long_summary"
    ).is_(
        "embedding", "null"
    ).not_.is_(
        "long_summary", "null"
    ).limit(limit).execute()
    
    return result.data


def update_embedding(article_id: str, embedding: list[float]) -> bool:
    """
    Update the embedding for an article_analyses record.
    """
    try:
        supabase = get_supabase()
        
        embedding_str = format_embedding_for_pgvector(embedding)
        
        supabase.table("article_analyses").update({
            "embedding": embedding_str
        }).eq("id", article_id).execute()
        
        return True
    except Exception as e:
        logger.error(f"Failed to update embedding for {article_id}: {e}")
        return False


def get_total_without_embeddings() -> int:
    """Get total count of articles without embeddings"""
    supabase = get_supabase()
    
    result = supabase.table("article_analyses").select(
        "id", count="exact"
    ).is_(
        "embedding", "null"
    ).not_.is_(
        "long_summary", "null"
    ).execute()
    
    return len(result.data)


# ============================================================================
# ASYNC PROCESSING
# ============================================================================

async def process_article_async(
    article: dict,
    semaphore: asyncio.Semaphore,
    executor: ThreadPoolExecutor
) -> tuple[str, bool, str]:
    """
    Process a single article asynchronously.
    Returns (article_id, success, message)
    """
    async with semaphore:
        article_id = article["id"]
        long_summary = article["long_summary"]
        
        try:
            loop = asyncio.get_event_loop()
            
            # Compute embedding in thread pool
            embedding = await loop.run_in_executor(
                executor,
                compute_embedding,
                long_summary
            )
            
            # Update database
            success = await loop.run_in_executor(
                executor,
                update_embedding,
                article_id,
                embedding
            )
            
            if success:
                return (article_id, True, "Success")
            else:
                return (article_id, False, "Failed to save")
                
        except Exception as e:
            return (article_id, False, str(e))


async def process_batch_async(
    articles: list[dict],
    max_concurrent: int = MAX_CONCURRENT
) -> tuple[int, int]:
    """
    Process a batch of articles concurrently.
    Returns (success_count, error_count)
    """
    semaphore = asyncio.Semaphore(max_concurrent)
    executor = ThreadPoolExecutor(max_workers=max_concurrent)
    
    tasks = [
        process_article_async(article, semaphore, executor)
        for article in articles
    ]
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    success_count = 0
    error_count = 0
    
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            error_count += 1
            logger.error(f"Exception: {result}")
        else:
            article_id, success, message = result
            if success:
                success_count += 1
            else:
                error_count += 1
                logger.error(f"Failed {article_id}: {message}")
    
    executor.shutdown(wait=False)
    return success_count, error_count


# ============================================================================
# MAIN BACKFILL FUNCTION
# ============================================================================

async def backfill_embeddings(
    batch_size: int = BATCH_SIZE,
    max_concurrent: int = MAX_CONCURRENT
) -> dict:
    """
    Backfill embeddings for all articles that don't have them.
    """
    from datetime import datetime
    start_time = datetime.now()
    
    logger.info("=" * 70)
    logger.info("🧮 BACKFILL EMBEDDINGS")
    logger.info("=" * 70)
    logger.info(f"Model: {EMBEDDING_MODEL}")
    logger.info(f"Dimensions: {EMBEDDING_DIMENSIONS}")
    logger.info(f"Batch size: {batch_size}")
    logger.info(f"Max concurrent: {max_concurrent}")
    logger.info("=" * 70)
    
    total_processed = 0
    total_success = 0
    total_errors = 0
    batch_num = 0
    
    while True:
        batch_num += 1
        
        # Get next batch
        articles = get_articles_without_embeddings(limit=batch_size)
        
        if not articles:
            logger.info("No more articles to process!")
            break
        
        logger.info(f"\n📦 Batch {batch_num}: Processing {len(articles)} articles...")
        
        # Process batch
        success, errors = await process_batch_async(articles, max_concurrent)
        
        total_processed += len(articles)
        total_success += success
        total_errors += errors
        
        logger.info(f"   ✅ Success: {success}, ❌ Errors: {errors}")
        
        # Small delay between batches to avoid rate limiting
        if len(articles) == batch_size:
            await asyncio.sleep(1)
    
    elapsed = (datetime.now() - start_time).total_seconds()
    
    logger.info("\n" + "=" * 70)
    logger.info("📊 BACKFILL COMPLETE")
    logger.info("=" * 70)
    logger.info(f"Total processed:  {total_processed}")
    logger.info(f"Successful:       {total_success}")
    logger.info(f"Errors:           {total_errors}")
    logger.info(f"Time elapsed:     {elapsed:.1f}s")
    if total_success > 0:
        logger.info(f"Rate:             {total_success/elapsed*60:.1f} embeddings/min")
    logger.info("=" * 70)
    
    return {
        "total_processed": total_processed,
        "success": total_success,
        "errors": total_errors,
        "elapsed_seconds": elapsed
    }


# ============================================================================
# CLI
# ============================================================================

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Backfill embeddings for article_analyses"
    )
    parser.add_argument(
        "--batch-size", "-b",
        type=int,
        default=BATCH_SIZE,
        help=f"Number of articles per batch (default: {BATCH_SIZE})"
    )
    parser.add_argument(
        "--concurrent", "-c",
        type=int,
        default=MAX_CONCURRENT,
        help=f"Max concurrent API calls (default: {MAX_CONCURRENT})"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show count of articles to process without actually processing"
    )
    
    args = parser.parse_args()
    
    # Check environment
    if not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_KEY"):
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set")
        exit(1)
    
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY must be set")
        exit(1)
    
    if args.dry_run:
        count = get_total_without_embeddings()
        print(f"📊 Articles without embeddings: {count}")
        exit(0)
    
    # Run backfill
    result = asyncio.run(backfill_embeddings(
        batch_size=args.batch_size,
        max_concurrent=args.concurrent
    ))
    
    print(f"\n✅ Done! Processed {result['success']} embeddings successfully.")

