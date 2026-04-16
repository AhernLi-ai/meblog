'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { projectsApi } from '@/api/projects';
import { FolderIcon } from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: projectsApi.getAll,
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
          📂 项目分类
        </h1>
        <p className="text-[var(--color-foreground-secondary)]">
          共 {categories.length} 个分类
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">暂无项目</h3>
          <p className="text-[var(--color-foreground-secondary)]">稍后再来看看吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="group bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)]"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-[var(--color-primary)]/10 rounded-[10px] group-hover:bg-[var(--color-primary)] transition-colors">
                    <FolderIcon className="w-6 h-6 text-[var(--color-primary)] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                      {cat.name}
                    </h2>
                    <p className="text-sm text-[var(--color-foreground-secondary)]">
                      {cat.post_count || 0} 篇文章
                    </p>
                  </div>
                </div>
                {cat.description && (
                  <p className="text-sm text-[var(--color-foreground-secondary)] line-clamp-2">
                    {cat.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
