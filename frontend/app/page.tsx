import { fetchFromServerApi } from '@/app/lib/server-api';
import type { PostListResponse } from '@/types';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
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
      <section className="mb-10 md:mb-12 px-2 py-16 md:px-4 md:py-24">
          <h1
            className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Hello World; 我是
            <br />
            <span className="text-blue-600 dark:text-blue-300">李衡</span>
            <br />
            <br />
            我在构建 AI 系统
            <br />
            而不仅仅是调用模型
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg dark:text-slate-300">
            从 RAG、Agent 到 AI 平台架构，专注把模型能力变成真正可运行的系统，解决复杂业务问题，而不是停留在 Demo。
          </p>
      </section>

      <section className="mx-auto -mt-20 mb-16 max-w-4xl px-6">
        <div className="relative rounded-2xl border border-slate-200 bg-white/50 p-8 shadow-sm backdrop-blur dark:border-slate-500/55 dark:bg-slate-800/45 dark:shadow-[0_8px_24px_rgba(2,6,23,0.35)]">
          <div className="absolute -top-3 left-6 text-2xl text-slate-300 dark:text-slate-500">“</div>
          <p className="mt-1 text-[15px] font-medium leading-relaxed text-slate-600 md:text-[17px] dark:text-slate-200">
            The best systems are not built by adding more, but by removing what shouldn&apos;t exist.
          </p>
          <div className="mt-3 text-[11px] uppercase tracking-[0.1em] text-slate-400 dark:text-slate-400">— Engineering Philosophy</div>
        </div>
      </section>

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
