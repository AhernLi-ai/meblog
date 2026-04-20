# Multi-stage build for Next.js frontend with Bun

# Build stage
FROM registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine AS builder

# Install Bun (ultra-fast JavaScript runtime and package manager)
RUN npm install -g bun

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with Bun
RUN bun install

# Copy source code
COPY . .

# Build the Next.js application
RUN bun run build

# Production stage
FROM registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine AS runner

# Install Bun in production
RUN npm install -g bun

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy built files from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./server.js

# Install only production dependencies with Bun
RUN bun install --production

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Start command
CMD ["bun", "server.js"]