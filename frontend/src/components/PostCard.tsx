import { Link } from 'react-router-dom';
import type { PostListItem } from '../types';

interface PostCardProps {
  post: PostListItem;
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <Link to={`/post/${post.slug}`}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2">
          {post.title}
        </h2>
      </Link>

      {post.summary && (
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {post.summary}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{formatDate(post.created_at)}</span>
        <Link
          to={`/category/${post.category.slug}`}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {post.category.name}
        </Link>
        <span>{post.view_count} 阅读</span>
      </div>

      {post.tags.length > 0 && (
        <div className="flex gap-2 mt-3">
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/tag/${tag.slug}`}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
