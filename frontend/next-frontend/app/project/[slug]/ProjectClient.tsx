'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '@/api/posts';
import { projectsApi } from '@/api/projects';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';

interface ProjectClientProps {
  initialProjectSlug?: string;
}

export default function ProjectClient({ initialProjectSlug }: ProjectClientProps) {
  const params = useParams();
  const slug = initialProjectSlug || params.slug as string;
  const [page, setPage] = useState(1);

  const { data: category } = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectsApi.getBySlug(slug),
    enabled: !!slug,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', 'category', slug, { page }],
    queryFn: () => postsApi.getAll({ category: slug, page, size: 5 }),
    enabled: !!slug,
  });

  if (isLoading) {
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

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-[12px]">
          加载失败，请稍后重试
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
          共 {data?.total || 0} 篇文章
        </p>
      </div>

      {data?.items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">暂无文章</h3>
          <p className="text-[var(--color-foreground-secondary)]">该项目下还没有文章</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
