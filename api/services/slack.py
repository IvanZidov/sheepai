"""
Slack Message Formatting Service
Handles OAuth, message formatting, and posting to Slack.
"""

import logging
from typing import Dict, List, Any, Optional

import httpx
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from ..config import SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_REDIRECT_URI, FRONTEND_URL
from ..models.article import ArticleAnalysis, REGION_FLAGS

logger = logging.getLogger(__name__)


PRIORITY_META = {
    "critical": {"emoji": "🔴", "label": "CRITICAL"},
    "high":     {"emoji": "🟠", "label": "HIGH"},
    "medium":   {"emoji": "🟡", "label": "MEDIUM"},
    "low":      {"emoji": "🟢", "label": "LOW"},
    "info":     {"emoji": "🔵", "label": "INFO"},
}

CATEGORY_META = {
    "security": "🔒", "vulnerability": "🛡️", "malware": "🦠", "data_breach": "📂",
    "privacy": "👁️", "programming": "💻", "web_dev": "🌐", "mobile_dev": "📱",
    "devops": "🔄", "open_source": "🌟", "ai_ml": "🤖", "llm": "🧠",
    "data_science": "📊", "automation": "⚙️", "cloud": "☁️", "infrastructure": "🏗️",
    "networking": "🌐", "database": "🗄️", "startup": "🚀", "enterprise": "🏢",
    "acquisition": "🤝", "funding": "💰", "layoffs": "📉", "product_launch": "🎉",
    "update": "🔄", "deprecation": "⚠️", "tool_release": "🔧", "tutorial": "📚",
    "guide": "📖", "best_practices": "✅", "case_study": "📋", "research": "🔬",
    "analysis": "📊", "trends": "📈", "opinion": "💭", "regulation": "📋",
    "compliance": "✅", "legal": "⚖️", "hardware": "🖥️", "gaming": "🎮",
    "crypto": "🪙", "other": "📰",
}

CONTENT_TYPE_META = {
    "breaking_news": "🚨", "news": "📰", "tutorial": "📚", "guide": "📖",
    "review": "⭐", "analysis": "🔍", "opinion": "💭", "announcement": "📢",
    "case_study": "📋", "interview": "🎙️", "research": "🔬", "roundup": "📑",
    "sponsored": "💰",
}


def format_slack_message(analysis: ArticleAnalysis, article_url: str = "") -> dict:
    """Convert ArticleAnalysis to Slack Block Kit format."""
    
    priority_emoji = PRIORITY_META.get(analysis.priority.value, {}).get("emoji", "🔵")
    
    # Build category tags
    tags = " ".join([
        f"{CATEGORY_META.get(c.value, '📰')} `{c.value.upper()}`"
        for c in analysis.categories
    ])
    
    content_type_emoji = CONTENT_TYPE_META.get(analysis.content_type.value, "📰")
    priority_emoji_map = {"immediate": "🚨", "soon": "⚡", "when_possible": "📌"}
    
    def score_bar(score: int) -> str:
        filled = "█" * score
        empty = "░" * (10 - score)
        return f"`{filled}{empty}` {score}/10"
    
    # Format key takeaways
    takeaways_text = ""
    for t in analysis.key_takeaways:
        bullet = "▸" if t.highlight else "•"
        point = f"*{t.point}*" if t.highlight else t.point
        tech_badge = " `🔧 Technical`" if t.is_technical else ""
        takeaways_text += f"{bullet} {point}{tech_badge}\n"
    
    # Format action items
    action_text = ""
    for a in analysis.action_items:
        action_text += f"{priority_emoji_map[a.priority]} *{a.action}*\n   └ _{a.target_audience}_\n"
    
    # Format affected entities
    affected_text = ", ".join([f"`{e.name}`" for e in analysis.affected_entities])
    
    # Build Slack blocks
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"{priority_emoji} {analysis.headline[:100]}",
                "emoji": True
            }
        },
        {
            "type": "context",
            "elements": [
                {"type": "mrkdwn", "text": f"{content_type_emoji} {analysis.content_type.value}"},
                {"type": "mrkdwn", "text": tags},
                {"type": "mrkdwn", "text": f"⏱️ {analysis.read_time_minutes} min"},
            ]
        },
    ]
    
    if analysis.is_breaking_news:
        blocks[1]["elements"].append({"type": "mrkdwn", "text": "🚨 *BREAKING*"})
    
    if analysis.is_sponsored:
        blocks[1]["elements"].append({"type": "mrkdwn", "text": "💰 _Sponsored_"})
    
    blocks.append({"type": "divider"})
    
    # TL;DR
    blocks.append({
        "type": "section",
        "text": {"type": "mrkdwn", "text": f"*📋 TL;DR*\n>{analysis.tldr}"}
    })
    
    # Summaries
    blocks.append({
        "type": "section",
        "text": {"type": "mrkdwn", "text": f"*📝 Quick Summary*\n{analysis.short_summary}"}
    })
    
    blocks.append({
        "type": "section",
        "text": {"type": "mrkdwn", "text": f"*📖 Detailed Summary*\n{analysis.long_summary}"}
    })
    
    # Key takeaways
    if takeaways_text:
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*🎯 Key Takeaways*\n{takeaways_text}"}
        })
    
    # Technologies
    if analysis.mentioned_technologies:
        tech_text = " ".join([f"`{t}`" for t in analysis.mentioned_technologies[:8]])
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*🔧 Technologies:* {tech_text}"}
        })
    
    # Companies
    if analysis.mentioned_companies:
        company_text = " ".join([f"`{c}`" for c in analysis.mentioned_companies[:8]])
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*🏢 Companies:* {company_text}"}
        })
    
    # Regions - using flag from the model
    if analysis.regions:
        region_tags = " ".join([f"{r.flag} `{r.region.value.upper()}`" for r in analysis.regions[:5]])
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*🌍 Regions:* {region_tags}"}
        })
    
    # Affected entities
    if affected_text:
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*👥 Relevant to:* {affected_text}"}
        })
    
    # Action items
    if action_text:
        blocks.append({
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*⚡ Action Items*\n{action_text}"}
        })
    
    blocks.append({"type": "divider"})
    
    # Scores
    blocks.append({
        "type": "section",
        "fields": [
            {"type": "mrkdwn", "text": f"*Relevance:*\n{score_bar(analysis.relevance_score)}"},
            {"type": "mrkdwn", "text": f"*Confidence:*\n{score_bar(analysis.confidence_score)}"},
        ]
    })
    
    # CTA
    read_indicator = "✅ *Worth the full read*" if analysis.worth_full_read else "📝 Summary covers the essentials"
    cta_block = {
        "type": "section",
        "text": {"type": "mrkdwn", "text": read_indicator},
    }
    
    if article_url:
        cta_block["accessory"] = {
            "type": "button",
            "text": {"type": "plain_text", "text": "📖 Read Full Article", "emoji": True},
            "url": article_url,
        }
        if analysis.worth_full_read:
            cta_block["accessory"]["style"] = "primary"
    
    blocks.append(cta_block)
    
    # Related topics
    if analysis.related_topics:
        topics = " • ".join(analysis.related_topics)
        blocks.append({
            "type": "context",
            "elements": [{"type": "mrkdwn", "text": f"🔍 Related: _{topics}_"}]
        })
    
    return {"blocks": blocks}


def format_slack_text(analysis: ArticleAnalysis, article_url: str = "") -> str:
    """Format analysis as plain Slack markdown text."""
    
    priority_emoji = PRIORITY_META.get(analysis.priority.value, {}).get("emoji", "🔵")
    
    tags = " ".join([
        f"{CATEGORY_META.get(c.value, '📰')}`{c.value}`"
        for c in analysis.categories
    ])
    
    lines = [
        f"{priority_emoji} *{analysis.headline}*",
        f"{tags} | ⏱️ {analysis.read_time_minutes} min",
        "",
        "*📋 TL;DR:*",
        f">{analysis.tldr}",
        "",
        "*📝 Quick Summary:*",
        analysis.short_summary,
        "",
        "*📖 Detailed:*",
        analysis.long_summary,
        "",
        "*🎯 Key Takeaways:*",
    ]
    
    for t in analysis.key_takeaways:
        bullet = "▸" if t.highlight else "•"
        lines.append(f"{bullet} {t.point}")
    
    if analysis.action_items:
        lines.append("")
        lines.append("*Action Items:*")
        for a in analysis.action_items:
            emoji = {"immediate": "🚨", "soon": "⚡", "when_possible": "📌"}[a.priority]
            lines.append(f"{emoji} {a.action} _{a.target_audience}_")
    
    if analysis.mentioned_technologies:
        lines.append("")
        lines.append(f"*Tech:* {' '.join([f'`{t}`' for t in analysis.mentioned_technologies[:5]])}")
    
    # Regions with flags from model
    if analysis.regions:
        regions_text = " ".join([f"{r.flag}`{r.region.value}`" for r in analysis.regions[:3]])
        lines.append("")
        lines.append(f"*Regions:* {regions_text}")
    
    lines.append("")
    lines.append(f"Relevance: {'█' * analysis.relevance_score}{'░' * (10-analysis.relevance_score)} {analysis.relevance_score}/10")
    
    if article_url:
        lines.append("")
        lines.append(f"<{article_url}|📖 Read Full Article>")
    
    return "\n".join(lines)


# ============================================================================
# OAuth Functions
# ============================================================================

async def exchange_code_for_token(code: str) -> Dict[str, Any]:
    """
    Exchange OAuth authorization code for access token.
    
    Args:
        code: The authorization code from Slack OAuth callback
        
    Returns:
        Dict containing access_token, team_id, team_name, bot_user_id, scope
        
    Raises:
        Exception if token exchange fails
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://slack.com/api/oauth.v2.access",
            data={
                "client_id": SLACK_CLIENT_ID,
                "client_secret": SLACK_CLIENT_SECRET,
                "code": code,
                "redirect_uri": SLACK_REDIRECT_URI,
            },
        )
        
        data = response.json()
        
        if not data.get("ok"):
            error = data.get("error", "Unknown error")
            logger.error(f"Slack OAuth token exchange failed: {error}")
            raise Exception(f"Slack OAuth failed: {error}")
        
        return {
            "access_token": data["access_token"],
            "team_id": data["team"]["id"],
            "team_name": data["team"].get("name"),
            "bot_user_id": data.get("bot_user_id"),
            "scope": data.get("scope"),
        }


async def list_user_channels(access_token: str) -> List[Dict[str, str]]:
    """
    List available Slack channels using the bot token.
    
    Args:
        access_token: Slack bot access token
        
    Returns:
        List of channel dicts with id, name, is_private
    """
    client = WebClient(token=access_token)
    channels = []
    
    try:
        # Get public channels
        result = client.conversations_list(
            types="public_channel,private_channel",
            exclude_archived=True,
            limit=200,
        )
        
        for channel in result.get("channels", []):
            channels.append({
                "id": channel["id"],
                "name": channel["name"],
                "is_private": channel.get("is_private", False),
            })
        
        # Sort by name
        channels.sort(key=lambda x: x["name"])
        
    except SlackApiError as e:
        logger.error(f"Failed to list Slack channels: {e.response['error']}")
        raise Exception(f"Failed to list channels: {e.response['error']}")
    
    return channels


def send_slack_message(
    access_token: str,
    channel_id: str,
    blocks: List[Dict[str, Any]],
    text: Optional[str] = None,
) -> bool:
    """
    Send a message to a Slack channel.
    
    Args:
        access_token: Slack bot access token
        channel_id: Target channel ID
        blocks: Slack Block Kit blocks
        text: Fallback text (optional)
        
    Returns:
        True if successful, False otherwise
    """
    client = WebClient(token=access_token)
    
    try:
        client.chat_postMessage(
            channel=channel_id,
            blocks=blocks,
            text=text or "New security alert from CyberShepherd",
        )
        logger.info(f"Slack message sent to channel {channel_id}")
        return True
        
    except SlackApiError as e:
        logger.error(f"Failed to send Slack message: {e.response['error']}")
        return False


def format_notification_blocks(article: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Format an article dict (from database) into Slack Block Kit blocks.
    Rich formatting similar to format_slack_message but for dict input.
    
    Args:
        article: Article data dict from database
        
    Returns:
        List of Slack Block Kit blocks
    """
    priority = article.get("priority", "INFO").upper()
    priority_emoji = PRIORITY_META.get(priority.lower(), {}).get("emoji", "🔵")
    
    headline = article.get("headline", "New Alert")
    short_summary = article.get("short_summary", "")
    article_url = article.get("article_url", "")
    relevance_score = article.get("relevance_score", 0)
    read_time = article.get("read_time_minutes", 5)
    
    # Context elements
    context_elements = [
        {"type": "mrkdwn", "text": f"*Priority:* {priority}"},
        {"type": "mrkdwn", "text": f"*Relevance:* {relevance_score}/10"},
        {"type": "mrkdwn", "text": f"⏱️ {read_time} min"},
    ]
    
    # Build blocks
    blocks = [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": f"{priority_emoji} {headline[:100]}",
                "emoji": True,
            }
        },
        {
            "type": "context",
            "elements": context_elements
        },
        {"type": "divider"},
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"*📝 Summary*\n{short_summary}"}
        },
    ]
    
    # Key Takeaways
    takeaways = article.get("key_takeaways", [])
    if takeaways:
        takeaways_text = ""
        for t in takeaways[:3]:
            point = t.get("point", "") if isinstance(t, dict) else str(t)
            takeaways_text += f"• {point}\n"
        
        if takeaways_text:
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

    # Action Items (if any)
    action_items = article.get("action_items", [])
    if action_items:
        action_text = ""
        for a in action_items[:2]: # Limit to 2
            if isinstance(a, dict):
                action = a.get("action", "")
                priority_a = a.get("priority", "when_possible")
                emoji = {"immediate": "🚨", "soon": "⚡", "when_possible": "📌"}.get(priority_a, "📌")
                action_text += f"{emoji} {action}\n"
            else:
                action_text += f"📌 {str(a)}\n"
        
        if action_text:
            blocks.append({
                "type": "section",
                "text": {"type": "mrkdwn", "text": f"*⚡ Action Items*\n{action_text}"}
            })

    blocks.append({"type": "divider"})

    # CTA Buttons
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

