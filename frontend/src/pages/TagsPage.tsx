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
      <div className="text-center py-12 text-gray-500">加载中...</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        所有标签
      </h1>

      {tags?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无标签
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags?.map((tag) => (
            <Link
              key={tag.id}
              to={`/tag/${tag.slug}`}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {tag.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {tag.post_count || 0} 篇文章
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
