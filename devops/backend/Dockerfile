# Backend Dockerfile for FastAPI
# Multi-stage build with dependency caching

FROM python:3.12-slim AS base

# Install system dependencies for psycopg2-binary
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gcc \
        libpq-dev \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create .pip.conf for consistent PyPI mirror configuration
RUN echo "[global]" > /etc/pip.conf && \
    echo "index-url = https://pypi.tuna.tsinghua.edu.cn/simple" >> /etc/pip.conf && \
    echo "trusted-host = pypi.tuna.tsinghua.edu.cn" >> /etc/pip.conf

# Dependency installation stage
FROM base AS deps
WORKDIR /app

# Copy dependency files first to leverage Docker layer caching
COPY pyproject.toml uv.lock ./

# Upgrade pip and install dependencies with cache
# Using --no-cache-dir to avoid large cache layers, but dependency layer will be cached
RUN pip install --upgrade pip && \
    pip install --no-cache-dir fastapi uvicorn[standard] sqlalchemy pydantic pydantic-settings \
        "python-jose[cryptography]" "bcrypt" python-multipart alembic python-slugify \
        "email-validator" python-dotenv psycopg2-binary

# Production stage
FROM base AS runner
WORKDIR /app

# Copy installed dependencies from deps stage
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

# Copy application code
COPY . .

# Create non-root user for security
RUN groupadd --system --gid 1001 appuser && \
    useradd --system --uid 1001 --gid appuser --shell /bin/false appuser && \
    chown -R appuser:appuser /app

# Security: non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]