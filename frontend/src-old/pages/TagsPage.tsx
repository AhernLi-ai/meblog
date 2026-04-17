import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { tagsApi } from '../api/tags';

export default function TagsPage() {
  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-[var(--color-foreground-secondary)]">加载中...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-8" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
        所有标签
      </h1>

      {tags?.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-foreground-secondary)]">
          暂无标签
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags?.map((tag) => (
            <Link
              key={tag.id}
              to={`/tag/${tag.slug}`}
              className="bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all p-6 border border-[var(--color-border)]"
            >
              <h2 className="text-xl font-semibold text-[var(--color-foreground)] mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                {tag.name}
              </h2>
              <p className="text-[var(--color-foreground-secondary)]">
                {tag.post_count || 0} 篇文章
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
