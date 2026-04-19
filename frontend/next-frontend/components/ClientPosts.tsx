'use client';

import { useEffect, useState } from 'react';
import { postsApi } from '@/api/posts';
import type { PostListResponse, PostListItem } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';

interface ClientPostsProps {
  initialData?: PostListResponse | null;
  currentPage: number;
}

export default function ClientPosts({ initialData, currentPage }: ClientPostsProps) {
  const [data, setData] = useState<PostListResponse | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (initialData) return; // 如果已经有初始数据，不需要重新获取
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await postsApi.getAll({ page: currentPage, size: 5 });
        setData(result);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError('加载文章列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, initialData]);

  if (loading && !data) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!data) {
    return <div className="text-center py-8">暂无文章</div>;
  }

  return (
    <div className="space-y-8">
      {/* 文章列表 */}
      <div className="space-y-6">
        {data.items.map((post: PostListItem) => (
          <article key={post.id} className="group">
            <Link href={`/post/${post.slug}`} className="block">
              <div className="bg-white dark:bg-[var(--color-background-secondary)] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                    {post.title}
                  </h2>
                  <time className="text-sm text-[var(--color-foreground-secondary)]">
                    {format(new Date(post.created_at), 'yyyy-MM-dd')}
                  </time>
                </div>
                <p className="text-[var(--color-foreground-secondary)] line-clamp-2">
                  {post.summary || ''}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {post.tags.map((tag) => (
                      <span 
                        key={tag.id} 
                        className="px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* 分页 */}
      {data.total > 5 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(data.total / 5) }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/?page=${page}`}
              className={`px-3 py-1 rounded ${
                page === currentPage
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-gray-100 dark:bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)] hover:bg-gray-200 dark:hover:bg-[var(--color-background)]'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}