# ==========================
# 构建阶段 builder
# ==========================
FROM docker.m.daocloud.io/library/node:20-alpine AS builder
# Alpine 内置 curl + 用【国内官方源】安装 Bun（100%连通）
RUN apk add --no-cache curl && \
curl -fsSL https://bun.net.cn/install | bash
# 加入环境变量
ENV PATH="/root/.bun/bin:$PATH"
WORKDIR /app
# Bun 全局配置国内 npmmirror 镜像（依赖下载不超时）
RUN bun config set registry https://registry.npmmirror.com
# 缓存优先：先复制依赖文件
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
# 复制源码 + Next.js 构建
COPY . .
RUN bun run build
# ==========================
# 运行阶段 runner
# ==========================
FROM docker.m.daocloud.io/library/node:20-alpine AS runner
# 同样国内源安装 Bun
RUN apk add --no-cache curl && \
curl -fsSL https://bun.net.cn/install | bash
ENV PATH="/root/.bun/bin:$PATH"
WORKDIR /app
# 非 root 安全用户
RUN addgroup -g 1001 -S nodejs && \
adduser -S nextjs -u 1001
# 仅复制构建产物，精简镜像
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./
COPY --from=builder /app/server.js ./
# 生产依赖 + 国内源锁定
RUN bun config set registry https://registry.npmmirror.com
RUN bun install --production --frozen-lockfile
# 权限与启动
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
CMD ["bun", "server.js"]