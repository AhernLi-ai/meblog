import { postsApi } from '@/api/posts';
import type { PostListResponse } from '@/types';
import ClientPosts from '@/components/ClientPosts';
import { SparklesIcon } from '@heroicons/react/24/outline';

export const revalidate = 3600;

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1', 10);
  
  // 尝试在构建时获取数据（可选，用于SEO）
  let initialData: PostListResponse | null = null;
  try {
    const result = await postsApi.getAll({ page, size: 5 });
    initialData = result;
  } catch {
    // 构建时后端不可用，没关系，客户端会处理
    initialData = null;
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

      {/* Posts - 使用客户端组件 */}
      <ClientPosts initialData={initialData} currentPage={page} />
    </div>
  );
}
