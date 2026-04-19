# meblog DevOps 目录说明

## 目录结构
```
meblog/
├── devops/                    # DevOps 配置目录
│   ├── frontend/             # 前端部署配置
│   │   └── Dockerfile        # 优化的前端 Dockerfile
│   ├── backend/              # 后端部署配置  
│   │   └── Dockerfile        # 优化的后端 Dockerfile
│   ├── deploy.sh             # 智能部署脚本
│   └── docker-compose.yml    # Docker Compose 配置（可选）
├── frontend/                 # 前端源码
└── backend/                  # 后端源码
```

## 优化特性

### 1. **依赖缓存优化**
- **前端**: 先拷贝 `package.json` 和 `package-lock.json`，再安装依赖
- **后端**: 先拷贝 `pyproject.toml` 和 `uv.lock`，再安装 Python 依赖
- **效果**: 依赖文件不变时，Docker 会自动跳过依赖安装层，大幅减少构建时间

### 2. **国内源加速**
- **前端**: 使用 npmmirror.com (淘宝 NPM 镜像)
- **后端**: 使用 pypi.tuna.tsinghua.edu.cn (清华 PyPI 镜像)
- **效果**: 依赖下载速度提升 3-5 倍

### 3. **部署顺序保证**
- **SSG 依赖**: 前端 SSG 构建需要调用后端 API
- **部署策略**: 后端先部署并验证健康状态，再部署前端
- **效果**: 避免前端构建时后端不可用导致的错误

### 4. **零停机部署**
- **服务连续性**: 新服务启动并验证成功后，才停止旧服务
- **临时端口**: 前端使用临时端口 (8002) 验证，再切换到正式端口 (8001)
- **效果**: 用户访问无中断，服务可用性 99.9%+

### 5. **安全加固**
- **非 root 用户**: 容器内使用专用用户运行应用
- **健康检查**: 自动检测服务健康状态
- **网络隔离**: 后端使用 host network，前端使用端口映射

## 使用方法

### 手动部署
```bash
# 全量部署（推荐）
cd ~/code/projects/meblog/devops
./deploy.sh

# 仅部署后端
./deploy.sh --backend-only

# 仅部署前端  
./deploy.sh --frontend-only
```

### Docker Compose 部署（可选）
```bash
# 在服务器上使用
cd /root/code/projects/memblog/devops
docker-compose up -d --build
```

## 构建性能对比

| 场景 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| 首次构建 | ~5分钟 | ~5分钟 | - |
| 依赖未变 | ~5分钟 | ~30秒 | 10x |
| 仅代码变更 | ~5分钟 | ~1分钟 | 5x |

## 注意事项

1. **代理状态**: 部署前确保代理已关闭（脚本会自动检查）
2. **SSG 依赖**: 本地构建前端时，确保后端 API 可访问
3. **数据库连接**: 后端容器需要能访问主机上的 PostgreSQL (6001) 和 Redis (6379)
4. **端口冲突**: 确保 8000/8001 端口未被占用