"""Test environment setup.

Runs before any test module imports the app: forces the fake embedding
provider (no API key, no network, deterministic) and points the content dir
at the real knowledge base so API-level tests exercise real ingestion.
"""

import os
from pathlib import Path

os.environ["EMBEDDINGS_PROVIDER"] = "fake"
os.environ["CONTENT_DIR"] = str(Path(__file__).resolve().parents[2] / "content")
