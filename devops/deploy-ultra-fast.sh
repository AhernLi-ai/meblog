#!/bin/bash
# Ultra-Fast Deployment Script
# Separates build and deployment for maximum efficiency

set -e

PROJECT_DIR="$HOME/code/projects/meblog"
SERVER_USER="root"
SERVER_HOST="116.62.176.216" 
SERVER_PASS="Ahern.123456"

# Phase 1: Local Build (Fast, uses local environment)
echo "🏗️  Building frontend locally..."
cd "$PROJECT_DIR/frontend/next-frontend"
npm run build

# Phase 2: Parallel Upload
echo "📤 Uploading backend code..."
rsync -av --exclude='.venv' --exclude='__pycache__' \
    "$PROJECT_DIR/backend/" \
    "$SERVER_USER@$SERVER_HOST:/tmp/memblog-backend/" \
    --rsh="sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no" &

BACKEND_PID=$!

echo "📤 Uploading frontend build output..."  
rsync -av --exclude='node_modules' \
    "$PROJECT_DIR/frontend/next-frontend/.next/" \
    "$SERVER_USER@$SERVER_HOST:/tmp/memblog-frontend/.next/" \
    --rsh="sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no" &

FRONTEND_PID=$!

# Wait for both uploads
wait $BACKEND_PID $FRONTEND_PID

# Phase 3: Server-side ultra-fast deployment
echo "🚀 Ultra-fast server deployment..."

# Backend: Use pre-built image, just update code
sshpass -p "$SERVER_PASS" ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
# Stop old backend
docker stop meblog-backend || true

# Update code in existing container or start new one
# For now, rebuild but it will be much faster with cached layers
cd /tmp/memblog-backend && docker build -t meblog-backend:new .
docker run -d --name meblog-backend-new --network host \
    -e DATABASE_URL=postgresql://meblog:meblog@localhost:6001/meblog \
    -e REDIS_URL=redis://localhost:6379/0 \
    meblog-backend:new

# Verify and switch
sleep 5
if curl -s http://localhost:8000/health | grep -q '"status":"ok"'; then
    docker stop meblog-backend || true
    docker rm meblog-backend || true  
    docker rename meblog-backend-new meblog-backend
    echo "✅ Backend deployed"
else
    echo "❌ Backend deployment failed"
    exit 1
fi
EOF

# Frontend: Direct static file deployment (no build needed!)
sshpass -p "$SERVER_PASS" ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
# Stop old frontend
docker stop meblog-frontend || true

# Start new frontend with uploaded build
docker run -d --name meblog-frontend-new -p 8002:3000 \
    -v /tmp/memblog-frontend/.next:/app/.next \
    meblog-frontend:runner

# Verify and switch
sleep 10
if curl -s http://localhost:8002 | head -1 | grep -q '<!DOCTYPE html>'; then
    docker stop meblog-frontend || true
    docker rm meblog-frontend || true
    docker run -d --name meblog-frontend -p 8001:3000 \
        -v /tmp/memblog-frontend/.next:/app/.next \
        meblog-frontend:runner
    docker rm meblog-frontend-new
    echo "✅ Frontend deployed"
else
    echo "❌ Frontend deployment failed"  
    exit 1
fi

# Cleanup
rm -rf /tmp/memblog-*
EOF

echo "🎉 Ultra-fast deployment completed!"