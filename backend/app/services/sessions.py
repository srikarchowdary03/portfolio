"""In-process session memory.

Right-sized for a single-instance deployment (see docs/agent-graph.md): a
dict of session_id -> recent messages with a TTL, swept lazily on access.
Upgrade path when horizontal scaling ever matters: Redis with the same
interface.
"""

import time
from collections import deque

TTL_SECONDS = 30 * 60
MAX_MESSAGES = 10  # last 5 user/assistant exchanges


class SessionStore:
    def __init__(self, ttl_seconds: int = TTL_SECONDS) -> None:
        self._ttl = ttl_seconds
        self._sessions: dict[str, tuple[deque, float]] = {}

    def history(self, session_id: str) -> list[dict]:
        self._sweep()
        entry = self._sessions.get(session_id)
        return list(entry[0]) if entry else []

    def append(self, session_id: str, role: str, content: str) -> None:
        self._sweep()
        messages, _ = self._sessions.get(session_id, (deque(maxlen=MAX_MESSAGES), 0.0))
        messages.append({"role": role, "content": content})
        self._sessions[session_id] = (messages, time.monotonic())

    def _sweep(self) -> None:
        now = time.monotonic()
        expired = [sid for sid, (_, ts) in self._sessions.items() if now - ts > self._ttl]
        for sid in expired:
            del self._sessions[sid]
