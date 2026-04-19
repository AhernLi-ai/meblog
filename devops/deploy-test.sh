#!/bin/bash
# deploy-test.sh - 部署到服务器 test 环境
# 前端: 构建产物上传到服务器
# 后端: 使用本地相同的配置，连接 meblog_test 数据库

set -e

echo "🚀 开始部署到服务器 test 环境..."

# 服务器信息
SERVER_IP="116.62.176.216"
SERVER_USER="root"
SERVER_PASS="Ahern.123456"

# 本地路径
FRONTEND_BUILD_DIR="$HOME/code/projects/meblog/frontend/next-frontend/.next"
FRONTEND_PUBLIC_DIR="$HOME/code/projects/meblog/frontend/next-frontend/public"

# 服务器路径
SERVER_FRONTEND_DIR="/root/memblog-test/frontend"
SERVER_BACKEND_DIR="/root/memblog-test/backend"

echo "📦 准备服务器目录..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP "
  mkdir -p $SERVER_FRONTEND_DIR/{.next,public}
  mkdir -p $SERVER_BACKEND_DIR
  
  # 创建 Docker 网络
  docker network create memblog-test-net 2>/dev/null || true
"

echo "📤 上传前端构建产物..."
# 上传 .next 目录
rsync -avz --progress \
  --rsh="sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no" \
  "$FRONTEND_BUILD_DIR/" \
  "$SERVER_USER@$SERVER_IP:$SERVER_FRONTEND_DIR/.next/"

# 上传 public 目录
rsync -avz --progress \
  --rsh="sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no" \
  "$FRONTEND_PUBLIC_DIR/" \
  "$SERVER_USER@$SERVER_IP:$SERVER_FRONTEND_DIR/public/"

echo "📤 上传后端代码..."
rsync -avz --progress \
  --rsh="sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no" \
  "$HOME/code/projects/meblog/backend/" \
  "$SERVER_USER@$SERVER_IP:$SERVER_BACKEND_DIR/"

echo "⚙️  配置服务器环境..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP "
  # 创建后端 .env 文件（连接 meblog_test 数据库）
  cat > $SERVER_BACKEND_DIR/.env << 'EOF'
DATABASE_URL=postgresql://meblog:meblog@localhost:6001/meblog_test
SECRET_KEY=dev-secret-key-for-testing-2026
EOF
  
  # 创建前端 .env.local 文件（使用宿主机 IP）
  cat > $SERVER_FRONTEND_DIR/.env.local << 'EOF'
NEXT_PUBLIC_API_BASE_URL=http://116.62.176.216:8000/api/v1
EOF
"

echo "🐳 启动 Docker 容器..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP "
  # 启动后端容器（绑定到宿主机网络）
  docker run -d \
    --name memblog-test-backend \
    --network host \
    -v $SERVER_BACKEND_DIR:/app \
    -w /app \
    python:3.11-slim \
    sh -c 'pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary python-jose[cryptography] passlib[bcrypt] email-validator python-multipart python-slugify && uvicorn app.main:app --host 0.0.0.0 --port 8000'
  
  # 启动前端容器（绑定到宿主机网络）
  docker run -d \
    --name memblog-test-frontend \
    --network host \
    -v $SERVER_FRONTEND_DIR/.next:/app/.next \
    -v $SERVER_FRONTEND_DIR/public:/app/public \
    -v $SERVER_FRONTEND_DIR/.env.local:/app/.env.local \
    node:18-alpine \
    sh -c 'cd /app && npm install -g serve && serve -s .next -l 8001'
"

echo "✅ 部署完成！"
echo "🔗 访问地址: http://$SERVER_IP:8001"
echo "🔧 后端 API: http://$SERVER_IP:8000"