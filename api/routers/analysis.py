"""
Analysis Router
AI-powered article analysis endpoints
"""

from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..database import get_supabase
from ..services.analyzer import analyze_and_save, get_all_analyses, get_analysis_by_url
from ..services.slack import format_slack_message, format_slack_text

router = APIRouter(prefix="/analysis", tags=["analysis"])


class AnalyzeRequest(BaseModel):
    title: str
    content: str
    url: str = ""
    is_sponsored: bool = False
    model: str = "gpt-4o-mini"
    force: bool = False


@router.get("")
async def list_analyses(
    limit: int = 50,
    priority: Optional[str] = None
):
    """Get all analyses"""
    try:
        return get_all_analyses(limit=limit, priority=priority)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-url")
async def get_analysis_for_url(url: str):
    """Get analysis by article URL"""
    result = get_analysis_by_url(url)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result


@router.get("/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get analysis by ID"""
    try:
        supabase = get_supabase()
        result = supabase.table("article_analyses").select("*").eq("id", analysis_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("")
async def create_analysis(request: AnalyzeRequest):
    """Analyze an article and save to database"""
    try:
        analysis, saved = analyze_and_save(
            title=request.title,
            content=request.content,
            url=request.url,
            is_sponsored=request.is_sponsored,
            model=request.model,
            force=request.force
        )
        
        return {
            "new": analysis is not None,
            "data": saved
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/article/{article_id}")
async def analyze_article_by_id(
    article_id: int,
    model: str = "gpt-4o-mini",
    force: bool = False
):
    """Analyze an article from the database by ID"""
    try:
        supabase = get_supabase()
        result = supabase.table("news_articles").select("*").eq("id", article_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Article not found")
        
        article = result.data[0]
        
        analysis, saved = analyze_and_save(
            title=article.get("title", ""),
            content=article.get("text", ""),
            url=article.get("url", ""),
            article_id=article_id,
            is_sponsored=article.get("is_sponsored", False),
            model=model,
            force=force
        )
        
        return {
            "new": analysis is not None,
            "data": saved
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{analysis_id}/slack")
async def get_slack_format(analysis_id: str, format: str = "text"):
    """Get analysis formatted for Slack"""
    try:
        supabase = get_supabase()
        result = supabase.table("article_analyses").select("*").eq("id", analysis_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Note: This returns the raw data formatted for Slack
        # Full ArticleAnalysis object would need reconstruction
        data = result.data[0]
        
        return {
            "format": format,
            "article_url": data.get("article_url"),
            "data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

