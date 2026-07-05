"""Golden evaluation dataset: loading + validation.

Every expected source is checked against the real /content directory at load
time, so a renamed knowledge-base file breaks the eval run loudly instead of
silently deflating retrieval scores.
"""

import json
from pathlib import Path

from pydantic import BaseModel, Field

DATASET_PATH = Path(__file__).parent / "golden_qa.jsonl"


class GoldenItem(BaseModel):
    id: str
    category: str
    question: str
    expected_sources: list[str] = Field(default_factory=list)
    expected_facts: list[str] = Field(default_factory=list)
    answerable: bool = True


def load_dataset(path: Path = DATASET_PATH, content_dir: Path | None = None) -> list[GoldenItem]:
    items = [
        GoldenItem.model_validate(json.loads(line))
        for line in path.read_text().splitlines()
        if line.strip()
    ]

    ids = [item.id for item in items]
    if len(set(ids)) != len(ids):
        raise ValueError("Duplicate ids in golden dataset")

    if content_dir is not None:
        for item in items:
            for source in item.expected_sources:
                if not (content_dir / source).exists():
                    raise ValueError(
                        f"{item.id}: expected source {source!r} does not exist in {content_dir}"
                    )
    return items
