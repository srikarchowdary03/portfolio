"""Ingestion orchestrator: load -> chunk -> embed -> index.

Called from the FastAPI lifespan at startup (the ADR-002 rebuild-on-deploy
path). Also runnable manually:

    uv run python -m app.rag.ingest
"""

import logging
import time
from pathlib import Path

from app.rag.chunker import chunk_documents
from app.rag.embedder import Embedder
from app.rag.loader import load_documents
from app.rag.store import VectorStore

logger = logging.getLogger(__name__)


def ingest(content_dir: Path, embedder: Embedder, store: VectorStore) -> dict:
    started = time.perf_counter()

    documents = load_documents(content_dir)
    if not documents:
        raise RuntimeError(f"No knowledge-base documents found in {content_dir}")
    chunks = chunk_documents(documents)
    vectors = embedder.embed([c.text for c in chunks])
    store.add(chunks, vectors)

    stats = {
        "documents": len(documents),
        "chunks": len(chunks),
        "elapsed_ms": round((time.perf_counter() - started) * 1000),
    }
    logger.info("Knowledge base ingested: %s", stats)
    return stats


if __name__ == "__main__":
    from app.core.config import get_settings
    from app.rag.embedder import build_embedder

    logging.basicConfig(level=logging.INFO)
    settings = get_settings()
    result = ingest(
        content_dir=settings.content_path,
        embedder=build_embedder(settings.embeddings_provider, settings.openai_api_key),
        store=VectorStore(),
    )
    print(result)
