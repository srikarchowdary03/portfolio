"""Heading-aware chunking.

Strategy (see docs/rag-pipeline.md): split each document on markdown headings
so semantically coherent sections ("## Results") stay intact, then enforce a
token budget per chunk with overlap so no chunk exceeds what retrieval handles
well.

Token counts use tiktoken (the tokenizer OpenAI models actually use) rather
than len(text)//4 heuristics. tiktoken fetches its vocabulary file on first
use, so offline environments fall back to a whitespace tokenizer — a coarser
budget (≈1.3 tokens per word) that keeps the pipeline fully functional
without network access.
"""

import logging
import re
from functools import lru_cache

from app.rag.models import Chunk, Document

logger = logging.getLogger(__name__)

MAX_TOKENS = 500
OVERLAP_TOKENS = 50

_HEADING_RE = re.compile(r"^(#{1,6})\s+(.*)$", re.MULTILINE)
# Word + trailing whitespace, so joining pieces reconstructs the text exactly.
_WORD_RE = re.compile(r"\S+\s*")


class Tokenizer:
    """encode/decode over either tiktoken ids or whitespace word-pieces."""

    def __init__(self) -> None:
        try:
            import tiktoken

            self._encoding = tiktoken.get_encoding("cl100k_base")
        except Exception:  # network-restricted environment
            logger.warning(
                "tiktoken vocabulary unavailable (offline?); "
                "falling back to approximate whitespace tokenization"
            )
            self._encoding = None

    def encode(self, text: str) -> list:
        if self._encoding is not None:
            return self._encoding.encode(text)
        return _WORD_RE.findall(text)

    def decode(self, tokens: list) -> str:
        if self._encoding is not None:
            return self._encoding.decode(tokens)
        return "".join(tokens)


@lru_cache
def get_tokenizer() -> Tokenizer:
    return Tokenizer()


def _split_by_headings(text: str) -> list[tuple[str, str]]:
    """Split markdown into (heading, section_text) pairs.

    Text before the first heading gets an empty heading. The heading line
    itself stays inside the section text so the embedding keeps that context.
    """
    matches = list(_HEADING_RE.finditer(text))
    if not matches:
        return [("", text)] if text.strip() else []

    sections: list[tuple[str, str]] = []
    preamble = text[: matches[0].start()].strip()
    if preamble:
        sections.append(("", preamble))

    for i, match in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        section = text[match.start() : end].strip()
        if section:
            sections.append((match.group(2).strip(), section))
    return sections


def _split_by_tokens(text: str) -> list[str]:
    """Split an oversized section into windows of MAX_TOKENS with overlap."""
    tokenizer = get_tokenizer()
    tokens = tokenizer.encode(text)
    if len(tokens) <= MAX_TOKENS:
        return [text]

    pieces: list[str] = []
    step = MAX_TOKENS - OVERLAP_TOKENS
    for start in range(0, len(tokens), step):
        window = tokens[start : start + MAX_TOKENS]
        pieces.append(tokenizer.decode(window).strip())
        if start + MAX_TOKENS >= len(tokens):
            break
    return pieces


def chunk_document(doc: Document) -> list[Chunk]:
    chunks: list[Chunk] = []
    for heading, section in _split_by_headings(doc.text):
        for piece in _split_by_tokens(section):
            chunks.append(
                Chunk(
                    # Stable id: same content -> same ids across re-ingestion.
                    id=f"{doc.source_file}#{len(chunks)}",
                    # Prefix title so a chunk embeds with its document context:
                    # "## Results ..." alone doesn't say results *of what*.
                    text=f"{doc.title}\n\n{piece}",
                    doc_type=doc.doc_type,
                    title=doc.title,
                    tags=doc.tags,
                    source_file=doc.source_file,
                    heading=heading,
                )
            )
    return chunks


def chunk_documents(docs: list[Document]) -> list[Chunk]:
    return [chunk for doc in docs for chunk in chunk_document(doc)]
