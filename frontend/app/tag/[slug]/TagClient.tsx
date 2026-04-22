import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import type { PostListResponse } from '@/types';

interface TagClientProps {
  initialTagSlug: string;
  initialData: PostListResponse;
  initialPage: number;
}

export default function TagClient({ initialTagSlug, initialData, initialPage }: TagClientProps) {
  const slug = initialTagSlug;
  const page = initialPage;
  const postsData = initialData;

  // Convert slug to a more readable format, e.g. 'python' -> 'Python'
  const tagName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          🏷️ {tagName}
        </h1>
        <p className="text-[var(--color-foreground-secondary)]">
          共 {postsData?.total || 0} 篇文章
        </p>
      </div>

      {postsData?.items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">暂无文章</h3>
          <p className="text-[var(--color-foreground-secondary)]">该标签下还没有文章</p>
        </div>
      ) : (
        <div className="space-y-6">
          {postsData?.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {postsData && postsData.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={postsData.pages}
          getPageHref={(nextPage) => `/tag/${slug}?page=${nextPage}`}
        />
      )}
    </div>
  );
}
