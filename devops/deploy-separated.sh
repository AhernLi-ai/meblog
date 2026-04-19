#!/bin/bash
# Separated Architecture Deployment Script
# Frontend: SSG with client-side data fetching
# Backend: API server

set -e

PROJECT_DIR="$HOME/code/projects/meblog"
SERVER_USER="root"
SERVER_HOST="116.62.176.216"
SERVER_PASS="Ahern.123456"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Step 1: Proxy check
log "🔍 Checking proxy status..."
if ! python3 ~/code/skills/proxy-switcher/proxy_status_checker.py --check aliyun; then
    echo "❌ Proxy status incorrect!"
    exit 1
fi

# Step 2: Build frontend (SSG with client-side data)
log "🏗️  Building frontend..."
cd "$PROJECT_DIR/frontend/next-frontend"
npm run build

# Step 3: Upload files in parallel
log "📤 Uploading backend code..."
rsync -av --exclude='.venv' --exclude='__pycache__' --exclude='.git' \
    "$PROJECT_DIR/backend/" \
    "$SERVER_USER@$SERVER_HOST:/tmp/memblog-backend/" \
    --rsh="sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no" &

BACKEND_PID=$!

log "📤 Uploading frontend build..."
rsync -av --exclude='node_modules' --exclude='.git' \
    "$PROJECT_DIR/frontend/next-frontend/" \
    "$SERVER_USER@$SERVER_HOST:/tmp/memblog-frontend/" \
    --rsh="sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no" &

FRONTEND_PID=$!

wait $BACKEND_PID $FRONTEND_PID

# Step 4: Deploy backend first
log "🚀 Deploying backend..."
sshpass -p "$SERVER_PASS" ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
# Stop old backend
docker stop meblog-backend 2>/dev/null || true
docker rm meblog-backend 2>/dev/null || true

# Build and start new backend
cd /tmp/memblog-backend && docker build -t meblog-backend:new .
docker run -d --name meblog-backend --network host \
    -e DATABASE_URL=postgresql://meblog:meblog@localhost:6001/meblog \
    -e REDIS_URL=redis://localhost:6379/0 \
    meblog-backend:new

# Wait for backend to be ready
sleep 10
if ! curl -s http://localhost:8000/health | grep -q '"status":"ok"'; then
    echo "❌ Backend failed to start!"
    exit 1
fi
echo "✅ Backend deployed successfully"
EOF

# Step 5: Deploy frontend
log "🚀 Deploying frontend..."
sshpass -p "$SERVER_PASS" ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
# Stop old frontend
docker stop meblog-frontend 2>/dev/null || true
docker rm meblog-frontend 2>/dev/null || true

# Build and start new frontend
cd /tmp/memblog-frontend && docker build -t meblog-frontend:new .
docker run -d --name meblog-frontend -p 8001:3000 meblog-frontend:new

# Wait for frontend to be ready
sleep 15
if ! curl -s http://localhost:8001 | head -1 | grep -q '<!DOCTYPE html>'; then
    echo "❌ Frontend failed to start!"
    exit 1
fi
echo "✅ Frontend deployed successfully"
EOF

# Step 6: Cleanup
log "🧹 Cleaning up..."
sshpass -p "$SERVER_PASS" ssh "$SERVER_USER@$SERVER_HOST" "rm -rf /tmp/memblog-*"

# Step 7: Final verification
log "🔍 Final verification..."
sshpass -p "$SERVER_PASS" ssh "$SERVER_USER@$SERVER_HOST" << 'EOF'
echo "Backend status:"
curl -s http://localhost:8000/health
echo ""
echo "Frontend status:"
curl -s http://localhost:8001 | head -3
echo ""
docker ps | grep meblog
EOF

log "🎉 Separated architecture deployment completed!"
log "🌐 Frontend: http://$SERVER_HOST:8001"
log "⚙️  Backend: http://$SERVER_HOST:8000"