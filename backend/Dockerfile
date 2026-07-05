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
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
