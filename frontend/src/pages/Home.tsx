import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../api/posts';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';

export default function Home() {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', { page }],
    queryFn: () => postsApi.getAll({ page, size: 10 }),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">加载中...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        加载失败，请稍后重试
      </div>
    );
  }

  return (
    <div>
      {/* Blog Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Meblog
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          分享技术与生活
        </p>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {data?.items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {data?.items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            暂无文章
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && (
        <Pagination
          currentPage={page}
          totalPages={data.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
