FROM node:18-alpine AS base

# 安装 Bun 通过阿里云 npm 镜像
FROM base AS deps
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g bun
ENV PATH="/root/.npm-global/bin:$PATH"

WORKDIR /app
COPY package*.json ./
RUN bun install --frozen-lockfile

# 构建阶段
FROM base AS builder
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g bun
ENV PATH="/root/.npm-global/bin:$PATH"

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# 运行阶段
FROM base AS runner
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g bun
ENV PATH="/root/.npm-global/bin:$PATH"

WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY server.js ./

EXPOSE 3000
CMD ["bun", "server.js"]