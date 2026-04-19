# Use official node image 
FROM node:20-alpine AS base

# Install Bun using precompiled binary (more reliable)
RUN apk add --no-cache curl unzip && \
    curl -fsSL https://github.com/oven-sh/bun/releases/download/bun-v1.3.12/bun-linux-x64.zip -o /tmp/bun.zip && \
    unzip /tmp/bun.zip -d /usr/local && \
    rm /tmp/bun.zip && \
    ln -s /usr/local/bun/bin/bun /usr/local/bin/bun

# Verify installation
RUN bun --version

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --prefer-offline

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR / app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["bun", "server.js"]