"""Semantic search over the knowledge base.

Thin composition of embedder + store; exists so callers (the /api/search
route today, the LangGraph retrieve node in Phase 2) depend on one interface
rather than on embedding/store internals.
"""

from app.rag.embedder import Embedder
from app.rag.models import SearchResult
from app.rag.store import VectorStore


class Retriever:
    def __init__(self, embedder: Embedder, store: VectorStore) -> None:
        self._embedder = embedder
        self._store = store

    @property
    def index_size(self) -> int:
        return self._store.count

    def search(self, query: str, k: int = 6, tags: list[str] | None = None) -> list[SearchResult]:
        vector = self._embedder.embed([query])[0]
        return self._store.query(vector, k=k, tags=tags)
