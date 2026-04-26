import { fetchFromServerApi } from '@/app/lib/server-api';
import type { PostListResponse } from '@/types';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { use } from 'react';

export const revalidate = 180;

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

const getHomeData = async (page: number): Promise<{ data: PostListResponse; error: boolean }> => {
  let data: PostListResponse = { items: [], total: 0, page, size: 5, pages: 1 };
  let error = false;

  try {
    const result = await fetchFromServerApi<PostListResponse>(`/posts?page=${page}&size=5&include_hidden=true`, {
      revalidate,
    });
    if (result) data = result;
  } catch {
    // 构建时后端不可用，返回空数据，让客户端处理
    error = true;
  }

  return { data, error };
};

export default function Home({ searchParams }: HomeProps) {
  const { page: pageStr } = use(searchParams);
  const page = parseInt(pageStr || '1', 10);
  const { data, error } = use(getHomeData(page));

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
      {!error && data?.items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">暂无文章</h3>
          <p className="text-[var(--color-foreground-secondary)]">稍后再来看看吧</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">正在加载文章...</h3>
          <p className="text-[var(--color-foreground-secondary)]">请稍候，我们正在获取最新内容</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!error && data && data.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.pages}
          getPageHref={(nextPage) => `/?page=${nextPage}`}
        />
      )}
    </div>
  );
}
