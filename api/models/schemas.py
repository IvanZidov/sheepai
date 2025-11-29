"""
API Request/Response Schemas
"""

from pydantic import BaseModel, ConfigDict
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
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": 42,
                "url": "https://thehackernews.com/2025/11/critical-vulnerability-found.html",
                "title": "Critical Vulnerability Found in Popular Framework",
                "thumbnail": "https://example.com/image.jpg",
                "text": "Security researchers have discovered a critical vulnerability affecting millions of users...",
                "tags": "Vulnerability / Security / CVE",
                "timestamp": "Nov 29, 2025",
                "source": "The Hacker News",
                "is_sponsored": False,
                "created_at": "2025-11-29T12:00:00Z"
            }
        }
    )


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
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "url": "https://thehackernews.com/2025/11/new-ai-security-tool.html",
                "title": "New AI-Powered Security Tool Detects Zero-Day Attacks",
                "thumbnail": "https://example.com/ai-security.jpg",
                "text": "A groundbreaking AI tool has been released that can detect zero-day attacks in real-time...",
                "tags": "AI / Security / Tools",
                "timestamp": "Nov 29, 2025",
                "source": "Security Weekly",
                "is_sponsored": False
            }
        }
    )


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
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "article_url": "https://thehackernews.com/2025/11/critical-vulnerability-found.html",
                "article_title": "Critical Vulnerability Found in Popular Framework",
                "headline": "🚨 Major Security Flaw Affects 10M+ Users",
                "tldr": "A critical RCE vulnerability (CVE-2025-1234) has been discovered in a widely-used framework. Patches are available and immediate updating is recommended.",
                "priority": "critical",
                "categories": ["vulnerability", "security", "cve"],
                "content_type": "breaking_news",
                "relevance_score": 9,
                "confidence_score": 8,
                "is_breaking_news": True,
                "worth_full_read": True,
                "regions": [
                    {"region": "global", "flag": "🌍"},
                    {"region": "usa", "flag": "🇺🇸"}
                ],
                "analyzed_at": "2025-11-29T12:30:00Z"
            }
        }
    )


class ScrapeResult(BaseModel):
    """Result of a scrape job"""
    new_articles: int
    analyzed: int = 0
    skipped: int
    errors: int
    timestamp: str
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "new_articles": 5,
                "analyzed": 5,
                "skipped": 7,
                "errors": 0,
                "timestamp": "2025-11-29T12:00:00Z"
            }
        }
    )


class SchedulerStatus(BaseModel):
    """Scheduler status"""
    running: bool
    next_run: Optional[str] = None
    job_count: int
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "running": True,
                "next_run": "2025-11-29T13:00:00Z",
                "job_count": 1
            }
        }
    )


class StatsResponse(BaseModel):
    """Database statistics"""
    total_articles: int
    total_analyses: int
    pending_analyses: int
    top_tags: dict[str, int] = {}
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total_articles": 150,
                "total_analyses": 142,
                "pending_analyses": 8,
                "top_tags": {
                    "Security": 45,
                    "AI": 32,
                    "Vulnerability": 28,
                    "Privacy": 20,
                    "Cloud": 15
                }
            }
        }
    )


class AnalyzeRequest(BaseModel):
    """Request to analyze an article"""
    url: str
    title: str
    content: str
    is_sponsored: bool = False
    model: Optional[str] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "url": "https://example.com/article",
                "title": "How to Secure Your Cloud Infrastructure in 2025",
                "content": "Cloud security has become increasingly important as organizations migrate more workloads to the cloud. This comprehensive guide covers the essential steps to secure your cloud infrastructure, including identity management, network security, and data encryption best practices...",
                "is_sponsored": False,
                "model": "gpt-4o-mini"
            }
        }
    )


class BatchAnalyzeRequest(BaseModel):
    """Request to batch analyze multiple articles"""
    article_ids: Optional[list[int]] = None
    limit: int = 10
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "article_ids": [1, 2, 3, 4, 5],
                "limit": 10
            }
        }
    )


class BatchAnalyzeResponse(BaseModel):
    """Response from batch analysis"""
    total: int
    analyzed: int
    errors: int
    skipped: int
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total": 10,
                "analyzed": 8,
                "errors": 1,
                "skipped": 1
            }
        }
    )

