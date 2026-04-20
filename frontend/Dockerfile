FROM node:18-alpine AS base

# 在基础镜像中安装 Bun 一次，供所有阶段使用
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g bun
ENV PATH="/root/.npm-global/bin:$PATH"

WORKDIR /app

# 依赖安装阶段
FROM base AS deps
COPY package*.json ./
RUN bun install --frozen-lockfile

# 构建阶段  
FROM base AS builder
# 接收构建参数
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_ENV
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_ENV=${NEXT_PUBLIC_ENV}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# 运行阶段（生产）
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY server.js ./

EXPOSE 3000
CMD ["bun", "server.js"]