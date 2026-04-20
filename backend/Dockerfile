# Build stage - install dependencies with uv
FROM python:3.12-slim AS builder

WORKDIR /app

# Install system dependencies and uv
RUN sed -i 's|http://deb.debian.org/debian|https://mirrors.aliyun.com/debian|g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv (ultra-fast Python package installer)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:/root/.local/bin:$PATH"

# Copy project files for dependency installation
COPY pyproject.toml uv.lock ./

# Configure uv to use Chinese mirrors for faster downloads
# Use清华源 for PyPI
RUN uv pip install --system --no-cache-dir --index-url https://pypi.tuna.tsinghua.edu.cn/simple --extra-index-url https://pypi.org/simple --find-links https://pypi.tuna.tsinghua.edu.cn/simple .

# Production stage
FROM python:3.12-slim AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 app && \
    adduser --system --uid 1001 --ingroup app app

# Install only runtime system dependencies
RUN sed -i 's|http://deb.debian.org/debian|https://mirrors.aliyun.com/debian|g' /etc/apt/sources.list.d/debian.sources && \
    apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies from builder stage
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

# Copy application code
COPY . .

# Change ownership to non-root user
RUN chown -R app:app /app

USER app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]