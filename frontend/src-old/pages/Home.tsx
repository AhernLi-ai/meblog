import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../api/posts';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { SparklesIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', { page }],
    queryFn: () => postsApi.getAll({ page, size: 5 }),
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
      {/* Hero Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-[var(--color-primary)]/10 rounded-full text-sm text-[var(--color-primary)]">
          <SparklesIcon className="w-4 h-4" />
          <span>欢迎来到我的博客</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-foreground)] mb-4" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          📝 Meblog
        </h1>
        <p className="text-lg text-[var(--color-foreground-secondary)] max-w-2xl mx-auto">
          分享技术与生活，记录成长点滴
        </p>
      </div>

      {/* Posts */}
      {data?.items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">暂无文章</h3>
          <p className="text-[var(--color-foreground-secondary)]">稍后再来看看吧</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
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
