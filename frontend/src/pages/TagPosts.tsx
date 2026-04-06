import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../api/posts';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { useState } from 'react';

export default function TagPosts() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', { tag: slug, page }],
    queryFn: () => postsApi.getAll({ tag: slug, page, size: 10 }),
    enabled: !!slug,
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
      {/* Tag Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          标签：{data?.items[0]?.tags?.find(t => t.slug === slug)?.name || slug}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          共 {data?.total || 0} 篇文章
        </p>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {data?.items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {data?.items.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            该标签下暂无文章
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
