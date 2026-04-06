# Meblog PRD - 产品需求文档

> **文档版本**: v1.0.0  
> **创建时间**: 2026-04-06  
> **最后更新**: 2026-04-06

---

## 1. 产品概述

### 1.1 基本信息
- **项目名称**: Meblog
- **项目类型**: 个人博客网站
- **项目代号**: meblog
- **版本号**: v1.0.0

### 1.2 核心功能
个人博客系统，支持博主撰写、发布、管理文章，并提供公开访问的博客阅读界面。

### 1.3 目标用户
- 博主 / 技术写作者
- 希望拥有独立博客的个人

### 1.4 产品边界（v1.0.0）
**包含：**
- 文章管理（CRUD）
- 分类 & 标签管理
- 用户认证
- 博客前台展示

**不包含：**
- 评论功能（后续版本迭代）
- 多作者支持（v1.0.0 为单博主）
- 图片上传（使用外部图床）
- SEO 优化高级功能

---

## 2. 技术栈

### 2.1 前端
| 技术 | 版本 | 说明 |
|------|------|------|
| TypeScript | ^5.0 | 类型安全 |
| React | ^18.0 | UI 框架 |
| TailwindCSS | ^3.0 | 原子化 CSS |
| React Router | ^6.0 | 路由管理 |
| React Query | ^5.0 | 数据请求/缓存 |
| React Markdown | ^9.0 | Markdown 渲染 |
| react-syntax-highlighter | ^5.0 | 代码语法高亮 |
| react-katex | ^3.0 | 数学公式渲染（KaTeX） |
| Vite | ^5.0 | 构建工具 |

### 2.2 后端
| 技术 | 版本 | 说明 |
|------|------|------|
| Python | ^3.12 | 运行环境 |
| uv | latest | 包管理器 |
| FastAPI | ^0.110 | Web 框架 |
| SQLAlchemy | ^2.0 | ORM |
| Pydantic | ^2.0 | 数据验证 |
| python-jose | ^3.3 | JWT 认证 |
| passlib | ^1.7 | 密码加密 |
| alembic | ^1.13 | 数据库迁移 |

### 2.3 数据库
| 技术 | 说明 |
|------|------|
| SQLite | v1.0.0 开发/测试环境 |
| PostgreSQL | 生产环境推荐 |

### 2.4 基础设施
- 前端部署：Vercel / Netlify
- 后端部署：Railway / Render / VPS
- 域名：自定义域名

---

## 3. 功能需求

### 3.1 文章管理

#### 3.1.1 创建文章
- 字段：标题、别名(slug)、正文、摘要、分类、标签、状态
- 标题：必填，最大 200 字符
- 正文：Markdown 格式，必填
- 摘要：选填，最大 500 字符，不填则自动截取正文前 200 字
- 别名：URL 友好格式，自动从标题生成，支持手动修改，唯一
- 分类：必填，单选
- 标签：选填，多选
- 状态：`draft`（草稿）/ `published`（已发布）

#### 3.1.2 编辑文章
- 所有字段均可编辑
- 修改已发布文章不影响已访问用户

#### 3.1.3 删除文章
- 软删除（标记为 deleted），不物理删除数据
- 删除后前台不展示

#### 3.1.4 文章列表
- 分页展示，每页 10 篇
- 支持按分类筛选
- 支持按标签筛选
- 支持关键词搜索（标题/正文）
- 按创建时间倒序排列

#### 3.1.5 文章详情
- 展示完整文章内容
- Markdown 渲染（代码高亮、表格、图片）
- **代码高亮**：支持主流编程语言语法高亮（Python、JavaScript、TypeScript、Go 等）
- **数学公式**：支持 LaTeX 语法渲染（行内公式 $...$ + 块级公式 $$...$$）
- 阅读量 +1

### 3.2 分类管理

#### 3.2.1 分类列表
- 展示所有分类及文章数量
- 支持新增、编辑、删除分类

#### 3.2.2 分类字段
- 名称：必填，最大 50 字符，唯一
- 别名：自动从名称生成，唯一

#### 3.2.3 删除约束
- 分类下有文章时不允许删除，需先转移文章

### 3.3 标签管理

#### 3.3.1 标签列表
- 展示所有标签及文章数量
- 支持新增、编辑、删除标签

#### 3.3.2 标签字段
- 名称：必填，最大 50 字符，唯一
- 别名：自动从名称生成，唯一

### 3.4 用户与认证

#### 3.4.1 用户注册
- 字段：用户名、邮箱、密码
- 用户名：3-20 字符，字母/数字/下划线
- 邮箱：有效邮箱格式，唯一
- 密码：最小 8 字符，需包含字母和数字

#### 3.4.2 用户登录
- 方式：用户名或邮箱 + 密码
- 返回 JWT Access Token
- Token 有效期：7 天

#### 3.4.3 JWT 认证
- 使用 Bearer Token
- 需认证的操作：创建/编辑/删除文章、分类、标签
- 无需认证：注册、登录、浏览博客前台

#### 3.4.4 个人资料
- 查看/编辑个人资料
- 修改密码

### 3.5 前台展示

#### 3.5.1 首页
- 博客名称 & 副标题
- 最新文章列表（分页）
- 侧边栏：分类列表、标签列表

#### 3.5.2 文章详情页
- 文章标题、发布时间、分类、标签
- Markdown 渲染正文
- 阅读量

#### 3.5.3 分类页
- 分类名称
- 该分类下的文章列表

#### 3.5.4 标签页
- 标签名称
- 该标签下的文章列表

---

## 4. 数据模型

### 4.1 数据库 ER 图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   User      │       │    Post     │       │  Category   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ username    │       │ title       │       │ name        │
│ email       │       │ slug        │       │ slug        │
│ password    │       │ content     │       └─────────────┘
│ created_at  │       │ summary     │              │
└─────────────┘       │ view_count  │              │
                      │ status      │              │
                      │ created_at  │              │
                      │ updated_at  │              │
                      │ user_id(FK) │◄────────────┘
                      │ category_id│
                      └─────────────┘
                            │
                            │
                      ┌─────────────┐
                      │    Tag      │
                      ├─────────────┤
                      │ id (PK)     │
                      │ name        │
                      │ slug        │
                      └─────────────┘
                            │
                     ┌──────────────┐
                     │  PostTag     │
                     │ (M2M关联表)  │
                     ├──────────────┤
                     │ post_id (FK) │
                     │ tag_id (FK)  │
                     └──────────────┘
```

### 4.2 数据表详细设计

#### users
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| username | VARCHAR(50) | UNIQUE, NOT NULL | 用户名 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 邮箱 |
| password_hash | VARCHAR(255) | NOT NULL | 密码哈希 |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

#### categories
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 分类名 |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL别名 |
| created_at | DATETIME | NOT NULL | 创建时间 |

#### tags
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| name | VARCHAR(50) | UNIQUE, NOT NULL | 标签名 |
| slug | VARCHAR(50) | UNIQUE, NOT NULL | URL别名 |
| created_at | DATETIME | NOT NULL | 创建时间 |

#### posts
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTO | 主键 |
| title | VARCHAR(200) | NOT NULL | 标题 |
| slug | VARCHAR(200) | UNIQUE, NOT NULL | URL别名 |
| content | TEXT | NOT NULL | 正文 |
| summary | TEXT | | 摘要 |
| view_count | INTEGER | DEFAULT 0 | 阅读量 |
| status | VARCHAR(20) | DEFAULT 'draft' | 状态 |
| is_deleted | BOOLEAN | DEFAULT FALSE | 软删除标记 |
| user_id | INTEGER | FK(users.id), NOT NULL | 作者 |
| category_id | INTEGER | FK(categories.id), NOT NULL | 分类 |
| created_at | DATETIME | NOT NULL | 创建时间 |
| updated_at | DATETIME | NOT NULL | 更新时间 |

#### post_tags (关联表)
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| post_id | INTEGER | FK(posts.id) | 文章ID |
| tag_id | INTEGER | FK(tags.id) | 标签ID |
| PRIMARY KEY (post_id, tag_id) | | | 联合主键 |

---

## 5. API 设计

> **Base URL**: `/api/v1`  
> **认证方式**: Bearer Token (JWT)  
> **内容类型**: application/json

### 5.1 认证相关

#### POST /auth/register - 用户注册
**Request:**
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "SecurePass123"
}
```
**Response (201):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "created_at": "2026-04-06T12:00:00Z"
}
```

#### POST /auth/login - 用户登录
**Request:**
```json
{
  "username": "admin",
  "password": "SecurePass123"
}
```
**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

#### GET /auth/me - 获取当前用户
**Headers:** `Authorization: Bearer <token>`  
**Response (200):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "created_at": "2026-04-06T12:00:00Z"
}
```

### 5.2 文章相关

#### GET /posts - 获取文章列表
**Query Parameters:**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | int | 1 | 页码 |
| size | int | 10 | 每页数量 |
| category | string | | 分类 slug |
| tag | string | | 标签 slug |
| q | string | | 搜索关键词 |

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "title": "我的第一篇文章",
      "slug": "my-first-post",
      "summary": "这是摘要...",
      "view_count": 100,
      "status": "published",
      "created_at": "2026-04-06T12:00:00Z",
      "category": {
        "id": 1,
        "name": "技术",
        "slug": "tech"
      },
      "tags": [
        {"id": 1, "name": "Python", "slug": "python"}
      ]
    }
  ],
  "total": 50,
  "page": 1,
  "size": 10,
  "pages": 5
}
```

#### GET /posts/{id_or_slug} - 获取文章详情
**Response (200):**
```json
{
  "id": 1,
  "title": "我的第一篇文章",
  "slug": "my-first-post",
  "content": "## Markdown 正文...",
  "summary": "这是摘要...",
  "view_count": 101,
  "status": "published",
  "created_at": "2026-04-06T12:00:00Z",
  "updated_at": "2026-04-06T12:00:00Z",
  "category": {
    "id": 1,
    "name": "技术",
    "slug": "tech"
  },
  "tags": [
    {"id": 1, "name": "Python", "slug": "python"}
  ],
  "author": {
    "id": 1,
    "username": "admin"
  }
}
```

#### POST /posts - 创建文章
**Headers:** `Authorization: Bearer <token>`  
**Request:**
```json
{
  "title": "我的第一篇文章",
  "content": "## Markdown 正文...",
  "summary": "这是摘要",
  "category_id": 1,
  "tag_ids": [1, 2],
  "status": "published"
}
```
**Response (201):** 同 GET /posts/{id}

#### PUT /posts/{id} - 更新文章
**Headers:** `Authorization: Bearer <token>`  
**Request:** 同 POST（所有字段可选）  
**Response (200):** 同 GET /posts/{id}

#### DELETE /posts/{id} - 删除文章（软删除）
**Headers:** `Authorization: Bearer <token>`  
**Response (204):** No Content

### 5.3 分类相关

#### GET /categories - 获取分类列表
**Response (200):**
```json
[
  {"id": 1, "name": "技术", "slug": "tech", "post_count": 10},
  {"id": 2, "name": "生活", "slug": "life", "post_count": 5}
]
```

#### POST /categories - 创建分类
**Headers:** `Authorization: Bearer <token>`  
**Request:**
```json
{
  "name": "技术"
}
```
**Response (201):**
```json
{
  "id": 1,
  "name": "技术",
  "slug": "tech",
  "created_at": "2026-04-06T12:00:00Z"
}
```

#### PUT /categories/{id} - 更新分类
**Headers:** `Authorization: Bearer <token>`  
**Request:** `{"name": "新技术"}`  
**Response (200):** 同 POST

#### DELETE /categories/{id} - 删除分类
**Headers:** `Authorization: Bearer <token>`  
**Response (204):** No Content  
**Error (400):** 分类下有文章时返回错误

### 5.4 标签相关

#### GET /tags - 获取标签列表
**Response (200):**
```json
[
  {"id": 1, "name": "Python", "slug": "python", "post_count": 8},
  {"id": 2, "name": "React", "slug": "react", "post_count": 3}
]
```

#### POST /tags - 创建标签
**Headers:** `Authorization: Bearer <token>`  
**Request:** `{"name": "Python"}`  
**Response (201):** 同 GET

#### PUT /tags/{id} - 更新标签
**Headers:** `Authorization: Bearer <token>`  
**Request:** `{"name": "Python3"}`  
**Response (200):** 同 POST

#### DELETE /tags/{id} - 删除标签
**Headers:** `Authorization: Bearer <token>`  
**Response (204):** No Content

### 5.5 错误响应格式
```json
{
  "detail": "Error message here"
}
```

| HTTP Code | 说明 |
|-----------|------|
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 422 | 数据验证失败 |
| 500 | 服务器错误 |

---

## 6. 页面设计

### 6.1 前台页面（公开访问）

#### 首页 /
- 顶部：博客名称 + 导航（首页/分类/标签/关于）
- 主内容区：
  - 博客副标题/介绍
  - 文章卡片列表（标题、摘要、发布时间、分类、阅读量）
  - 底部分页导航
- 侧边栏：
  - 分类列表（带文章数）
  - 标签列表（带文章数）
  - 博主信息卡片

#### 文章详情页 /post/{slug}
- 顶部：返回链接 + 文章标题
- 元信息：发布时间、分类链接、标签链接、阅读量
- 正文：Markdown 渲染（代码高亮、表格、图片）
- **代码块**：语法高亮 + 复制按钮
- **数学公式**：KaTeX 渲染（行内/块级）
- 底部：上一篇/下一篇导航

#### 分类页 /category/{slug}
- 顶部：分类名称 + 文章数量
- 文章列表（同首页文章列表）

#### 标签页 /tag/{slug}
- 顶部：标签名称 + 文章数量
- 文章列表（同首页文章列表）

### 6.2 管理后台（需登录）

#### 仪表盘 /admin
- 欢迎信息
- 快捷统计：文章数、分类数、标签数
- 最近发布的文章

#### 文章管理 /admin/posts
- 文章列表（标题、状态、发布时间、操作按钮）
- 筛选：状态（全部/已发布/草稿）
- 操作：新建、编辑、删除

#### 新建/编辑文章 /admin/posts/new 或 /admin/posts/{id}/edit
- 标题输入框
- 别名输入框（自动生成，支持手动修改）
- Markdown 编辑器（左右分栏：编辑/预览）
- 摘要输入框
- 分类下拉选择
- 标签多选
- 状态切换（草稿/发布）
- 保存/取消按钮

#### 分类管理 /admin/categories
- 分类表格（名称、别名、文章数、操作）
- 新建分类弹窗

#### 标签管理 /admin/tags
- 标签表格（名称、别名、文章数、操作）
- 新建标签弹窗

#### 登录页 /login
- 用户名/邮箱输入框
- 密码输入框
- 登录按钮
- 注册链接

#### 注册页 /register
- 用户名、邮箱、密码、确认密码
- 注册按钮
- 登录链接

---

## 7. 项目结构

```
meblog/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI 入口
│   │   ├── config.py            # 配置
│   │   ├── database.py          # 数据库连接
│   │   ├── models/               # SQLAlchemy 模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   ├── category.py
│   │   │   └── tag.py
│   │   ├── schemas/             # Pydantic 模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   ├── category.py
│   │   │   └── tag.py
│   │   ├── routers/             # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── posts.py
│   │   │   ├── categories.py
│   │   │   └── tags.py
│   │   ├── crud/                 # 数据库操作
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   ├── category.py
│   │   │   └── tag.py
│   │   └── utils/                # 工具函数
│   │       ├── __init__.py
│   │       ├── security.py       # 密码哈希、JWT
│   │       └── slug.py           # Slug 生成
│   ├── tests/                    # 测试
│   ├── alembic/                  # 数据库迁移
│   ├── pyproject.toml            # 项目配置（uv）
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # API 调用
│   │   │   ├── client.ts         # axios 实例
│   │   │   ├── auth.ts
│   │   │   ├── posts.ts
│   │   │   ├── categories.ts
│   │   │   └── tags.ts
│   │   ├── components/           # 公共组件
│   │   │   ├── Layout.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── MarkdownEditor.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   └── Pagination.tsx
│   │   ├── pages/                # 页面组件
│   │   │   ├── Home.tsx
│   │   │   ├── PostDetail.tsx
│   │   │   ├── CategoryPosts.tsx
│   │   │   ├── TagPosts.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Admin.tsx
│   │   │   ├── AdminPosts.tsx
│   │   │   ├── AdminPostNew.tsx
│   │   │   ├── AdminPostEdit.tsx
│   │   │   ├── AdminCategories.tsx
│   │   │   └── AdminTags.tsx
│   │   ├── hooks/                # 自定义 Hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useToast.ts
│   │   ├── context/               # React Context
│   │   │   └── AuthContext.tsx
│   │   ├── types/                # TypeScript 类型
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── README.md
│
└── docs/
    ├── PRD.md
    └── README.md
```

---

## 8. 路由汇总

### 前台路由
| 路径 | 页面 | 权限 |
|------|------|------|
| / | 首页 | 公开 |
| /post/{slug} | 文章详情 | 公开 |
| /category/{slug} | 分类文章 | 公开 |
| /tag/{slug} | 标签文章 | 公开 |
| /login | 登录 | 公开 |
| /register | 注册 | 公开 |

### 后台路由
| 路径 | 页面 | 权限 |
|------|------|------|
| /admin | 仪表盘 | 需登录 |
| /admin/posts | 文章列表 | 需登录 |
| /admin/posts/new | 新建文章 | 需登录 |
| /admin/posts/{id}/edit | 编辑文章 | 需登录 |
| /admin/categories | 分类管理 | 需登录 |
| /admin/tags | 标签管理 | 需登录 |

---

## 9. 进度跟踪

### v1.0.0 开发任务
- [x] PRD 文档完成
- [x] 项目初始化
  - [x] 后端项目创建 & 依赖安装
  - [ ] 前端项目创建 & 依赖安装
  - [ ] Git 初始化
- [x] 后端开发
  - [x] 数据库模型创建
  - [ ] 数据库迁移配置
  - [x] 认证模块（注册/登录/JWT）
  - [x] 分类 CRUD
  - [x] 标签 CRUD
  - [x] 文章 CRUD
  - [ ] API 测试
- [x] 前端开发
  - [x] 项目基础配置（Tailwind、Router、API Client）
  - [x] 认证相关页面
  - [x] 前台公共组件（Layout、Navbar、Sidebar）
  - [x] 首页开发
  - [x] 文章详情页开发
  - [x] 分类/标签页开发
  - [x] 管理后台页面
  - [ ] Markdown 编辑器（完整版，含数学公式）
- [ ] 前后端联调
- [ ] 部署上线

---

## 10. 附录

### 10.1 常用命令

**后端：**
```bash
cd backend
uv sync                     # 安装依赖（使用 Python 3.12）
uv run uvicorn app.main:app --reload --port 8000  # 启动开发服务器
```

**前端：**
```bash
cd frontend
npm install
npm run dev           # 开发模式
npm run build         # 生产构建
npm run preview       # 预览构建结果
```

### 10.2 环境变量

**后端 (.env）：**
```
DATABASE_URL=sqlite:///./meblog.db
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

**前端 (.env)：**
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 10.3 开发规范

- Git 分支：master（稳定）、develop（开发）
- Commit 规范：feat/fix/docs/style/refactor/test/chore
- API 命名：RESTful 风格，复数名词
- 代码格式化：Prettier（前端）、Black（后端）
