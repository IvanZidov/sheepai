"""
Slack Message Formatting Service
"""

from ..models.article import ArticleAnalysis, REGION_FLAGS


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

