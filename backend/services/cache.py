import os
import sqlite3
import json
from datetime import datetime, timedelta
from typing import Optional, Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cache.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS api_cache (
            key TEXT PRIMARY KEY,
            value TEXT,
            expires_at TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

# Initialize DB on import
init_db()

def get_cached_response(key: str) -> Optional[Any]:
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT value, expires_at FROM api_cache WHERE key = ?", (key,))
        row = cursor.fetchone()
        conn.close()

        if row:
            value_str, expires_at_str = row
            expires_at = datetime.fromisoformat(expires_at_str)
            if datetime.utcnow() < expires_at:
                return json.loads(value_str)
            else:
                # Expired, clean it up
                conn = sqlite3.connect(DB_PATH)
                cursor = conn.cursor()
                cursor.execute("DELETE FROM api_cache WHERE key = ?", (key,))
                conn.commit()
                conn.close()
    except Exception as e:
        print(f"Cache read error: {e}")
    return None

def set_cached_response(key: str, data: Any, expire_hours: int = 24) -> None:
    try:
        expires_at = datetime.utcnow() + timedelta(hours=expire_hours)
        value_str = json.dumps(data)
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO api_cache (key, value, expires_at)
            VALUES (?, ?, ?)
        """, (key, value_str, expires_at.isoformat()))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Cache write error: {e}")
