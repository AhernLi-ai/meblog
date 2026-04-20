# ==========================
# 构建阶段
# ==========================
FROM docker.m.daocloud.io/library/node:20-alpine AS builder
# 开启国内镜像 + 安装 Bun（超快）
RUN npm config set registry https://registry.npmmirror.com && \
npm install -g bun
WORKDIR /app
# 配置 Bun 国内镜像（关键！不超时）
RUN bun config set registry https://registry.npmmirror.com
# 只复制依赖文件（缓存最大化）
COPY package.json bun.lockb ./
# 安装依赖（国内源，秒装）
RUN bun install --frozen-lockfile
# 复制源码
COPY . .
# 构建 Next.js
RUN bun run build
# ==========================
# 运行阶段（超小体积）
# ==========================
FROM docker.m.daocloud.io/library/node:20-alpine AS runner
# 国内源安装 Bun
RUN npm config set registry https://registry.npmmirror.com && \
npm install -g bun
WORKDIR /app
# 非 root 用户（安全）
RUN addgroup -g 1001 -S nodejs && \
adduser -S nextjs -u 1001
# 从构建阶段复制必需文件（最小化）
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./
COPY --from=builder /app/server.js ./
# 生产依赖（国内源）
RUN bun config set registry https://registry.npmmirror.com
RUN bun install --production --frozen-lockfile
# 权限
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
CMD ["bun", "server.js"]