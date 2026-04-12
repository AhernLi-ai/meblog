# Copyright 2026 布谷布谷科技
# Licensed under the Apache License, Version 2.0

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import engine, Base
from .routers import auth_router, posts_router, projects_router, tags_router, settings_router, stats_router, about_router
from .routers.seo import router as seo_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(posts_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(tags_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(stats_router, prefix=settings.API_V1_STR)
app.include_router(about_router, prefix=settings.API_V1_STR)

# SEO endpoints at root level (not under /api/v1)
app.include_router(seo_router)


@app.get("/")
def root():
    return {"message": "Meblog API", "version": settings.VERSION}


@app.get("/health")
def health():
    return {"status": "ok"}
