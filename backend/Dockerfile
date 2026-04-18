FROM python:3.12-slim
WORKDIR /app
# 使用清华源安装依赖（服务器网络慢时优先用清华/阿里云源）
RUN pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple --upgrade pip && \
    pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple fastapi uvicorn[standard] sqlalchemy pydantic pydantic-settings "python-jose[cryptography]" "bcrypt" python-multipart alembic python-slugify "email-validator" python-dotenv psycopg2-binary
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
