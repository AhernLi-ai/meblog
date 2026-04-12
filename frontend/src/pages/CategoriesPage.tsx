import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/projects';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: projectsApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-[var(--color-foreground-secondary)]">加载中...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-8" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
        所有项目
      </h1>

      {categories?.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-foreground-secondary)]">
          暂无项目
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 overflow-hidden border border-[var(--color-border)]"
            >
              {/* Cover Image */}
              <div className="aspect-video bg-[var(--color-background-secondary)] overflow-hidden">
                {cat.cover ? (
                  <img
                    src={cat.cover}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-foreground-secondary)] text-4xl">
                    📁
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-1" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  {cat.name}
                </h2>
                <p className="text-sm text-[var(--color-foreground-secondary)]">
                  {cat.post_count || 0} 篇文章
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
