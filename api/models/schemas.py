"""
API Request/Response Schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Article(BaseModel):
    """Article from database"""
    id: Optional[int] = None
    url: str
    title: str
    thumbnail: Optional[str] = None
    text: Optional[str] = None
    tags: Optional[str] = None
    timestamp: Optional[str] = None
    source: Optional[str] = None
    is_sponsored: bool = False
    created_at: Optional[datetime] = None


class ArticleCreate(BaseModel):
    """Create new article"""
    url: str
    title: str
    thumbnail: Optional[str] = None
    text: Optional[str] = None
    tags: Optional[str] = None
    timestamp: Optional[str] = None
    source: Optional[str] = None
    is_sponsored: bool = False


class AnalysisResponse(BaseModel):
    """Analysis result with metadata"""
    id: Optional[str] = None
    article_url: str
    article_title: str
    headline: str
    tldr: str
    priority: str
    categories: list[str]
    content_type: str
    relevance_score: int
    confidence_score: int
    is_breaking_news: bool
    worth_full_read: bool
    regions: list[dict] = []
    analyzed_at: Optional[datetime] = None


class ScrapeResult(BaseModel):
    """Result of a scrape job"""
    new_articles: int
    analyzed: int = 0
    skipped: int
    errors: int
    timestamp: str


class SchedulerStatus(BaseModel):
    """Scheduler status"""
    running: bool
    next_run: Optional[str] = None
    job_count: int


class StatsResponse(BaseModel):
    """Database statistics"""
    total_articles: int
    total_analyses: int
    pending_analyses: int
    top_tags: dict[str, int] = {}

