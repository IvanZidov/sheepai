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
