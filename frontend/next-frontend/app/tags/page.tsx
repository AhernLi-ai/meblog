'use client';

import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '@/api/tags';
import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function TagsPage() {
  const { data: tags = [], isLoading, error } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
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
          🏷️ 标签列表
        </h1>
        <p className="text-[var(--color-foreground-secondary)]">
          共 {tags.length} 个标签
        </p>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">暂无标签</h3>
          <p className="text-[var(--color-foreground-secondary)]">稍后再来看看吧</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 group"
            >
              <SparklesIcon className="w-4 h-4 text-[var(--color-primary)] group-hover:text-white transition-colors" />
              <span className="text-[var(--color-foreground)] group-hover:text-white transition-colors font-medium">
                {tag.name}
              </span>
              <span className="px-2 py-0.5 text-xs bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)] group-hover:bg-white/20 group-hover:text-white rounded-full transition-colors">
                {tag.post_count || 0}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
