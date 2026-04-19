#!/bin/bash

# 部署前端 test 环境脚本
set -e

echo "=== 部署前端 test 环境 ==="

# 1. 停止并删除现有的前端 test 容器
echo "停止并删除现有的前端 test 容器..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 'docker stop meblog-frontend-test || true'
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 'docker rm meblog-frontend-test || true'

# 2. 删除服务器上的旧构建产物
echo "清理服务器上的旧构建产物..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 'rm -rf ~/code/projects/meblog/frontend/next-frontend/.next || true'
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 'rm -f ~/code/projects/meblog/frontend/next-frontend/Dockerfile.test || true'

# 3. 创建临时 tar 包并上传（包含构建产物和简化Dockerfile）
echo "创建本地构建产物的 tar 包..."
cd ~/code/projects/meblog/frontend/next-frontend
tar --exclude='node_modules' --exclude='.git' --exclude='.DS_Store' -czf /tmp/memblog-frontend-build.tar.gz .next public server.js Dockerfile.test

echo "上传 tar 包到服务器..."
sshpass -p 'Ahern.123456' scp -o StrictHostKeyChecking=no /tmp/memblog-frontend-build.tar.gz root@116.62.176.216:/tmp/

echo "在服务器上解压 tar 包..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 '
cd ~/code/projects/meblog/frontend/next-frontend &&
tar -xzf /tmp/memblog-frontend-build.tar.gz &&
rm -f /tmp/memblog-frontend-build.tar.gz
'

# 4. 在服务器上构建 Docker 镜像（使用简化Dockerfile，不重新构建）
echo "在服务器上构建 Docker 镜像..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 '
cd ~/code/projects/meblog/frontend/next-frontend &&
docker build -t meblog-frontend-test -f Dockerfile.test .
'

# 5. 启动新的 frontend test 容器 (使用8001端口)
echo "启动新的 frontend test 容器..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 '
docker run -d \
  --name meblog-frontend-test \
  --restart unless-stopped \
  -p 8001:3000 \
  -e NODE_ENV=test \
  -e NEXT_PUBLIC_API_URL=http://116.62.176.216:8000 \
  meblog-frontend-test
'

# 6. 清理本地临时文件
echo "清理本地临时文件..."
rm -f /tmp/memblog-frontend-build.tar.gz

echo "=== 前端 test 环境部署完成 ==="
echo "前端地址: http://116.62.176.216:8001"
echo "后端地址: http://116.62.176.216:8000"