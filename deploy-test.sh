#!/bin/bash

# 部署 meblog test 环境脚本（优化版）
set -e

SERVER_IP="116.62.176.216"
SERVER_USER="root"
SERVER_PASS="Ahern.123456"
PROJECT_ROOT="/root/memblog-test"

echo "=== 部署 meblog test 环境 ==="

# 1. 创建远程目录
echo "1. 创建远程目录..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $PROJECT_ROOT/frontend $PROJECT_ROOT/backend"

# 2. 上传后端代码（排除虚拟环境和缓存）
echo "2. 上传后端代码..."
cd ~/code/projects/meblog/backend
# 使用 rsync 风格的排除，但用 scp 的方式
find . -type f ! -path "./.venv/*" ! -path "./__pycache__/*" ! -path "./.git/*" ! -path "./.*~" | while read file; do
  dir=$(dirname "$file")
  sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $PROJECT_ROOT/backend/$dir"
  sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no "$file" $SERVER_USER@$SERVER_IP:$PROJECT_ROOT/backend/"$file"
done

# 3. 上传前端构建产物
echo "3. 上传前端构建产物..."
cd ~/code/projects/meblog/frontend/next-frontend
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -r .next/standalone $SERVER_USER@$SERVER_IP:$PROJECT_ROOT/frontend/
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -r .next/static $SERVER_USER@$SERVER_IP:$PROJECT_ROOT/frontend/
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no -r public $SERVER_USER@$SERVER_IP:$PROJECT_ROOT/frontend/
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no server.js $SERVER_USER@$SERVER_IP:$PROJECT_ROOT/frontend/
sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no Dockerfile.production $SERVER_USER@$SERVER_IP:$PROJECT_ROOT/frontend/Dockerfile

# 4. 构建并启动后端容器
echo "4. 构建并启动后端容器..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
  cd $PROJECT_ROOT/backend &&
  docker build -t meblog-backend-test . &&
  docker stop meblog-backend-test 2>/dev/null || true &&
  docker rm meblog-backend-test 2>/dev/null || true &&
  docker run -d --name meblog-backend-test -p 8000:8000 \
    --network host \
    -v $PROJECT_ROOT/backend/.env.test:/app/.env \
    meblog-backend-test
"

# 5. 构建并启动前端容器
echo "5. 构建并启动前端容器..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
  cd $PROJECT_ROOT/frontend &&
  docker build -t meblog-frontend-test . &&
  docker stop meblog-frontend-test 2>/dev/null || true &&
  docker rm meblog-frontend-test 2>/dev/null || true &&
  docker run -d --name meblog-frontend-test -p 8001:3000 \
    --network host \
    meblog-frontend-test
"

echo "=== 部署完成！ ==="
echo "后端: http://$SERVER_IP:8000/docs"
echo "前端: http://$SERVER_IP:8001"