import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../api/posts';
import { projectsApi } from '../api/projects';
import PostCard from '../components/PostCard';
import Pagination from '../components/Pagination';
import { useState } from 'react';

export default function CategoryPosts() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  // 获取所有分类，从列表中找到当前 slug 对应的分类
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: projectsApi.getAll,
  });
  const category = categories?.find(c => c.slug === slug);

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', { category: slug, page }],
    queryFn: () => postsApi.getAll({ category: slug, page, size: 5 }),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-[var(--color-foreground-secondary)]">加载中...</div>
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
      {/* Project Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          项目：{category?.name || slug}
        </h1>
        <p className="text-[var(--color-foreground-secondary)] mt-1">
          该项目下共 {data?.total || 0} 篇文章
        </p>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {data?.items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {data?.items.length === 0 && (
          <div className="text-center py-12 text-[var(--color-foreground-secondary)]">
            该分类下暂无文章
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
