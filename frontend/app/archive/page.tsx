import { postsApi } from '@/api/posts';
import type { PostListItem } from '@/types';
import Link from 'next/link';

export const dynamic = 'force-static';
export const revalidate = 86400;

interface GroupedPosts {
  [key: string]: PostListItem[];
}

export default async function Archive() {
  let posts: PostListItem[] = [];
  try {
    const response = await postsApi.getAll({ size: 100 });
    posts = response?.items ?? [];
  } catch {
    // 构建时后端不可用
  }

  // 按月份分组
  const groupedPosts: GroupedPosts = {};
  for (const post of posts) {
    const date = new Date(post.created_at);
    const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    if (!groupedPosts[key]) groupedPosts[key] = [];
    groupedPosts[key].push(post);
  }

  // 按月份降序排序
  const sortedKeys = Object.keys(groupedPosts).sort((a, b) => {
    const [yearA, monthA] = a.match(/(\d+)年(\d+)月/)!.slice(1).map(Number);
    const [yearB, monthB] = b.match(/(\d+)年(\d+)月/)!.slice(1).map(Number);
    return yearB - yearA || monthB - monthA;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          归档
        </h1>
        <p className="text-[var(--color-foreground-secondary)]">
          共 {posts.length} 篇文章
        </p>
      </div>

      {sortedKeys.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">暂无文章</h3>
          <p className="text-[var(--color-foreground-secondary)]">稍后再来看看吧</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedKeys.map((key) => (
            <div key={key}>
              <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4 flex items-center gap-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                <span>{key}</span>
                <span className="text-sm font-normal text-[var(--color-foreground-secondary)]">
                  ({groupedPosts[key].length} 篇)
                </span>
              </h2>
              <div className="space-y-2">
                {groupedPosts[key].map((post) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.slug}`}
                    className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[var(--color-background-secondary)] transition-colors group"
                  >
                    <span className="text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                      {post.title}
                    </span>
                    <span className="text-xs text-[var(--color-foreground-secondary)]">
                      {new Date(post.created_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
