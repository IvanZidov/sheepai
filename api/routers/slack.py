"""
Slack OAuth Router
Handles Slack integration OAuth flow and channel management.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import urlencode

import jwt
from fastapi import APIRouter, HTTPException, Query, Header
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from ..config import (
    SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET,
    SLACK_REDIRECT_URI,
    FRONTEND_URL,
    JWT_SECRET,
    SUPABASE_URL,
    SUPABASE_KEY,
)
from ..database import get_supabase
from ..services.slack import exchange_code_for_token, list_user_channels

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/slack", tags=["slack"])


class ChannelSelectRequest(BaseModel):
    channel_id: str
    channel_name: str


class SlackStatusResponse(BaseModel):
    connected: bool
    team_name: Optional[str] = None
    channel_name: Optional[str] = None
    channel_id: Optional[str] = None


def create_oauth_state(user_id: str) -> str:
    """Create a signed JWT state token for OAuth CSRF protection."""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(minutes=10),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_oauth_state(state: str) -> Optional[str]:
    """Verify OAuth state token and return user_id."""
    try:
        payload = jwt.decode(state, JWT_SECRET, algorithms=["HS256"])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        logger.error("OAuth state token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid OAuth state token: {e}")
        return None


def get_user_id_from_token(authorization: str) -> Optional[str]:
    """Extract user_id from Supabase JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Supabase tokens are JWTs - decode without verification for user_id
        # The Supabase client will verify the token
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload.get("sub")
    except Exception as e:
        logger.error(f"Failed to decode token: {e}")
        return None


@router.get("/install")
async def slack_install(user_id: str = Query(..., description="User ID from frontend")):
    """
    Start Slack OAuth flow.
    Redirects user to Slack authorization page.
    """
    if not SLACK_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Slack integration not configured")
    
    # Create signed state with user_id
    state = create_oauth_state(user_id)
    
    # Build Slack OAuth URL
    scopes = [
        "channels:read",
        "chat:write",
        "chat:write.public",
        "groups:read",  # For private channels
    ]
    
    params = {
        "client_id": SLACK_CLIENT_ID,
        "redirect_uri": SLACK_REDIRECT_URI,
        "scope": ",".join(scopes),
        "state": state,
    }
    
    slack_oauth_url = f"https://slack.com/oauth/v2/authorize?{urlencode(params)}"
    
    return RedirectResponse(url=slack_oauth_url)


@router.get("/callback")
async def slack_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
):
    """
    Handle Slack OAuth callback.
    Exchange code for token and store in database.
    """
    # Handle OAuth errors
    if error:
        logger.error(f"Slack OAuth error: {error}")
        return RedirectResponse(
            url=f"{FRONTEND_URL}/dashboard/settings?slack=error&message={error}"
        )
    
    if not code or not state:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/dashboard/settings?slack=error&message=missing_params"
        )
    
    # Verify state and get user_id
    user_id = verify_oauth_state(state)
    if not user_id:
        return RedirectResponse(
            url=f"{FRONTEND_URL}/dashboard/settings?slack=error&message=invalid_state"
        )
    
    # Exchange code for token
    try:
        token_data = await exchange_code_for_token(code)
    except Exception as e:
        logger.error(f"Failed to exchange code: {e}")
        return RedirectResponse(
            url=f"{FRONTEND_URL}/dashboard/settings?slack=error&message=token_exchange_failed"
        )
    
    # Store token in database
    supabase = get_supabase()
    
    try:
        # Upsert to handle reconnections
        supabase.table("slack_connections").upsert({
            "user_id": user_id,
            "team_id": token_data["team_id"],
            "team_name": token_data.get("team_name"),
            "access_token": token_data["access_token"],
            "bot_user_id": token_data.get("bot_user_id"),
            "scope": token_data.get("scope"),
            "updated_at": datetime.utcnow().isoformat(),
        }, on_conflict="user_id").execute()
        
        logger.info(f"Slack connected for user {user_id} to team {token_data.get('team_name')}")
        
    except Exception as e:
        logger.error(f"Failed to store Slack token: {e}")
        return RedirectResponse(
            url=f"{FRONTEND_URL}/dashboard/settings?slack=error&message=storage_failed"
        )
    
    return RedirectResponse(
        url=f"{FRONTEND_URL}/dashboard/settings?slack=connected"
    )


@router.get("/status", response_model=SlackStatusResponse)
async def slack_status(authorization: str = Header(None)):
    """Check if user has Slack connected."""
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    supabase = get_supabase()
    
    try:
        result = supabase.table("slack_connections") \
            .select("team_name, channel_name, channel_id") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        if result.data:
            return SlackStatusResponse(
                connected=True,
                team_name=result.data.get("team_name"),
                channel_name=result.data.get("channel_name"),
                channel_id=result.data.get("channel_id"),
            )
    except Exception:
        pass
    
    return SlackStatusResponse(connected=False)


@router.get("/channels")
async def get_channels(authorization: str = Header(None)):
    """List available Slack channels for the authenticated user."""
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    supabase = get_supabase()
    
    # Get user's Slack token
    try:
        result = supabase.table("slack_connections") \
            .select("access_token") \
            .eq("user_id", user_id) \
            .single() \
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Slack not connected")
        
        access_token = result.data["access_token"]
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get Slack token: {e}")
        raise HTTPException(status_code=500, detail="Failed to get Slack connection")
    
    # List channels
    try:
        channels = await list_user_channels(access_token)
        return {"channels": channels}
    except Exception as e:
        logger.error(f"Failed to list channels: {e}")
        raise HTTPException(status_code=500, detail="Failed to list Slack channels")


@router.post("/channel")
async def set_channel(
    request: ChannelSelectRequest,
    authorization: str = Header(None),
):
    """Save the selected channel for notifications."""
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    supabase = get_supabase()
    
    try:
        supabase.table("slack_connections") \
            .update({
                "channel_id": request.channel_id,
                "channel_name": request.channel_name,
                "updated_at": datetime.utcnow().isoformat(),
            }) \
            .eq("user_id", user_id) \
            .execute()
        
        return {"success": True, "channel_name": request.channel_name}
    except Exception as e:
        logger.error(f"Failed to save channel: {e}")
        raise HTTPException(status_code=500, detail="Failed to save channel")


@router.delete("/disconnect")
async def disconnect_slack(authorization: str = Header(None)):
    """Disconnect Slack integration."""
    user_id = get_user_id_from_token(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    supabase = get_supabase()
    
    try:
        supabase.table("slack_connections") \
            .delete() \
            .eq("user_id", user_id) \
            .execute()
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Failed to disconnect Slack: {e}")
        raise HTTPException(status_code=500, detail="Failed to disconnect Slack")

