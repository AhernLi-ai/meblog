'use client';

import { useEffect, useState } from 'react';
import { postsApi } from '../api/posts';
import type { PostDetail } from '../types';
import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface ClientPostDetailProps {
  initialData?: PostDetail | null;
  slug: string;
}

export default function ClientPostDetail({ initialData, slug }: ClientPostDetailProps) {
  const [data, setData] = useState<PostDetail | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        const result = await postsApi.getById(slug);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (!initialData) {
      fetchData();
    }
  }, [slug, initialData]);

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

  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">文章不存在</h3>
        <p className="text-[var(--color-foreground-secondary)]">抱歉，找不到您要的文章</p>
        <Link
          href="/"
          className="mt-4 inline-block px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-80 transition-opacity"
        >
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:opacity-80 mb-6">
        ← 返回首页
      </Link>
      
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-4">
          {data.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-foreground-secondary)]">
          <span>作者: {data.author?.username || 'admin'}</span>
          <span>{new Date(data.created_at).toLocaleDateString('zh-CN')}</span>
          
          {data.project && (
            <Link 
              href={`/project/${data.project.slug}`}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-background-secondary)] rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <SparklesIcon className="w-3 h-3" />
              {data.project.name}
            </Link>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {data.tags?.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)] rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <SparklesIcon className="w-3 h-3" />
              {tag.name}
            </Link>
          ))}
        </div>
      </header>
      
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
      
      <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-80 transition-opacity">
          <span>👍</span>
          <span>点赞 ({data.like_count || 0})</span>
        </button>
      </div>
    </article>
  );
}