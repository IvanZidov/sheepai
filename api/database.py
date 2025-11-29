"""
Supabase database client
"""

from typing import Optional
from supabase import create_client, Client
from .config import SUPABASE_URL, SUPABASE_KEY

_supabase: Optional[Client] = None


def get_supabase() -> Client:
    """Get or create Supabase client (singleton)"""
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set")
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase

