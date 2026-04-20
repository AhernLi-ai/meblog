#!/bin/bash

# 简化版部署脚本 - 仅用于测试环境
set -e

echo "=== 部署 meblog 到 test 环境 ==="

# 在服务器上部署
sshpass -p "Ahern.123456" ssh -o StrictHostKeyChecking=no root@116.62.176.216 "
  cd /root/code/projects/meblog && 
  git reset --hard HEAD && 
  git pull origin dev &&
  
  # 确保环境文件存在
  if [ ! -f backend/.env.test ]; then
    echo 'DATABASE_URL=postgresql://admin:admin@common-postgres:5432/memblog_test' > backend/.env.test
    echo 'REDIS_URL=redis://common-redis:6379/0' >> backend/.env.test
    echo 'API_V1_STR=/api/v1' >> backend/.env.test
    echo 'PROJECT_NAME=Meblog API' >> backend/.env.test
    echo 'VERSION=1.0.0' >> backend/.env.test
    echo 'SECRET_KEY=your-secret-key-here' >> backend/.env.test
    echo 'BACKEND_CORS_ORIGINS=[\"http://localhost:3000\",\"http://116.62.176.216:8001\"]' >> backend/.env.test
    echo 'ALLOWED_HOSTS=localhost,116.62.176.216' >> backend/.env.test
    echo 'DEBUG=true' >> backend/.env.test
  fi
  
  if [ ! -f frontend/.env.test ]; then
    echo 'NEXT_PUBLIC_API_BASE_URL=http://116.62.176.216:8000/api/v1' > frontend/.env.test
  fi
  
  # 构建并启动服务
  docker-compose -f docker-compose-test.yml up -d --build
"

echo "=== 部署完成！ ==="
echo "测试环境:"
echo "后端 API: http://116.62.176.216:8000/docs"
echo "前端应用: http://116.62.176.216:8001"