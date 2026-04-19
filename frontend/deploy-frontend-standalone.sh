#!/bin/bash

# 部署前端 standalone 环境脚本
set -e

echo "=== 部署前端 standalone 环境 ==="

# 1. 停止并删除现有的 frontend test 容器
echo "停止并删除现有的 frontend test 容器..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 'docker stop meblog-frontend-test || true'
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 'docker rm meblog-frontend-test || true'

# 2. 创建 standalone 构建产物的 tar 包
echo "创建 standalone 构建产物的 tar 包..."
cd ~/code/projects/meblog/frontend/next-frontend
tar -czf /tmp/memblog-frontend-standalone.tar.gz .next/standalone Dockerfile.standalone

echo "上传 tar 包到服务器..."
sshpass -p 'Ahern.123456' scp -o StrictHostKeyChecking=no /tmp/memblog-frontend-standalone.tar.gz root@116.62.176.216:/tmp/

echo "在服务器上解压 tar 包..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 '
rm -rf ~/code/projects/meblog/frontend/next-frontend &&
mkdir -p ~/code/projects/meblog/frontend/next-frontend &&
cd ~/code/projects/meblog/frontend/next-frontend &&
tar -xzf /tmp/memblog-frontend-standalone.tar.gz &&
cp -r .next/standalone/next-frontend/* . &&
rm -rf .next Dockerfile.standalone &&
rm -f /tmp/memblog-frontend-standalone.tar.gz
'

# 3. 在服务器上构建 Docker 镜像
echo "在服务器上构建 Docker 镜像..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 '
cd ~/code/projects/meblog/frontend/next-frontend &&
docker build -t meblog-frontend-test -f Dockerfile.standalone .
'

# 4. 启动新的 frontend test 容器 (使用8001端口)
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

# 5. 清理本地临时文件
echo "清理本地临时文件..."
rm -f /tmp/memblog-frontend-standalone.tar.gz

echo "=== 前端 standalone 环境部署完成 ==="
echo "前端地址: http://116.62.176.216:8001"
echo "后端地址: http://116.62.176.216:8000"