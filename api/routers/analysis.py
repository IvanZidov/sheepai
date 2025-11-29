"""
Analysis Router
AI-powered article analysis endpoints
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field

from ..database import get_supabase
from ..services.analyzer import analyze_and_save, get_all_analyses, get_analysis_by_url
from ..services.slack import format_slack_message, format_slack_text

router = APIRouter(prefix="/analysis", tags=["analysis"])


class AnalyzeRequest(BaseModel):
    """Request body for analyzing an article"""
    title: str = Field(..., description="Article title")
    content: str = Field(..., description="Full article text content")
    url: str = Field(default="", description="Article URL (optional)")
    is_sponsored: bool = Field(default=False, description="Whether the article is sponsored")
    model: str = Field(default="gpt-4o-mini", description="OpenAI model to use")
    force: bool = Field(default=False, description="Re-analyze even if already exists")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "Critical Zero-Day Vulnerability Discovered in Popular CMS",
                "content": "Security researchers at XYZ Labs have discovered a critical zero-day vulnerability (CVE-2025-9999) affecting millions of websites running the popular CMS platform. The vulnerability allows remote code execution without authentication. Organizations are urged to apply the emergency patch immediately. The flaw was found in the file upload functionality and has already been exploited in the wild by threat actors...",
                "url": "https://thehackernews.com/2025/11/critical-zero-day.html",
                "is_sponsored": False,
                "model": "gpt-4o-mini",
                "force": False
            }
        }
    )


@router.get("")
async def list_analyses(
    limit: int = Query(default=50, ge=1, le=200, description="Number of analyses to return", example=20),
    priority: Optional[str] = Query(default=None, description="Filter by priority level", example="critical")
):
    """
    Get all analyses.
    
    - **limit**: Maximum number of analyses to return (1-200)
    - **priority**: Filter by priority (critical, high, medium, low, info)
    """
    try:
        return get_all_analyses(limit=limit, priority=priority)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-url")
async def get_analysis_for_url(
    url: str = Query(..., description="Article URL to look up", example="https://thehackernews.com/2025/11/example-article.html")
):
    """
    Get analysis by article URL.
    
    Returns the analysis for a specific article URL, or 404 if not found.
    """
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
    model: str = Query(default="gpt-4o-mini", description="OpenAI model to use", example="gpt-4o-mini"),
    force: bool = Query(default=False, description="Re-analyze even if already exists", example=False)
):
    """
    Analyze an article from the database by ID.
    
    - **article_id**: Database ID of the article to analyze
    - **model**: OpenAI model (gpt-4o-mini, gpt-4o, gpt-4-turbo)
    - **force**: Set to true to re-analyze even if analysis already exists
    """
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
async def get_slack_format(
    analysis_id: str,
    format: str = Query(default="text", description="Output format: 'text' or 'blocks'", example="text")
):
    """
    Get analysis formatted for Slack.
    
    - **analysis_id**: UUID of the analysis
    - **format**: Output format ('text' for markdown, 'blocks' for Block Kit)
    """
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

