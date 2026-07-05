"""Embedded ChromaDB vector store.

Runs in-process and in-memory: the index is rebuilt from /content at startup
(ADR-002), so there is nothing to persist. This module is the seam where a
managed vector DB (Qdrant, pgvector) would slot in if the migration triggers
in ADR-002 are ever hit.

Chroma metadata values must be scalars — no lists. Tags are therefore stored
twice: as a comma-joined string (to reconstruct the tag list on results) and
as per-tag boolean flags ("tag_nlp": true) so tag filtering happens INSIDE the
index via a `where` clause. Filtering in the index beats over-fetching and
post-filtering in Python: a matching chunk is found even when it wouldn't
crack the unfiltered top-k.
"""

import uuid

import chromadb

from app.rag.models import Chunk, SearchResult


class VectorStore:
    def __init__(self) -> None:
        client = chromadb.EphemeralClient()
        # Chroma shares one in-process system across clients with identical
        # settings, so a fixed collection name would leak state between store
        # instances (e.g. across tests). One store = one fresh index.
        self._collection = client.create_collection(
            name=f"knowledge_base_{uuid.uuid4().hex[:8]}",
            metadata={"hnsw:space": "cosine"},
        )

    @property
    def count(self) -> int:
        return self._collection.count()

    def add(self, chunks: list[Chunk], vectors: list[list[float]]) -> None:
        metadatas = []
        for c in chunks:
            meta: dict = {
                "doc_type": c.doc_type,
                "title": c.title,
                "tags": ",".join(c.tags),
                "source_file": c.source_file,
                "heading": c.heading,
            }
            for tag in c.tags:
                meta[f"tag_{tag}"] = True
            metadatas.append(meta)

        self._collection.add(
            ids=[c.id for c in chunks],
            embeddings=vectors,
            documents=[c.text for c in chunks],
            metadatas=metadatas,
        )

    def query(
        self, vector: list[float], k: int, tags: list[str] | None = None
    ) -> list[SearchResult]:
        where = None
        if tags:
            clauses = [{f"tag_{t}": True} for t in tags]
            # Chroma's $or requires at least two clauses.
            where = clauses[0] if len(clauses) == 1 else {"$or": clauses}

        response = self._collection.query(
            query_embeddings=[vector],
            n_results=min(k, max(self.count, 1)),
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        return [
            SearchResult(
                text=text,
                # Chroma returns cosine *distance*; similarity = 1 - distance.
                score=round(1.0 - float(distance), 4),
                doc_type=str(meta["doc_type"]),
                title=str(meta["title"]),
                tags=[t for t in str(meta["tags"]).split(",") if t],
                source_file=str(meta["source_file"]),
                heading=str(meta["heading"]),
            )
            for text, meta, distance in zip(
                response["documents"][0],
                response["metadatas"][0],
                response["distances"][0],
                strict=True,
            )
        ]
