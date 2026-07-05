# Multi-stage build: dependencies are resolved with uv in a builder layer,
# then only the virtualenv + source are copied into the slim runtime image.
FROM python:3.11-slim AS builder

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app
COPY pyproject.toml uv.lock ./
# --no-dev: production image doesn't need pytest/ruff.
RUN uv sync --frozen --no-dev

FROM python:3.11-slim

# Run as a non-root user — a container escape shouldn't hand out root.
RUN useradd --create-home appuser
USER appuser

WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY app ./app
# The RAG index is rebuilt from /content at startup (Phase 1), so the content
# directory ships inside the image. docker-compose mounts it for local dev.
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
