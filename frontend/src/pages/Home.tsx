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
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600 dark:text-gray-400">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
          加载失败，请稍后重试
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-sm text-blue-600 dark:text-blue-400">
          <SparklesIcon className="w-4 h-4" />
          <span>欢迎来到我的博客</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          📝 Meblog
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          分享技术与生活，记录成长点滴
        </p>
      </div>

      {/* Posts */}
      {data?.items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">暂无文章</h3>
          <p className="text-gray-500 dark:text-gray-400">稍后再来看看吧</p>
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
