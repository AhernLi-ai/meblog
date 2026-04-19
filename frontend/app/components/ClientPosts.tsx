// ClientPosts.tsx - 客户端数据获取组件
'use client';

import { useEffect, useState } from 'react';
import { postsApi } from '@/api/posts';
import type { PostListResponse } from '@/types';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface ClientPostsProps {
  initialData?: PostListResponse;
  currentPage?: number;
}

export default function ClientPosts({ initialData, currentPage = 1 }: ClientPostsProps) {
  const [data, setData] = useState<PostListResponse | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        const result = await postsApi.getAll({ page: currentPage, size: 5 });
        setData(result);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    // 如果没有初始数据，或者需要刷新数据
    if (!initialData || currentPage !== (initialData?.page || 1)) {
      fetchData();
    }
  }, [currentPage, initialData]);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⏳</div>
        <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">正在加载文章...</h3>
        <p className="text-[var(--color-foreground-secondary)]">请稍候，我们正在获取最新内容</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">加载失败</h3>
        <p className="text-[var(--color-foreground-secondary)]">请刷新页面重试</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-80 transition-opacity"
        >
          刷新页面
        </button>
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">暂无文章</h3>
        <p className="text-[var(--color-foreground-secondary)]">稍后再来看看吧</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {data.items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      {data.pages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.pages}
          onPageChange={(newPage) => {
            // 这里可以添加分页逻辑
            window.location.search = `?page=${newPage}`;
          }}
        />
      )}
    </>
  );
}