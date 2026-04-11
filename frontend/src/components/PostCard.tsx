import { Link } from 'react-router-dom';
import { EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { PostListItem } from '../types';

interface PostCardProps {
  post: PostListItem;
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <article className="group bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800">
      <div className="p-6">
        {/* Title */}
        <Link to={`/post/${post.slug}`}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3 line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Summary */}
        {post.summary && (
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
            {post.summary}
          </p>
        )}

        {/* Tags (单独一行) */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tag/${tag.slug}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Meta row: 时间 | 分类 | 阅读数 | 阅读全文 */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
          {/* Left: 时间 | 分类 | 阅读数 */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {formatDate(post.created_at)}
            </span>
            <Link
              to={`/category/${post.project?.slug}`}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
            >
              {post.project?.name}
            </Link>
            <span className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              {post.view_count}
            </span>
          </div>
          
          {/* Right: 阅读全文 */}
          <Link
            to={`/post/${post.slug}`}
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:gap-2 transition-all"
          >
            阅读全文
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
