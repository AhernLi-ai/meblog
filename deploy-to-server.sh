#!/bin/bash

# 部署 meblog 到测试服务器脚本
# 支持开发、测试环境的同步部署
# 自动推送到 Gitee 和 GitHub

set -e

# 服务器配置
SERVER_IP="116.62.176.216"
SERVER_USER="root"
SERVER_PASS="Ahern.123456"
PROJECT_ROOT="/root/code/projects/meblog"

echo "=== 开始部署流程 ==="

# 1. 推送到 Gitee（关闭代理）
echo "1. 推送到 Gitee..."
# 确保代理已关闭
cd ~/code/skills/proxy-switcher && python enable_proxy.py disable

git push gitee dev

# 2. 推送到 GitHub（开启代理）
echo "2. 推送到 GitHub..."
# 开启代理
cd ~/code/skills/proxy-switcher && python enable_proxy.py enable

git push origin dev

# 3. 关闭代理以访问服务器
echo "3. 关闭代理以访问阿里云服务器..."
cd ~/code/skills/proxy-switcher && python enable_proxy.py disable

# 4. 创建远程目录
echo "4. 创建远程目录..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $PROJECT_ROOT"

# 5. 同步整个项目代码（排除不需要的文件）
echo "5. 同步项目代码..."
rsync -avz --delete \
  --exclude='.git' \
  --exclude='.gitignore' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.venv' \
  --exclude='__pycache__' \
  --exclude='*.log' \
  --exclude='.env*' \
  --exclude='*.swp' \
  --exclude='*.swo' \
  --exclude='.DS_Store' \
  ./ $SERVER_USER@$SERVER_IP:$PROJECT_ROOT/

# 6. 在服务器上部署
echo "6. 在服务器上部署服务..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
  cd $PROJECT_ROOT &&
  
  # 创建必要的环境文件（这些不会被同步，需要在服务器上创建）
  if [ ! -f backend/.env.test ]; then
    echo 'DATABASE_URL=postgresql://meblog:meblog@postgres:5432/test_meblog' > backend/.env.test
    echo 'REDIS_URL=redis://redis:6379/0' >> backend/.env.test
    echo 'API_V1_STR=/api/v1' >> backend/.env.test
    echo 'PROJECT_NAME=Meblog API (Test)' >> backend/.env.test
    echo 'VERSION=1.0.0' >> backend/.env.test
    echo 'SECRET_KEY=test-secret-key-change-in-production' >> backend/.env.test
    echo 'BACKEND_CORS_ORIGINS=[\"*\"]' >> backend/.env.test
    echo 'ALLOWED_HOSTS=*' >> backend/.env.test
    echo 'DEBUG=true' >> backend/.env.test
  fi
  
  if [ ! -f frontend/next-frontend/.env.test ]; then
    echo 'NEXT_PUBLIC_API_BASE_URL=http://meblog-backend:8000' > frontend/next-frontend/.env.test
    echo 'NEXT_PUBLIC_ENV=test' >> frontend/next-frontend/.env.test
  fi
  
  # 停止现有服务
  if docker-compose -f docker-compose-test.yml ps | grep -q 'Up'; then
    echo '停止现有服务...'
    docker-compose -f docker-compose-test.yml down
  fi
  
  # 构建并启动新服务（串行部署：后端先启动，前端依赖后端健康状态）
  echo '构建并启动新服务...'
  docker-compose -f docker-compose-test.yml up -d --build
  
  echo '等待服务启动...'
  sleep 10
  
  # 检查服务状态
  echo '服务状态:'
  docker-compose -f docker-compose-test.yml ps
"

echo "=== 部署完成！ ==="
echo "后端 API: http://$SERVER_IP:8000/docs"
echo "前端应用: http://$SERVER_IP:8001"