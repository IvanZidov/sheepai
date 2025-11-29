"""
Notification Service
Handles sending notifications via Email and Slack based on user subscriptions.
"""

import logging
from datetime import datetime, timedelta
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from typing import List, Dict, Any

from ..config import BREVO_API_KEY, EMAIL_FROM_ADDRESS, FRONTEND_URL
from ..database import get_supabase
from ..models.article import ArticleAnalysis
from .slack import send_slack_message, format_notification_blocks

logger = logging.getLogger(__name__)

# Configure Brevo
if BREVO_API_KEY:
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = BREVO_API_KEY
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
else:
    api_instance = None


def match_subscription(article: dict, filters: dict) -> bool:
    """
    Check if an article matches the subscription filters.
    Filters schema:
    {
        "techStack": ["Python", "AI"],
        "priority": ["CRITICAL", "HIGH"],
        "alertThreshold": 50, # 0-100
        "targetedEntities": ["Google", "Microsoft"]
    }
    """
    try:
        # 1. Alert Threshold (relevance_score is 1-10, threshold is 0-100)
        threshold = filters.get("alertThreshold", 0)
        if (article.get("relevance_score", 0) * 10) < threshold:
            return False

        # 2. Priority
        priorities = filters.get("priority", [])
        article_priority = article.get("priority", "").upper()
        if priorities:
            normalized_priorities = [p.upper() for p in priorities]
            if article_priority not in normalized_priorities:
                return False

        # 3. Targeted Entities
        targeted = filters.get("targetedEntities", [])
        if targeted:
            article_entities = [e.get("name", "").lower() for e in article.get("affected_entities", [])]
            if not any(t.lower() in article_entities for t in targeted):
                return False

        # 4. Tech Stack
        tech_stack = filters.get("techStack", [])
        if tech_stack:
            article_tech = [t.lower() for t in article.get("mentioned_technologies", [])]
            article_cats = [c.lower() for c in article.get("categories", [])]
            
            has_match = False
            for tech in tech_stack:
                t_lower = tech.lower()
                if t_lower in article_tech or t_lower in article_cats:
                    has_match = True
                    break
            
            if not has_match and article_priority != "CRITICAL":
                return False

        return True

    except Exception as e:
        logger.error(f"Error matching subscription: {e}")
        return False


def send_email(to_email: str, subject: str, html_content: str):
    """Send an email using Brevo"""
    if not api_instance:
        logger.warning("BREVO_API_KEY not set, skipping email")
        return

    try:
        sender = {"name": "CyberShepherd News", "email": EMAIL_FROM_ADDRESS}
        to = [{"email": to_email}]
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=to,
            sender=sender,
            subject=subject,
            html_content=html_content
        )
        
        api_instance.send_transac_email(send_smtp_email)
        logger.info(f"Email sent to {to_email}: {subject}")
    except ApiException as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error sending email: {e}")


def get_priority_color(priority: str) -> str:
    """Get color code for priority level."""
    return {
        "CRITICAL": "#ef4444",
        "HIGH": "#f59e0b",
        "MEDIUM": "#eab308",
        "LOW": "#22c55e",
        "INFO": "#3b82f6"
    }.get(priority.upper(), "#3b82f6")


def format_email_wrapper(title: str, content: str, subtitle: str = "") -> str:
    """Wrap content in branded email template."""
    return f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #10b981; font-size: 24px; margin: 0; letter-spacing: -0.5px;">🐑 CyberShepherd</h1>
            <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 14px;">Security Intelligence Report</p>
        </div>
        
        <div style="margin-bottom: 24px; text-align: center;">
            <h2 style="color: #111827; font-size: 20px; margin: 0 0 8px 0;">{title}</h2>
            {f'<p style="color: #4b5563; margin: 0; font-size: 15px;">{subtitle}</p>' if subtitle else ''}
        </div>

        {content}
        
        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Manage your subscriptions in your dashboard.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">
                © {datetime.now().year} CyberShepherd. All rights reserved.
            </p>
        </div>
    </div>
    """


def format_article_html(article: dict) -> str:
    """Format a single article for email using card style."""
    priority = article.get("priority", "INFO").upper()
    priority_color = get_priority_color(priority)
    
    # Format key takeaways
    takeaways = article.get("key_takeaways", [])
    takeaways_html = ""
    if takeaways:
        takeaways_html = "<ul style='margin: 0; padding-left: 20px; color: #374151;'>"
        for t in takeaways[:3]:
            point = t.get("point", "") if isinstance(t, dict) else str(t)
            takeaways_html += f"<li style='margin-bottom: 6px; font-size: 14px;'>{point}</li>"
        takeaways_html += "</ul>"
    
    # Format technologies
    technologies = article.get("mentioned_technologies", [])[:5]
    tech_html = ""
    if technologies:
        tech_items = [
            f'<span style="display: inline-block; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 4px; margin-bottom: 4px; font-weight: 500;">{t}</span>'
            for t in technologies
        ]
        tech_html = f"""
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f3f4f6;">
            <div style="margin-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; font-weight: 600;">Technologies</div>
            <div>{''.join(tech_items)}</div>
        </div>
        """

    internal_url = f"{FRONTEND_URL}/article/{article.get('id')}"

    return f"""
    <div style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        <div style="padding: 20px; border-bottom: 1px solid #f3f4f6; background-color: #ffffff;">
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
                <span style="background-color: {priority_color}15; color: {priority_color}; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em;">
                    {priority}
                </span>
                <span style="margin-left: auto; color: #6b7280; font-size: 12px; font-weight: 500;">
                    Relevance: {article.get('relevance_score', 0)}/10
                </span>
            </div>
            
            <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 18px; line-height: 1.4;">
                <a href="{internal_url}" style="color: #111827; text-decoration: none;">
                    {article.get('headline', 'No Headline')}
                </a>
            </h3>
            
            <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.6;">
                {article.get('short_summary', '')}
            </p>
        </div>
        
        <div style="padding: 20px; background-color: #f9fafb;">
            <div style="margin-bottom: 8px; font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; font-weight: 600;">
                Key Takeaways
            </div>
            {takeaways_html}
            {tech_html}
        </div>
        
        <div style="padding: 12px 20px; background-color: #f0fdf4; border-top: 1px solid #dcfce7; text-align: center;">
            <a href="{internal_url}" 
               style="display: inline-block; background-color: #10b981; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 600; margin-right: 12px;">
               View Analysis
            </a>
            <a href="{article.get('article_url', '#')}" 
               style="display: inline-block; color: #6b7280; text-decoration: none; font-size: 13px; font-weight: 500;">
               Read Source →
            </a>
        </div>
    </div>
    """


def process_notifications(articles: List[Dict[str, Any]]):
    """
    Process immediate notifications for new articles.
    """
    if not articles:
        return

    logger.info(f"Processing notifications for {len(articles)} new articles...")
    supabase = get_supabase()

    try:
        subs_response = supabase.table("subscriptions") \
            .select("*, users:user_id(email)") \
            .eq("is_active", True) \
            .eq("frequency", "immediate") \
            .execute()
        
        subscriptions = subs_response.data
    except Exception as e:
        logger.error(f"Error fetching subscriptions: {e}")
        return

    if not subscriptions:
        logger.info("No active immediate subscriptions found.")
        return

    for sub in subscriptions:
        matches = []
        for article in articles:
            if match_subscription(article, sub.get("filters", {})):
                matches.append(article)
        
        if not matches:
            continue

        channels = sub.get("channels", [])
        user_email = sub.get("users", {}).get("email")
        user_id = sub.get("user_id")

        # Send Email notifications
        if "email" in channels and user_email:
            title = f"🚨 {len(matches)} New Security Alert{'s' if len(matches) > 1 else ''}"
            content = "".join([format_article_html(a) for a in matches])
            subtitle = f"Found {len(matches)} article(s) matching \"{sub.get('name')}\""
            
            html_body = format_email_wrapper(title, content, subtitle)
            send_email(user_email, title, html_body)

        # Send Slack notifications
        if "slack" in channels and user_id:
            send_slack_notifications(user_id, matches)


def send_slack_notifications(user_id: str, articles: List[Dict[str, Any]]):
    """
    Send Slack notifications for matching articles.
    Looks up user's Slack connection and sends messages.
    """
    supabase = get_supabase()
    
    try:
        # Get user's Slack connection
        result = supabase.table("slack_connections") \
            .select("access_token, channel_id, channel_name") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        if not result.data:
            logger.debug(f"No Slack connection for user {user_id}")
            return
        
        slack_data = result.data
        access_token = slack_data.get("access_token")
        channel_id = slack_data.get("channel_id")
        
        if not access_token or not channel_id:
            logger.debug(f"Slack not fully configured for user {user_id}")
            return
        
        # Send each article as a separate message
        for article in articles:
            blocks = format_notification_blocks(article)
            fallback_text = f"🚨 {article.get('headline', 'New Alert')}"
            
            success = send_slack_message(
                access_token=access_token,
                channel_id=channel_id,
                blocks=blocks,
                text=fallback_text,
            )
            
            if success:
                logger.info(f"Slack notification sent for article: {article.get('headline', 'Unknown')[:50]}")
            else:
                logger.warning(f"Failed to send Slack notification for article: {article.get('headline', 'Unknown')[:50]}")
                
    except Exception as e:
        logger.error(f"Error sending Slack notifications: {e}")


def send_weekly_summaries():
    """
    Send weekly summaries to subscribed users.
    """
    logger.info("Sending weekly summaries...")
    supabase = get_supabase()
    
    try:
        subs_response = supabase.table("subscriptions") \
            .select("*, users:user_id(email)") \
            .eq("is_active", True) \
            .eq("frequency", "weekly") \
            .execute()
        subscriptions = subs_response.data
    except Exception as e:
        logger.error(f"Error fetching weekly subscriptions: {e}")
        return

    if not subscriptions:
        return

    seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()
    try:
        articles_response = supabase.table("article_analyses") \
            .select("*") \
            .gte("analyzed_at", seven_days_ago) \
            .execute()
        recent_articles = articles_response.data
    except Exception as e:
        logger.error(f"Error fetching recent articles: {e}")
        return

    if not recent_articles:
        logger.info("No articles from last 7 days.")
        return

    for sub in subscriptions:
        matches = []
        for article in recent_articles:
            if match_subscription(article, sub.get("filters", {})):
                matches.append(article)
        
        if not matches:
            continue

        matches.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
        top_matches = matches[:10]

        user_email = sub.get("users", {}).get("email")
        user_id = sub.get("user_id")
        channels = sub.get("channels", [])

        # Send Email digest
        if "email" in channels and user_email:
            title = f"📅 Weekly Security Digest"
            subtitle = f"Top stories for \"{sub.get('name')}\""
            
            content = "".join([format_article_html(a) for a in top_matches])
            
            if len(matches) > len(top_matches):
                remaining = len(matches) - len(top_matches)
                content += f"""
                <div style="text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px; color: #6b7280; font-size: 14px;">
                    And {remaining} more articles... <br>
                    <a href="#" style="color: #10b981; text-decoration: none;">View all in dashboard</a>
                </div>
                """
                
            html_body = format_email_wrapper(title, content, subtitle)
            send_email(user_email, f"{title}: {len(matches)} Articles", html_body)
        
        # Send Slack digest
        if "slack" in channels and user_id:
            send_slack_weekly_digest(user_id, sub.get('name', 'Weekly Digest'), top_matches, len(matches))

    logger.info("Weekly summaries sent.")


def send_slack_weekly_digest(user_id: str, sub_name: str, articles: List[Dict[str, Any]], total_count: int):
    """
    Send weekly Slack digest with top articles.
    """
    supabase = get_supabase()
    
    try:
        result = supabase.table("slack_connections") \
            .select("access_token, channel_id") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        if not result.data:
            return
        
        access_token = result.data.get("access_token")
        channel_id = result.data.get("channel_id")
        
        if not access_token or not channel_id:
            return
        
        # Build digest blocks
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"📅 Weekly Digest: {sub_name}",
                    "emoji": True,
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"Here are the top *{len(articles)}* stories from *{total_count}* matching articles this week."
                }
            },
            {"type": "divider"},
        ]
        
        # Add each article
        for i, article in enumerate(articles[:5], 1):
            priority = article.get("priority", "INFO").upper()
            priority_emoji = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}.get(priority, "🔵")
            headline = article.get("headline", "No headline")
            article_url = article.get("article_url", "")
            
            article_text = f"*{i}. {priority_emoji} {headline}*"
            if article_url:
                article_text = f"*{i}. {priority_emoji} <{article_url}|{headline}>*"
            
            blocks.append({
                "type": "section",
                "text": {"type": "mrkdwn", "text": article_text}
            })
        
        if total_count > 5:
            blocks.append({
                "type": "context",
                "elements": [{"type": "mrkdwn", "text": f"_And {total_count - 5} more articles..._"}]
            })
        
        blocks.append({"type": "divider"})
        blocks.append({
            "type": "context",
            "elements": [{"type": "mrkdwn", "text": "📰 _CyberShepherd Weekly Digest_"}]
        })
        
        send_slack_message(
            access_token=access_token,
            channel_id=channel_id,
            blocks=blocks,
            text=f"📅 Weekly Digest: {len(articles)} articles matching '{sub_name}'",
        )
        
    except Exception as e:
        logger.error(f"Error sending Slack weekly digest: {e}")
