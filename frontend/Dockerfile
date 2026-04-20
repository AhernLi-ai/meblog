# ==========================
# 构建阶段
# ==========================
FROM docker.m.daocloud.io/library/node:20-alpine AS builder
WORKDIR /app
# 👇 全国内源，100%不卡
RUN npm config set registry https://registry.npmmirror.com
# 依赖
COPY package*.json ./
RUN npm install --frozen-lockfile
# 构建
COPY . .
RUN npm run build
# ==========================
# 运行阶段
# ==========================
FROM docker.m.daocloud.io/library/node:20-alpine AS runner
WORKDIR /app
# 国内源
RUN npm config set registry https://registry.npmmirror.com
# 非root
RUN addgroup -g 1001 -S nodejs && \
adduser -S nextjs -u 1001
# 复制产物
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./
# 生产依赖
RUN npm install --production --frozen-lockfile
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]