"""Test environment setup.

Runs before any test module imports the app: forces the fake embedding
provider (no API key, no network, deterministic) and points the content dir
at the real knowledge base so API-level tests exercise real ingestion.
"""

import os
import tempfile
from pathlib import Path

os.environ["EMBEDDINGS_PROVIDER"] = "fake"
os.environ["LLM_PROVIDER"] = "fake"
os.environ["CONTENT_DIR"] = str(Path(__file__).resolve().parents[2] / "content")
os.environ["DATA_DIR"] = tempfile.mkdtemp(prefix="portfolio-test-")
# Generous limits so ordinary tests never trip the limiter; the rate-limit
# test tightens these itself (limits are read per request).
os.environ["RATE_LIMIT_CHAT"] = "1000/minute"
os.environ["RATE_LIMIT_SEARCH"] = "1000/minute"
os.environ["RATE_LIMIT_FEEDBACK"] = "1000/minute"
