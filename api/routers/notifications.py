"""
Notifications Router
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from ..services.notifier import send_email

router = APIRouter(prefix="/notifications", tags=["notifications"])


class TestEmailRequest(BaseModel):
    email: EmailStr


@router.post("/test-email")
async def test_email(request: TestEmailRequest):
    """
    Send a test email to the specified address.
    """
    try:
        subject = "Test Notification from SheepAI"
        html_content = """
        <div style="padding: 20px; font-family: sans-serif;">
            <h2>🧪 Test Notification</h2>
            <p>This is a test email from your SheepAI News Analyzer.</p>
            <p>If you received this, your email configuration is working correctly! 🎉</p>
            <hr>
            <p style="font-size: 12px; color: #666;">SheepAI Bot 🐑</p>
        </div>
        """
        
        send_email(request.email, subject, html_content)
        
        return {"status": "success", "message": f"Test email sent to {request.email}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

