'use client';

import { useState, useEffect } from 'react';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import type { Project, PostListResponse } from '@/types';

interface ProjectClientProps {
  initialProjectSlug: string;
  initialCategory: Project | null;
  initialData: PostListResponse;
  initialPage: number;
}

export default function ProjectClient({ initialProjectSlug, initialCategory, initialData, initialPage }: ProjectClientProps) {
  const slug = initialProjectSlug;
  const [page, setPage] = useState(initialPage);
  const [category, setCategory] = useState(initialCategory);
  const [postsData, setPostsData] = useState(initialData);
  const [loading, setLoading] = useState(!initialCategory || !initialData.items.length);

  useEffect(() => {
    if (!category) {
      fetch(`/api/v1/projects/${slug}`)
        .then(res => res.json())
        .then(data => {
          setCategory(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug, category]);

  useEffect(() => {
    fetch(`/api/v1/posts?category=${slug}&page=${page}&size=5`)
      .then(res => res.json())
      .then(data => {
        setPostsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, page]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)]">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[var(--color-foreground-secondary)]">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)]">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--color-foreground-secondary)]">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          {category?.name || slug}
        </h1>
        <p className="text-[var(--color-foreground-secondary)]">
          共 {postsData?.total || 0} 篇文章
        </p>
      </div>

      {postsData?.items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">暂无文章</h3>
          <p className="text-[var(--color-foreground-secondary)]">该项目下还没有文章</p>
        </div>
      ) : (
        <div className="space-y-6">
          {postsData?.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {postsData && postsData.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={postsData.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
