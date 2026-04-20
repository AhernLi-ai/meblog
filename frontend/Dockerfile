FROM node:18-alpine

# 安装 Bun 通过阿里云 npm 镜像
RUN npm config set registry https://registry.npmmirror.com && \
    npm install -g bun
ENV PATH="/root/.npm-global/bin:$PATH"

WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN bun install --frozen-lockfile

# 复制源代码并构建
COPY . .
RUN bun run build

# 生产环境配置
ENV NODE_ENV=production
EXPOSE 3000

# 启动应用
CMD ["bun", "server.js"]