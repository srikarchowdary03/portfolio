"""Embedding providers behind a common interface.

The provider boundary exists so the entire pipeline (ingest, index, search,
API) runs in tests and keyless dev environments without OpenAI calls:

- OpenAIEmbedder: production — text-embedding-3-small.
- FakeEmbedder:   deterministic vectors derived from token hashes. Not
  semantically meaningful, but stable: the same text always maps to the same
  vector, and texts sharing words land closer together — enough to exercise
  every code path and assert plumbing in tests.
"""

import hashlib
import math
from typing import Protocol

from openai import OpenAI

EMBEDDING_DIM = 1536  # text-embedding-3-small; FakeEmbedder matches it.
_BATCH_SIZE = 128


class Embedder(Protocol):
    def embed(self, texts: list[str]) -> list[list[float]]: ...


class OpenAIEmbedder:
    def __init__(self, api_key: str, model: str = "text-embedding-3-small") -> None:
        self._client = OpenAI(api_key=api_key)
        self._model = model

    def embed(self, texts: list[str]) -> list[list[float]]:
        vectors: list[list[float]] = []
        for start in range(0, len(texts), _BATCH_SIZE):
            batch = texts[start : start + _BATCH_SIZE]
            response = self._client.embeddings.create(model=self._model, input=batch)
            vectors.extend(item.embedding for item in response.data)
        return vectors


class FakeEmbedder:
    def embed(self, texts: list[str]) -> list[list[float]]:
        return [self._embed_one(text) for text in texts]

    @staticmethod
    def _embed_one(text: str) -> list[float]:
        # Bag-of-words hashing: each lowercase word deterministically bumps a
        # few dimensions. Shared words => closer vectors under cosine.
        vector = [0.0] * EMBEDDING_DIM
        for word in text.lower().split():
            digest = hashlib.sha256(word.encode()).digest()
            for i in range(0, 12, 4):
                index = int.from_bytes(digest[i : i + 2], "big") % EMBEDDING_DIM
                sign = 1.0 if digest[i + 2] % 2 == 0 else -1.0
                vector[index] += sign
        norm = math.sqrt(sum(v * v for v in vector)) or 1.0
        return [v / norm for v in vector]


def build_embedder(provider: str, api_key: str | None) -> Embedder:
    if provider == "openai":
        if not api_key:
            raise ValueError(
                "EMBEDDINGS_PROVIDER=openai requires OPENAI_API_KEY. "
                "Set the key, or use EMBEDDINGS_PROVIDER=fake for keyless development."
            )
        return OpenAIEmbedder(api_key=api_key)
    if provider == "fake":
        return FakeEmbedder()
    raise ValueError(f"Unknown embeddings provider: {provider!r} (expected 'openai' or 'fake')")
