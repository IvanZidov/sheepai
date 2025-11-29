"""
Batch Analyze Articles
Async script to analyze all unanalyzed articles in the database
"""

import os
import asyncio
import logging
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from supabase import create_client
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Config
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
MAX_CONCURRENT = int(os.getenv("MAX_CONCURRENT", "5"))  # Limit concurrent API calls

# Import the ArticleAnalysis model
from api.models.article import ArticleAnalysis

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


def get_supabase():
    """Get Supabase client"""
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def get_llm() -> ChatOpenAI:
    """Get LangChain ChatOpenAI instance with structured output"""
    return ChatOpenAI(
        model=OPENAI_MODEL,
        temperature=0.3,
        api_key=OPENAI_API_KEY
    ).with_structured_output(ArticleAnalysis)


def get_unanalyzed_articles() -> list[dict]:
    """Get all articles that haven't been analyzed yet"""
    supabase = get_supabase()
    
    # Get all article URLs that have been analyzed
    analyzed = supabase.table("article_analyses").select("article_url").execute()
    analyzed_urls = {row["article_url"] for row in analyzed.data}
    
    # Get all articles
    articles = supabase.table("news_articles").select("*").execute()
    
    # Filter out already analyzed
    unanalyzed = [a for a in articles.data if a["url"] not in analyzed_urls]
    
    logger.info(f"Found {len(unanalyzed)} unanalyzed articles out of {len(articles.data)} total")
    return unanalyzed


async def analyze_article_async(
    article: dict,
    semaphore: asyncio.Semaphore,
    llm: ChatOpenAI
) -> tuple[dict, Optional[ArticleAnalysis], Optional[str]]:
    """
    Analyze a single article asynchronously.
    Returns (article, analysis, error)
    """
    async with semaphore:
        try:
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
            
            # Run in thread pool since langchain isn't fully async
            loop = asyncio.get_event_loop()
            analysis = await loop.run_in_executor(
                None,
                lambda: chain.invoke({
                    "title": article.get("title", ""),
                    "url": article.get("url", ""),
                    "is_sponsored": article.get("is_sponsored", False),
                    "content": article.get("text", "")[:15000]  # Limit content length
                })
            )
            
            # Set is_sponsored from article
            analysis.is_sponsored = article.get("is_sponsored", False)
            
            return (article, analysis, None)
            
        except Exception as e:
            logger.error(f"Error analyzing {article.get('url', 'unknown')}: {e}")
            return (article, None, str(e))


def save_analysis(article: dict, analysis: ArticleAnalysis) -> bool:
    """Save analysis to database"""
    try:
        supabase = get_supabase()
        
        data = {
            "article_url": article.get("url"),
            "article_title": article.get("title"),
            "article_id": article.get("id"),
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
            "model_used": OPENAI_MODEL,
        }
        
        supabase.table("article_analyses").upsert(
            data,
            on_conflict="article_url"
        ).execute()
        
        return True
    except Exception as e:
        logger.error(f"Error saving analysis for {article.get('url')}: {e}")
        return False


async def batch_analyze(articles: list[dict], max_concurrent: int = MAX_CONCURRENT):
    """
    Analyze multiple articles concurrently.
    """
    semaphore = asyncio.Semaphore(max_concurrent)
    llm = get_llm()
    
    logger.info(f"Starting batch analysis of {len(articles)} articles (max {max_concurrent} concurrent)")
    
    # Create tasks
    tasks = [
        analyze_article_async(article, semaphore, llm)
        for article in articles
    ]
    
    # Progress tracking
    success_count = 0
    error_count = 0
    total = len(tasks)
    
    # Process as they complete
    for i, coro in enumerate(asyncio.as_completed(tasks)):
        article, analysis, error = await coro
        
        if analysis:
            if save_analysis(article, analysis):
                success_count += 1
                logger.info(f"[{i+1}/{total}] ✅ {analysis.headline[:60]}...")
            else:
                error_count += 1
                logger.error(f"[{i+1}/{total}] ❌ Failed to save: {article.get('title', 'Unknown')[:50]}")
        else:
            error_count += 1
            logger.error(f"[{i+1}/{total}] ❌ Failed: {article.get('title', 'Unknown')[:50]} - {error}")
    
    return success_count, error_count


async def main():
    """Main entry point"""
    start_time = datetime.now()
    
    logger.info("=" * 60)
    logger.info("🚀 Starting Batch Article Analysis")
    logger.info("=" * 60)
    
    # Validate config
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("❌ SUPABASE_URL and SUPABASE_KEY must be set")
        return
    
    if not OPENAI_API_KEY:
        logger.error("❌ OPENAI_API_KEY must be set")
        return
    
    logger.info(f"Model: {OPENAI_MODEL}")
    logger.info(f"Max concurrent: {MAX_CONCURRENT}")
    
    # Get unanalyzed articles
    articles = get_unanalyzed_articles()
    
    if not articles:
        logger.info("✨ All articles have been analyzed!")
        return
    
    # Run batch analysis
    success, errors = await batch_analyze(articles)
    
    # Summary
    elapsed = (datetime.now() - start_time).total_seconds()
    logger.info("=" * 60)
    logger.info("📊 Batch Analysis Complete")
    logger.info(f"   ✅ Successful: {success}")
    logger.info(f"   ❌ Errors: {errors}")
    logger.info(f"   ⏱️  Time: {elapsed:.1f}s")
    logger.info(f"   📈 Rate: {success/elapsed*60:.1f} articles/min" if elapsed > 0 else "")
    logger.info("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())

