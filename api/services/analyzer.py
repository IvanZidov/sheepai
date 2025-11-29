"""
Article Analyzer Service
Uses LangChain + OpenAI for structured analysis
"""

import os
import logging
from typing import Optional

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from ..config import OPENAI_API_KEY, OPENAI_MODEL
from ..database import get_supabase
from ..models.article import ArticleAnalysis

logger = logging.getLogger(__name__)


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


def get_llm(model: str = None) -> ChatOpenAI:
    """Get LangChain ChatOpenAI instance with structured output"""
    return ChatOpenAI(
        model=model or OPENAI_MODEL,
        temperature=0.3,
        api_key=OPENAI_API_KEY
    ).with_structured_output(ArticleAnalysis)


def analyze_article(
    title: str,
    content: str,
    url: str = "",
    is_sponsored: bool = False,
    model: str = None
) -> ArticleAnalysis:
    """
    Analyze an article using LangChain structured outputs.
    """
    llm = get_llm(model)
    
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
    
    result = chain.invoke({
        "title": title,
        "url": url,
        "is_sponsored": is_sponsored,
        "content": content
    })
    
    # Set the is_sponsored flag from input
    result.is_sponsored = is_sponsored
    
    return result


def save_analysis(
    analysis: ArticleAnalysis,
    article_url: str,
    article_title: str,
    article_id: Optional[int] = None,
    model_used: str = None
) -> dict:
    """Save article analysis to Supabase."""
    supabase = get_supabase()
    
    data = {
        "article_url": article_url,
        "article_title": article_title,
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
        "model_used": model_used or OPENAI_MODEL,
    }
    
    if article_id:
        data["article_id"] = article_id
    
    result = supabase.table("article_analyses").upsert(
        data,
        on_conflict="article_url"
    ).execute()
    
    return result.data[0] if result.data else None


def get_analysis_by_url(url: str) -> Optional[dict]:
    """Get existing analysis for an article URL"""
    supabase = get_supabase()
    result = supabase.table("article_analyses").select("*").eq("article_url", url).execute()
    return result.data[0] if result.data else None


def get_all_analyses(limit: int = 50, priority: Optional[str] = None) -> list[dict]:
    """Get all analyses, optionally filtered by priority"""
    supabase = get_supabase()
    query = supabase.table("article_analyses").select("*").order("analyzed_at", desc=True).limit(limit)
    
    if priority:
        query = query.eq("priority", priority)
    
    result = query.execute()
    return result.data


def analyze_and_save(
    title: str,
    content: str,
    url: str,
    article_id: Optional[int] = None,
    is_sponsored: bool = False,
    model: str = None,
    force: bool = False
) -> tuple[Optional[ArticleAnalysis], dict]:
    """
    Analyze an article and save to database.
    """
    # Check if already analyzed
    if not force:
        existing = get_analysis_by_url(url)
        if existing:
            return None, existing
    
    # Analyze
    analysis = analyze_article(
        title=title,
        content=content,
        url=url,
        is_sponsored=is_sponsored,
        model=model
    )
    
    # Save
    saved = save_analysis(
        analysis=analysis,
        article_url=url,
        article_title=title,
        article_id=article_id,
        model_used=model
    )
    
    return analysis, saved

