"""
Articles Router
CRUD operations for raw articles
"""

from typing import Optional
from fastapi import APIRouter, HTTPException

from ..database import get_supabase
from ..models.schemas import Article, ScrapeResult
from ..services.scraper import scrape_and_save

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("", response_model=list[Article])
async def get_articles(
    limit: int = 50,
    offset: int = 0,
    tag: Optional[str] = None
):
    """Get articles from database"""
    try:
        supabase = get_supabase()
        query = supabase.table("news_articles").select("*").order("created_at", desc=True)
        
        if tag:
            query = query.ilike("tags", f"%{tag}%")
        
        result = query.range(offset, offset + limit - 1).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{article_id}", response_model=Article)
async def get_article(article_id: int):
    """Get a single article by ID"""
    try:
        supabase = get_supabase()
        result = supabase.table("news_articles").select("*").eq("id", article_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Article not found")
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scrape", response_model=ScrapeResult)
async def trigger_scrape():
    """Manually trigger a scrape job"""
    result = scrape_and_save()
    return ScrapeResult(**result)


@router.get("/stats/summary")
async def get_stats():
    """Get database statistics"""
    try:
        supabase = get_supabase()
        
        articles = supabase.table("news_articles").select("id", count="exact").execute()
        total_articles = len(articles.data)
        
        analyses = supabase.table("article_analyses").select("id", count="exact").execute()
        total_analyses = len(analyses.data)
        
        tags_result = supabase.table("news_articles").select("tags").execute()
        tag_counts = {}
        for row in tags_result.data:
            if row.get("tags"):
                for tag in row["tags"].split(" / "):
                    tag = tag.strip()
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        top_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        return {
            "total_articles": total_articles,
            "total_analyses": total_analyses,
            "pending_analyses": total_articles - total_analyses,
            "top_tags": dict(top_tags)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

