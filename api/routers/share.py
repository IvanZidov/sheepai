"""
Share Router
Handles sharing articles via Email and Slack.
"""

import logging
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
import jwt

from ..database import get_supabase
from ..config import FRONTEND_URL
from ..services.notifier import send_email, format_article_html
from ..services.slack import send_slack_message, format_notification_blocks

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/share", tags=["share"])


def get_user_id_from_token(authorization: str) -> Optional[str]:
    """Extract user_id from Supabase JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload.get("sub")
    except Exception as e:
        logger.error(f"Failed to decode token: {e}")
        return None


class ShareEmailRequest(BaseModel):
    article_id: str
    recipient_emails: List[EmailStr]
    personal_message: Optional[str] = None


class ShareSlackRequest(BaseModel):
    article_id: str
    personal_message: Optional[str] = None


class ShareResponse(BaseModel):
    success: bool
    message: str


def get_article_by_id(article_id: str) -> Optional[dict]:
    """Fetch article from database by ID."""
    supabase = get_supabase()
    
    try:
        result = supabase.table("article_analyses") \
            .select("*") \
            .eq("id", article_id) \
            .single() \
            .execute()
        
        return result.data
    except Exception as e:
        logger.error(f"Failed to fetch article {article_id}: {e}")
        return None


def format_share_email_html(article: dict, personal_message: Optional[str] = None) -> str:
    """Format article for sharing via email."""
    message_section = ""
    if personal_message:
        message_section = f"""
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 4px;">
            <p style="margin: 0; color: #166534; font-style: italic;">"{personal_message}"</p>
        </div>
        """
    
    priority = article.get("priority", "INFO").upper()
    priority_colors = {
        "CRITICAL": "#ef4444",
        "HIGH": "#f59e0b",
        "MEDIUM": "#eab308",
        "LOW": "#22c55e",
        "INFO": "#3b82f6"
    }
    priority_color = priority_colors.get(priority, "#3b82f6")
    
    # Format key takeaways
    takeaways = article.get("key_takeaways", [])
    takeaways_html = ""
    if takeaways:
        takeaways_html = "<ul style='margin: 0; padding-left: 20px;'>"
        for t in takeaways[:5]:
            point = t.get("point", "") if isinstance(t, dict) else str(t)
            takeaways_html += f"<li style='margin-bottom: 8px;'>{point}</li>"
        takeaways_html += "</ul>"
    
    # Format technologies
    technologies = article.get("mentioned_technologies", [])[:6]
    tech_html = " ".join([
        f'<span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-right: 4px;">{t}</span>'
        for t in technologies
    ]) if technologies else ""
    
    return f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #10b981; font-size: 24px; margin: 0;">🐑 CyberShepherd</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Security Intelligence Report</p>
        </div>
        
        {message_section}
        
        <div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: inline-block; background-color: {priority_color}20; color: {priority_color}; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 12px;">
                    {priority} PRIORITY
                </div>
                <h2 style="margin: 0 0 12px 0; color: #111827; font-size: 22px; line-height: 1.3;">
                    {article.get('headline', article.get('article_title', 'No Title'))}
                </h2>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Relevance Score: <strong>{article.get('relevance_score', 0)}/10</strong> • 
                    {article.get('read_time_minutes', 5)} min read
                </p>
            </div>
            
            <div style="padding: 20px; background-color: #f9fafb;">
                <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
                    📋 TL;DR
                </h3>
                <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6; font-style: italic;">
                    {article.get('tldr', article.get('short_summary', ''))}
                </p>
            </div>
            
            <div style="padding: 20px;">
                <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
                    🎯 Key Takeaways
                </h3>
                {takeaways_html}
            </div>
            
            {f'''
            <div style="padding: 0 20px 20px 20px;">
                <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
                    🔧 Technologies
                </h3>
                <div>{tech_html}</div>
            </div>
            ''' if tech_html else ''}
            
            <div style="padding: 20px; background-color: #f0fdf4; text-align: center;">
                <a href="{FRONTEND_URL}/article/{article.get('id')}" 
                   style="display: inline-block; background-color: #10b981; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; margin-right: 12px;">
                   View Analysis
                </a>
                <a href="{article.get('article_url', '#')}" 
                   style="display: inline-block; color: #6b7280; text-decoration: none; font-size: 13px; font-weight: 500;">
                    Read Source →
                </a>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Shared via CyberShepherd • AI-Powered Security Intelligence
            </p>
        </div>
    </div>
    """


def format_share_slack_blocks(article: dict, personal_message: Optional[str] = None) -> list:
    """Format article for sharing via Slack with optional personal message."""
    priority = article.get("priority", "INFO").upper()
    priority_emoji = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢", "INFO": "🔵"}.get(priority, "🔵")
    
    headline = article.get("headline", article.get("article_title", "No Title"))
    short_summary = article.get("short_summary", "")
    article_url = article.get("article_url", "")
    relevance_score = article.get("relevance_score", 0)
    
    blocks = []
    
    # Personal message if provided
    if personal_message:
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"💬 _{personal_message}_"}
        })
        blocks.append({"type": "divider"})
    
    # Header
    blocks.append({
        "type": "header",
        "text": {
            "type": "plain_text",
            "text": f"{priority_emoji} {headline[:100]}",
            "emoji": True,
        }
    })
    
    # Context
    blocks.append({
        "type": "context",
        "elements": [
            {"type": "mrkdwn", "text": f"*Priority:* {priority}"},
            {"type": "mrkdwn", "text": f"*Relevance:* {relevance_score}/10"},
            {"type": "mrkdwn", "text": f"⏱️ {article.get('read_time_minutes', 5)} min read"},
        ]
    })
    
    blocks.append({"type": "divider"})
    
    # Summary
    blocks.append({
        "type": "section",
        "text": {"type": "mrkdwn", "text": f"*📝 Summary*\n{short_summary[:500]}"}
    })
    
    # Key takeaways
    takeaways = article.get("key_takeaways", [])
    if takeaways:
        takeaways_text = ""
        for t in takeaways[:3]:
            point = t.get("point", "") if isinstance(t, dict) else str(t)
            takeaways_text += f"• {point}\n"
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*🎯 Key Takeaways*\n{takeaways_text}"}
        })
    
    # Technologies
    technologies = article.get("mentioned_technologies", [])[:5]
    if technologies:
        tech_text = " ".join([f"`{t}`" for t in technologies])
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*🔧 Technologies:* {tech_text}"}
        })
    
    blocks.append({"type": "divider"})
    
    # CTA
    actions_elements = []
    
    # Internal Link
    internal_url = f"{FRONTEND_URL}/article/{article.get('id')}"
    actions_elements.append({
        "type": "button",
        "text": {"type": "plain_text", "text": "🛡️ View Analysis", "emoji": True},
        "url": internal_url,
        "style": "primary"
    })
    
    # External Link
    if article_url:
        actions_elements.append({
            "type": "button",
            "text": {"type": "plain_text", "text": "🔗 Read Source", "emoji": True},
            "url": article_url
        })
        
    blocks.append({
        "type": "actions",
        "elements": actions_elements
    })
    
    return blocks


@router.post("/email", response_model=ShareResponse)
async def share_via_email(
    request: ShareEmailRequest,
    authorization: str = Header(None),
):
    """
    Share an article via email to one or more recipients.
    """
    # Get article
    article = get_article_by_id(request.article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Format email
    headline = article.get("headline", article.get("article_title", "Security Alert"))
    subject = f"🐑 CyberShepherd: {headline[:80]}"
    html_content = format_share_email_html(article, request.personal_message)
    
    # Send to all recipients
    sent_count = 0
    for email in request.recipient_emails:
        try:
            send_email(email, subject, html_content)
            sent_count += 1
        except Exception as e:
            logger.error(f"Failed to send share email to {email}: {e}")
    
    if sent_count == 0:
        raise HTTPException(status_code=500, detail="Failed to send any emails")
    
    return ShareResponse(
        success=True,
        message=f"Article shared with {sent_count} recipient(s)"
    )


@router.post("/slack", response_model=ShareResponse)
async def share_via_slack(
    request: ShareSlackRequest,
    authorization: str = Header(None),
):
    """
    Share an article via Slack to user's configured channel.
    """
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get article
    article = get_article_by_id(request.article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Get user's Slack connection
    supabase = get_supabase()
    
    try:
        result = supabase.table("slack_connections") \
            .select("access_token, channel_id, channel_name") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Slack not connected")
        
        access_token = result.data.get("access_token")
        channel_id = result.data.get("channel_id")
        channel_name = result.data.get("channel_name")
        
        if not access_token or not channel_id:
            raise HTTPException(status_code=400, detail="Slack channel not configured")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get Slack connection: {e}")
        raise HTTPException(status_code=500, detail="Failed to get Slack connection")
    
    # Format and send message
    blocks = format_share_slack_blocks(article, request.personal_message)
    headline = article.get("headline", "Shared Article")
    fallback_text = f"🐑 Shared: {headline}"
    
    success = send_slack_message(
        access_token=access_token,
        channel_id=channel_id,
        blocks=blocks,
        text=fallback_text,
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send Slack message")
    
    return ShareResponse(
        success=True,
        message=f"Article shared to #{channel_name}"
    )


@router.get("/slack/status")
async def get_slack_share_status(authorization: str = Header(None)):
    """
    Check if user can share via Slack (has connection and channel configured).
    """
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    supabase = get_supabase()
    
    try:
        result = supabase.table("slack_connections") \
            .select("channel_id, channel_name") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        if result.data and result.data.get("channel_id"):
            return {
                "can_share": True,
                "channel_name": result.data.get("channel_name"),
            }
    except Exception:
        pass
    
    return {"can_share": False, "channel_name": None}

