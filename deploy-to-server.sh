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

# 2. 尝试推送到 GitHub（开启代理，但处理网络超时）
echo "2. 尝试推送到 GitHub..."
# 开启代理
cd ~/code/skills/proxy-switcher && python enable_proxy.py enable

# 使用重试机制推送 GitHub
retry_count=0
max_retries=3
while [ $retry_count -lt $max_retries ]; do
  if git push origin dev; then
    echo "GitHub 推送成功！"
    break
  else
    retry_count=$((retry_count + 1))
    echo "GitHub 推送失败，重试 $retry_count/$max_retries..."
    sleep 5
    if [ $retry_count -eq $max_retries ]; then
      echo "GitHub 推送失败，继续部署流程（Gitee 已同步）"
    fi
  fi
done

# 3. 关闭代理以访问服务器
echo "3. 关闭代理以访问阿里云服务器..."
cd ~/code/skills/proxy-switcher && python enable_proxy.py disable

# 4. 在服务器上部署（从 Gitee 拉取代码，更稳定）
echo "4. 在服务器上部署服务..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "
  cd /root/code && 
  
  # 克隆或更新项目
  if [ ! -d projects ]; then
    mkdir -p projects
  fi
  
  cd projects
  
  if [ ! -d meblog ]; then
    git clone https://gitee.com/AhernLi-ai/meblog.git
  else
    cd meblog && git pull origin dev
  fi
  
  cd meblog
  
  # 创建必要的环境文件
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
  
  # 构建并启动新服务
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
echo "代码已同步到 Gitee，GitHub 同步将在网络稳定时完成"