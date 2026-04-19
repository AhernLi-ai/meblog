# Frontend Dockerfile for Next.js SSG
# Multi-stage build with optimized caching

# Base image
FROM node:20-alpine AS base

# Install system dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json ./
# Create .npmrc for consistent registry configuration
RUN echo "registry=https://registry.npmmirror.com" > .npmrc && \
    echo "sass_binary_site=https://npmmirror.com/mirrors/node-sass/" >> .npmrc && \
    echo "phantomjs_cdnurl=https://npmmirror.com/mirrors/phantomjs/" >> .npmrc && \
    echo "electron_mirror=https://npmmirror.com/mirrors/electron/" >> .npmrc

# Install dependencies with offline preference and Chinese mirror
RUN npm ci --prefer-offline --no-audit --no-fund

# Builder stage - build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.npmrc ./

# Copy source code
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application (SSG will call backend APIs during this step)
RUN npm run build

# Production runner stage
FROM base AS runner
WORKDIR /app

# System user setup
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy static files and standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Security: non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "server.js"]