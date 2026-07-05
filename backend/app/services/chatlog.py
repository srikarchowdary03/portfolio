"""Chat-turn logging to SQLite.

Every turn is recorded (question, answer, retrieval stats, latency) — the raw
material for the Phase 5 online metrics and the /how-it-works page. Logging is
strictly best-effort: a logging failure must never break a chat response.
"""

import logging
import sqlite3
import time
from pathlib import Path

logger = logging.getLogger(__name__)

_SCHEMA = """
CREATE TABLE IF NOT EXISTS chat_turns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts REAL NOT NULL,
    session_id TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    intent TEXT NOT NULL,
    grounded INTEGER NOT NULL,
    retrieved_count INTEGER NOT NULL,
    used_count INTEGER NOT NULL,
    chunk_ids TEXT NOT NULL,
    latency_ms INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts REAL NOT NULL,
    turn_id INTEGER NOT NULL,
    rating TEXT NOT NULL,
    comment TEXT
);
"""


class ChatLog:
    def __init__(self, db_path: Path) -> None:
        self._db_path = db_path
        try:
            db_path.parent.mkdir(parents=True, exist_ok=True)
            with self._connect() as conn:
                conn.executescript(_SCHEMA)
        except (sqlite3.Error, OSError):
            logger.exception("Chat log unavailable; continuing without persistence")

    def _connect(self) -> sqlite3.Connection:
        # One short-lived connection per write: no cross-thread sharing issues
        # with FastAPI's threadpool, and no locking at portfolio traffic levels.
        return sqlite3.connect(self._db_path, timeout=5)

    def log_turn(
        self,
        session_id: str,
        question: str,
        answer: str,
        intent: str,
        grounded: bool,
        retrieved_count: int,
        used_count: int,
        chunk_sources: list[str],
        latency_ms: int,
    ) -> int | None:
        """Insert the turn and return its row id (None if logging failed)."""
        try:
            with self._connect() as conn:
                cursor = conn.execute(
                    "INSERT INTO chat_turns (ts, session_id, question, answer, intent, grounded,"
                    " retrieved_count, used_count, chunk_ids, latency_ms)"
                    " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        time.time(),
                        session_id,
                        question,
                        answer,
                        intent,
                        int(grounded),
                        retrieved_count,
                        used_count,
                        ",".join(chunk_sources),
                        latency_ms,
                    ),
                )
                return cursor.lastrowid
        except (sqlite3.Error, OSError):
            logger.exception("Failed to log chat turn")
            return None

    def log_feedback(self, turn_id: int, rating: str, comment: str | None) -> None:
        try:
            with self._connect() as conn:
                conn.execute(
                    "INSERT INTO feedback (ts, turn_id, rating, comment) VALUES (?, ?, ?, ?)",
                    (time.time(), turn_id, rating, comment),
                )
        except (sqlite3.Error, OSError):
            logger.exception("Failed to log feedback")
