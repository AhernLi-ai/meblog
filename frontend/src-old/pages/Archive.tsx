import { useState, useEffect } from 'react';
import { postsApi } from '../api/posts';
import type { PostListItem } from '../types';
import { Link } from 'react-router-dom';

interface GroupedPosts {
  [key: string]: PostListItem[]; // key: "2026年4月" 格式
}

export default function Archive() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi.getAll({ size: 100 })
      .then((res) => setPosts(res.items.filter(p => p.status === 'published')))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

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
      <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-8">归档</h1>

      {loading ? (
        <div className="py-8 text-center text-[var(--color-foreground-secondary)]">
          加载中...
        </div>
      ) : sortedKeys.length === 0 ? (
        <div className="py-8 text-center text-[var(--color-foreground-secondary)]">
          暂无文章
        </div>
      ) : (
        <div className="space-y-8">
          {sortedKeys.map((key) => (
            <div key={key}>
              <h2 className="text-lg font-semibold text-[var(--color-primary)] mb-4 flex items-center gap-2">
                <span>{key}</span>
                <span className="text-sm font-normal text-[var(--color-foreground-secondary)]">
                  ({groupedPosts[key].length} 篇)
                </span>
              </h2>
              <div className="space-y-2">
                {groupedPosts[key].map((post) => (
                  <Link
                    key={post.id}
                    to={`/posts/${post.slug}`}
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
