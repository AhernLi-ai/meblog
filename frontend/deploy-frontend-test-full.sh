#!/bin/bash

# 部署前端 test 环境脚本 - 完整构建版本（使用tar）
set -e

echo "=== 部署前端 test 环境 ==="

# 1. 停止并删除现有的 frontend test 容器
echo "停止并删除现有的 frontend test 容器..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 'docker stop meblog-frontend-test || true'
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 'docker rm meblog-frontend-test || true'

# 2. 创建源代码 tar 包并上传
echo "创建源代码 tar 包..."
cd ~/code/projects/meblog/frontend/next-frontend
tar --exclude='node_modules' --exclude='.git' --exclude='.DS_Store' --exclude='.next' -czf /tmp/memblog-frontend-source.tar.gz .

echo "上传源代码 tar 包到服务器..."
sshpass -p 'Ahern.123456' scp -o StrictHostKeyChecking=no /tmp/memblog-frontend-source.tar.gz root@116.62.176.216:/tmp/

echo "在服务器上解压源代码..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 '
rm -rf ~/code/projects/meblog/frontend/next-frontend/* &&
tar -xzf /tmp/memblog-frontend-source.tar.gz -C ~/code/projects/meblog/frontend/next-frontend/ &&
rm -f /tmp/memblog-frontend-source.tar.gz
'

# 3. 在服务器上安装依赖并构建
echo "在服务器上安装依赖并构建..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 '
cd ~/code/projects/meblog/frontend/next-frontend &&
npm config set registry https://registry.npmmirror.com &&
npm install --only=production &&
npm run build
'

# 4. 在服务器上构建 Docker 镜像
echo "在服务器上构建 Docker 镜像..."
sshpass -p 'Ahern.123456' ssh -o StrictHostKeyChecking=no root@116.62.176.216 '
cd ~/code/projects/meblog/frontend/next-frontend &&
docker build -t meblog-frontend-test .
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
rm -f /tmp/memblog-frontend-source.tar.gz

echo "=== 前端 test 环境部署完成 ==="
echo "前端地址: http://116.62.176.216:8001"
echo "后端地址: http://116.62.176.216:8000"