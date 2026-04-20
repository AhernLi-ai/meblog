# 直接用一个镜像，不拆分多阶段
FROM docker.m.daocloud.io/library/python:3.12-slim
WORKDIR /app
# 阿里云 Debian 源（不超时）
RUN sed -i 's|http://deb.debian.org/debian|https://mirrors.aliyun.com/debian|g' /etc/apt/sources.list.d/debian.sources && \
apt-get update && apt-get install -y --no-install-recommends \
build-essential \
libpq-dev \
curl \
&& rm -rf /var/lib/apt/lists/*
# 安装 uv
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"
# 复制依赖
COPY pyproject.toml uv.lock ./
# 清华 PyPI 源（超快）
RUN uv pip install --system --no-cache-dir \
--index-url https://pypi.tuna.tsinghua.edu.cn/simple \
--extra-index-url https://pypi.org/simple \
-r <(uv pip compile pyproject.toml -o requirements.txt)
# 复制代码
COPY . .
# 运行端口
EXPOSE 8000
# 启动
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]