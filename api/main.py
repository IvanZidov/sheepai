#!/usr/bin/env python3
"""
SheepAI News Analyzer API
Main FastAPI application entry point
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from .config import API_TITLE, API_VERSION, API_DESCRIPTION, SCRAPE_INTERVAL_HOURS
from .routers import articles_router, analysis_router, scheduler_router
from .routers.scheduler import set_scheduler
from .services.scraper import scrape_and_save

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Scheduler
scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Set scheduler for router
    set_scheduler(scheduler)
    
    # Start scheduler
    scheduler.add_job(
        scrape_and_save,
        IntervalTrigger(hours=SCRAPE_INTERVAL_HOURS),
        id="scrape_hackernews",
        name="Scrape The Hacker News",
        replace_existing=True
    )
    scheduler.start()
    logger.info(f"🚀 Scheduler started - scraping every {SCRAPE_INTERVAL_HOURS} hour(s)")
    
    # Run initial scrape on startup
    logger.info("Running initial scrape...")
    scrape_and_save()
    
    yield
    
    # Shutdown
    scheduler.shutdown()
    logger.info("Scheduler stopped")


# Create FastAPI app
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(articles_router)
app.include_router(analysis_router)
app.include_router(scheduler_router)


@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "ok",
        "service": API_TITLE,
        "version": API_VERSION
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

