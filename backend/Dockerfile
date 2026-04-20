FROM docker.m.daocloud.io/library/python:3.12-slim
WORKDIR /app
# 阿里云源
RUN sed -i 's|http://deb.debian.org/debian|https://mirrors.aliyun.com/debian|g' /etc/apt/sources.list.d/debian.sources && \
apt-get update && apt-get install -y --no-install-recommends build-essential libpq-dev curl && \
rm -rf /var/lib/apt/lists/*
# 安装 uv（使用镜像）
RUN curl -LsSf https://astral.sh/uv/install.sh | sh || pip install uv --index-url https://pypi.tuna.tsinghua.edu.cn/simple
ENV PATH="/root/.local/bin:$PATH"
# 依赖
COPY pyproject.toml uv.lock ./
# ✅ 安装到项目虚拟环境，不装系统
RUN uv sync --frozen --index-url https://pypi.tuna.tsinghua.edu.cn/simple
# 代码
COPY . .
EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]