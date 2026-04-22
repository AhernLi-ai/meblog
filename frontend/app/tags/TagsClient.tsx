'use client';

import Link from 'next/link';
import type { Tag } from '@/types';

interface TagWithCount extends Tag {
  post_count?: number;
}

interface TagsClientProps {
  initialTags: TagWithCount[];
}

export default function TagsClient({ initialTags }: TagsClientProps) {
  const tags = initialTags || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          所有标签
        </h1>
        <p className="text-[var(--color-foreground-secondary)]">
          共 {tags?.length || 0} 个标签
        </p>
      </div>

      {!tags || tags.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">暂无标签</h3>
          <p className="text-[var(--color-foreground-secondary)]">稍后再来看看吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all p-6 border border-[var(--color-border)] group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                    {tag.name}
                  </h2>
                  <p className="text-sm text-[var(--color-foreground-secondary)]">
                    {tag.post_count || 0} 篇文章
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
