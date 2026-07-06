# Build context is the REPO ROOT (not backend/) so the image can include
# /content — the knowledge base ingested at startup (ADR-002).
#   docker build -f backend/Dockerfile .
# Multi-stage: dependencies resolved with uv in a builder layer, then only the
# virtualenv + source are copied into the slim runtime image.
FROM python:3.11-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
# --no-dev: production image doesn't need pytest/ruff.
RUN uv sync --frozen --no-dev

FROM python:3.11-slim

# Run as a non-root user — a container escape shouldn't hand out root.
RUN useradd --create-home appuser \
    && mkdir -p /app/data \
    && chown appuser /app/data

WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY backend/app ./app
COPY content ./content
USER appuser
ENV PATH="/app/.venv/bin:$PATH" \
    CONTENT_DIR=/app/content \
    DATA_DIR=/app/data

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/healthz', timeout=4)"
# Single worker BY DESIGN: session memory and the embedded vector index are
# in-process. Scaling out requires Redis sessions + a served vector DB
# (documented migration triggers in docs/decisions/adr-002).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
