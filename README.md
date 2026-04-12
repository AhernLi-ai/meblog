# meblog

A personal tech blog built with React + FastAPI.

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Query

**Backend**
- FastAPI
- SQLAlchemy
- SQLite / PostgreSQL

## Features

- 📝 Markdown 文章编写
- 🏷️ 标签与项目分类
- 👍 点赞功能
- 🌙 Light/Dark Mode
- 📱 响应式设计

## Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
uv sync
uvicorn app.main:app --reload
```

## API Endpoints

- `GET /api/v1/posts` - 获取文章列表
- `GET /api/v1/posts/{slug}` - 获取文章详情
- `POST /api/v1/posts/{slug}/like` - 点赞
- `GET /api/v1/tags` - 获取标签
- `GET /api/v1/projects` - 获取项目

## License

Copyright 2026 布谷布谷科技

Licensed under the Apache License, Version 2.0.
See [LICENSE](LICENSE) for details.
