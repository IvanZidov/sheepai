"""
Configuration and environment variables
"""

import os
from dotenv import load_dotenv

load_dotenv()

# API Settings
API_TITLE = "CyberShepherd News Analyzer"
API_VERSION = "1.0.0"
API_DESCRIPTION = "AI-powered news scraping and analysis"

# OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Email (Brevo)
BREVO_API_KEY = os.getenv("BREVO_API_KEY")
EMAIL_FROM_ADDRESS = os.getenv("EMAIL_FROM_ADDRESS", "noreply@yourdomain.com")

# Scraping
HACKERNEWS_URL = "https://thehackernews.com/"
SCRAPE_INTERVAL_HOURS = int(os.getenv("SCRAPE_INTERVAL_HOURS", "1"))
REQUEST_DELAY = float(os.getenv("REQUEST_DELAY", "1.5"))

# Slack OAuth
SLACK_CLIENT_ID = os.getenv("SLACK_CLIENT_ID")
SLACK_CLIENT_SECRET = os.getenv("SLACK_CLIENT_SECRET")
SLACK_REDIRECT_URI = os.getenv("SLACK_REDIRECT_URI", "http://localhost:8000/slack/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# JWT Secret for Slack OAuth State
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
