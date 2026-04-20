#!/bin/bash

# 简化版部署脚本 - 仅用于测试
set -e

echo "=== 简化部署 meblog 到 test 环境 ==="

# 关闭代理
cd ~/code/skills/proxy-switcher && python enable_proxy.py disable

# 推送到 Gitee
cd ~/code/projects/meblog
git push gitee dev

# 在服务器上部署
echo "在服务器上部署..."
sshpass -p "Ahern.123456" ssh -o StrictHostKeyChecking=no root@116.62.176.216 "
  cd /root/code/projects/meblog &&
  git pull origin dev &&
  docker-compose -f docker-compose-test.yml down &&
  docker-compose -f docker-compose-test.yml up -d --build
"

echo "=== 部署完成！ ==="
echo "测试环境:"
echo "后端 API: http://116.62.176.216:8000/docs"
echo "前端应用: http://116.62.176.216:8001"