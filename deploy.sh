#!/bin/bash

# 部署 meblog 脚本 - 支持 test 和 production 环境
# 用法: ./deploy.sh [test|production]

set -e

# 默认环境为 test
ENVIRONMENT=${1:-test}

if [[ "$ENVIRONMENT" != "test" && "$ENVIRONMENT" != "production" ]]; then
  echo "用法: $0 [test|production]"
  exit 1
fi

# 服务器配置
SERVER_IP="116.62.176.216"
SERVER_USER="root"
SERVER_PASS="Ahern.123456"
PROJECT_ROOT="/root/code/projects/meblog"

echo "=== 部署 meblog 到 $ENVIRONMENT 环境 ==="

# 1. 推送到 Gitee（关闭代理）
echo "1. 推送到 Gitee..."
cd ~/code/skills/proxy-switcher && python enable_proxy.py disable
cd ~/code/projects/meblog
git push gitee dev

# 2. 推送到 GitHub（开启代理）
echo "2. 推送到 GitHub..."
cd ~/code/skills/proxy-switcher && python enable_proxy.py enable
cd ~/code/projects/meblog

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

# 4. 在服务器上部署
echo "4. 在服务器上部署 $ENVIRONMENT 服务..."
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
  if [ \"$ENVIRONMENT\" = \"test\" ]; then
    COMPOSE_FILE=\"docker-compose-test.yml\"
    
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
    
  else
    COMPOSE_FILE=\"docker-compose-production.yml\"
    
    if [ ! -f backend/.env.production ]; then
      echo 'DATABASE_URL=postgresql://memblog:memblog@postgres:5432/memblog' > backend/.env.production
      echo 'REDIS_URL=redis://redis:6379/0' >> backend/.env.production
      echo 'API_V1_STR=/api/v1' >> backend/.env.production
      echo 'PROJECT_NAME=Meblog API' >> backend/.env.production
      echo 'VERSION=1.0.0' >> backend/.env.production
      echo 'SECRET_KEY=your-production-secret-key-here' >> backend/.env.production
      echo 'BACKEND_CORS_ORIGINS=[\"https://yourdomain.com\"]' >> backend/.env.production
      echo 'ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com' >> backend/.env.production
      echo 'DEBUG=false' >> backend/.env.production
    fi
    
    if [ ! -f frontend/next-frontend/.env.production ]; then
      echo 'NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com' > frontend/next-frontend/.env.production
    fi
  fi
  
  # 停止现有服务
  if docker-compose -f \$COMPOSE_FILE ps | grep -q 'Up'; then
    echo '停止现有服务...'
    docker-compose -f \$COMPOSE_FILE down
  fi
  
  # 构建并启动新服务
  echo '构建并启动新服务...'
  docker-compose -f \$COMPOSE_FILE up -d --build
  
  echo '等待服务启动...'
  sleep 10
  
  # 检查服务状态
  echo '服务状态:'
  docker-compose -f \$COMPOSE_FILE ps
"

echo "=== 部署完成！ ==="
if [ "$ENVIRONMENT" = "test" ]; then
  echo "测试环境:"
  echo "后端 API: http://$SERVER_IP:8000/docs"
  echo "前端应用: http://$SERVER_IP:8001"
else
  echo "生产环境已部署，请配置域名和 HTTPS"
fi