# 使用 Node.js 20 Alpine 镜像（兼容 Next.js 16，满足最低版本要求 Node.js 20.9.0+）
FROM registry.cn-hangzhou.aliyuncs.com/library/node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 bun.lockb（如果使用 Bun）
COPY package*.json ./

# 安装依赖（使用 npm，因为服务器可能无法访问 Bun 源）
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 创建非 root 用户以提高安全性
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 更改应用目录的所有权
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]