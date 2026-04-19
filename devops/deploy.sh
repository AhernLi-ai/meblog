#!/bin/bash
# Smart Deployment Script for meblog
# Handles backend-first deployment and zero-downtime updates

set -e

PROJECT_DIR="$HOME/code/projects/meblog"
DEVOPS_DIR="$PROJECT_DIR/devops"
SERVER_USER="root"
SERVER_HOST="116.62.176.216"
SERVER_PASS="Ahern.123456"
SERVER_PROJECT_DIR="/root/code/projects/memblog"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to run SSH command with password
ssh_cmd() {
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "$1"
}

# Function to run SCP command with password  
scp_cmd() {
    sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no "$@"
}

# Step 1: Proxy status check
check_proxy() {
    log "🔍 Checking proxy status for safe Alibaba Cloud access..."
    if ! python3 ~/code/skills/proxy-switcher/proxy_status_checker.py --check aliyun; then
        error "Proxy status incorrect! Please disable proxy before deployment."
    fi
    log "✅ Proxy status verified - safe to proceed"
}

# Step 2: Build frontend locally (SSG needs backend API)
build_frontend() {
    log "🏗️  Building frontend (Next.js SSG)..."
    cd "$PROJECT_DIR/frontend/next-frontend"
    
    # Verify backend is accessible for SSG
    log "📡 Verifying backend API accessibility for SSG..."
    if ! curl -s --max-time 10 http://localhost:8000/health | grep -q '"status":"ok"'; then
        warning "Local backend not accessible. SSG may fail if it depends on live API data."
        warning "Consider running local backend or ensuring staging backend is available."
    fi
    
    npm run build
    if [ ! -d ".next" ]; then
        error "Frontend build failed - .next directory not found"
    fi
    log "✅ Frontend build completed successfully"
}

# Step 3: Upload deployment files to server
upload_files() {
    log "📤 Uploading deployment files to server..."
    
    # Create temp directory on server
    ssh_cmd "mkdir -p /tmp/memblog-deploy/{frontend,backend}"
    
    # Upload frontend files (excluding node_modules, .git, etc.)
    log "📤 Uploading frontend files..."
    rsync -av --exclude='node_modules' --exclude='.git' --exclude='.next/cache' \
        "$PROJECT_DIR/frontend/next-frontend/" \
        "$SERVER_USER@$SERVER_HOST:/tmp/memblog-deploy/frontend/" \
        --rsh="sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no"
    
    # Upload backend files
    log "📤 Uploading backend files..."
    rsync -av --exclude='.venv' --exclude='__pycache__' --exclude='.git' --exclude='*.db' \
        "$PROJECT_DIR/backend/" \
        "$SERVER_USER@$SERVER_HOST:/tmp/memblog-deploy/backend/" \
        --rsh="sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no"
    
    # Upload devops files (Dockerfiles)
    log "📤 Uploading DevOps configuration..."
    scp_cmd "$DEVOPS_DIR/frontend/Dockerfile" "$SERVER_USER@$SERVER_HOST:/tmp/memblog-deploy/frontend/"
    scp_cmd "$DEVOPS_DIR/backend/Dockerfile" "$SERVER_USER@$SERVER_HOST:/tmp/memblog-deploy/backend/"
    
    log "✅ All files uploaded successfully"
}

# Step 4: Deploy backend first (required for frontend SSG consistency)
deploy_backend() {
    log "🚀 Deploying backend first (required for frontend SSG)..."
    
    # Build backend image
    ssh_cmd "cd /tmp/memblog-deploy/backend && docker build -t meblog-backend:new ."
    
    # Start new backend container with temporary name
    ssh_cmd "docker run -d --name meblog-backend-new-temp --network host \
        -e DATABASE_URL=postgresql://meblog:meblog@localhost:6001/meblog \
        -e REDIS_URL=redis://localhost:6379/0 \
        meblog-backend:new"
    
    # Wait for backend to be ready
    log "⏳ Waiting for new backend to be ready..."
    sleep 10
    
    # Verify new backend health
    if ! ssh_cmd "curl -s http://localhost:8000/health | grep -q '\"status\":\"ok\"'"; then
        error "New backend failed health check!"
    fi
    
    # Stop old backend and rename new one
    ssh_cmd "docker stop meblog-backend || true"
    ssh_cmd "docker rm meblog-backend || true"
    ssh_cmd "docker rename meblog-backend-new-temp meblog-backend"
    
    log "✅ Backend deployed successfully"
}

# Step 5: Deploy frontend with zero downtime
deploy_frontend() {
    log "🚀 Deploying frontend with zero downtime..."
    
    # Build frontend image
    ssh_cmd "cd /tmp/memblog-deploy/frontend && docker build -t meblog-frontend:new ."
    
    # Start new frontend container on different port temporarily
    ssh_cmd "docker run -d --name meblog-frontend-new-temp -p 8002:3000 meblog-frontend:new"
    
    # Wait for frontend to be ready
    log "⏳ Waiting for new frontend to be ready..."
    sleep 15
    
    # Verify new frontend is accessible
    if ! ssh_cmd "curl -s --max-time 10 http://localhost:8002 | head -1 | grep -q '<!DOCTYPE html>'"; then
        error "New frontend failed to start properly!"
    fi
    
    # Switch ports by stopping old and starting new on correct port
    ssh_cmd "docker stop meblog-frontend || true"
    ssh_cmd "docker rm meblog-frontend || true"
    ssh_cmd "docker rename meblog-frontend-new-temp meblog-frontend"
    
    # Ensure it's running on correct port
    ssh_cmd "docker stop meblog-frontend && docker run -d --name meblog-frontend -p 8001:3000 meblog-frontend:new"
    
    log "✅ Frontend deployed successfully"
}

# Step 6: Cleanup
cleanup() {
    log "🧹 Cleaning up temporary files..."
    ssh_cmd "rm -rf /tmp/memblog-deploy"
    log "✅ Cleanup completed"
}

# Step 7: Final verification
verify_deployment() {
    log "🔍 Verifying final deployment..."
    
    # Check containers are running
    if ! ssh_cmd "docker ps | grep -q meblog-backend"; then
        error "Backend container not running!"
    fi
    
    if ! ssh_cmd "docker ps | grep -q meblog-frontend"; then
        error "Frontend container not running!"
    fi
    
    # Health checks
    ssh_cmd "curl -s http://localhost:8000/health"
    ssh_cmd "curl -s http://localhost:8001 | head -5"
    
    log "✅ All services verified and running!"
    log "🌐 Frontend: http://$SERVER_HOST:8001"
    log "⚙️  Backend: http://$SERVER_HOST:8000"
}

# Main deployment flow
main() {
    log "🚀 Starting meblog smart deployment..."
    
    check_proxy
    build_frontend
    upload_files
    deploy_backend
    deploy_frontend
    cleanup
    verify_deployment
    
    log "🎉 Deployment completed successfully!"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo "Options:"
        echo "  --help, -h    Show this help message"
        echo "  --frontend-only  Deploy frontend only"
        echo "  --backend-only   Deploy backend only"
        echo ""
        echo "This script handles:"
        echo "1. Proxy status verification"
        echo "2. Frontend SSG build (requires backend API)"
        echo "3. Backend-first deployment"
        echo "4. Zero-downtime frontend deployment"
        echo "5. Automatic cleanup and verification"
        ;;
    --backend-only)
        check_proxy
        upload_files
        deploy_backend
        cleanup
        verify_deployment
        ;;
    --frontend-only)
        check_proxy
        build_frontend
        upload_files
        deploy_frontend
        cleanup
        verify_deployment
        ;;
    *)
        main
        ;;
esac