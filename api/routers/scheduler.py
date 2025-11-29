"""
Scheduler Router
APScheduler control endpoints
"""

from fastapi import APIRouter

router = APIRouter(prefix="/scheduler", tags=["scheduler"])

# Scheduler instance will be set from main.py
_scheduler = None


def set_scheduler(scheduler):
    """Set the scheduler instance"""
    global _scheduler
    _scheduler = scheduler


@router.get("/status")
async def get_scheduler_status():
    """Get scheduler status"""
    if _scheduler is None:
        return {"running": False, "next_run": None, "job_count": 0}
    
    jobs = _scheduler.get_jobs()
    next_run = None
    
    if jobs:
        next_run_time = jobs[0].next_run_time
        if next_run_time:
            next_run = next_run_time.isoformat()
    
    return {
        "running": _scheduler.running,
        "next_run": next_run,
        "job_count": len(jobs)
    }


@router.post("/pause")
async def pause_scheduler():
    """Pause the scheduler"""
    if _scheduler:
        _scheduler.pause()
    return {"status": "paused"}


@router.post("/resume")
async def resume_scheduler():
    """Resume the scheduler"""
    if _scheduler:
        _scheduler.resume()
    return {"status": "resumed"}

