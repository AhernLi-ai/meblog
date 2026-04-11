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
      <div className="text-center py-12 text-gray-500">加载中...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        所有项目
      </h1>

      {categories?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无项目
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              {/* Cover Image */}
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 overflow-hidden">
                {cat.cover ? (
                  <img
                    src={cat.cover}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    📁
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {cat.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
