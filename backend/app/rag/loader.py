"""Load knowledge-base documents from the /content directory.

Each markdown file carries YAML frontmatter (type, title, tags, ...). The
frontmatter becomes retrieval metadata; the body becomes the searchable text.
"""

import logging
from pathlib import Path

import frontmatter

from app.rag.models import Document

logger = logging.getLogger(__name__)


def load_documents(content_dir: Path) -> list[Document]:
    documents: list[Document] = []
    for path in sorted(content_dir.rglob("*.md")):
        if path.name == "README.md":  # repo documentation, not candidate knowledge
            continue
        post = frontmatter.load(path)
        source_file = str(path.relative_to(content_dir))
        if "type" not in post.metadata or "title" not in post.metadata:
            logger.warning("Skipping %s: missing required frontmatter (type, title)", source_file)
            continue
        documents.append(
            Document(
                text=post.content.strip(),
                doc_type=str(post.metadata["type"]),
                title=str(post.metadata["title"]),
                tags=[str(t) for t in post.metadata.get("tags", [])],
                source_file=source_file,
            )
        )
    return documents
