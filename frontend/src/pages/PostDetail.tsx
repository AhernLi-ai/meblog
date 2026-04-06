import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postsApi } from '../api/posts';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getById(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">加载中...</div>
    );
  }

  if (error || !post) {
    return (
      <div className="text-center py-12 text-red-500">
        文章不存在或加载失败
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article>
      {/* Back Link */}
      <Link
        to="/"
        className="inline-block mb-6 text-blue-600 dark:text-blue-400 hover:underline"
      >
        ← 返回首页
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{formatDate(post.created_at)}</span>
          <Link
            to={`/category/${post.category.slug}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {post.category.name}
          </Link>
          <span>{post.view_count} 阅读</span>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex gap-2 mt-4">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tag/${tag.slug}`}
                className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 md:p-8">
        <MarkdownRenderer content={post.content} />
      </div>

      {/* Author */}
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        作者：{post.author.username}
      </div>
    </article>
  );
}
