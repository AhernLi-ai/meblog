import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { postsApi } from '../api/posts';
import MarkdownRenderer from '../components/MarkdownRenderer';
import TableOfContents from '../components/TableOfContents';
import WechatQR from '../components/WechatQR';
import LikeButton from '../components/LikeButton';
import { ListBulletIcon } from '@heroicons/react/24/outline';

const SITE_URL = (import.meta as any).env?.VITE_SITE_URL || 'http://localhost:6000';

function setMetaTag(property: string, content: string, isName = false) {
  const attr = isName ? 'name' : 'property';
  let el = document.querySelector(`meta[${attr}="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    (el as HTMLMetaElement).setAttribute(attr, property);
    document.head.appendChild(el);
  }
  (el as HTMLMetaElement).content = content;
}

function clearMetaTags() {
  ['og:title', 'og:description', 'og:image', 'og:url',
   'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image',
   'description'].forEach(p => {
    const el = document.querySelector(`meta[property="${p}"]`) ||
              document.querySelector(`meta[name="${p}"]`);
    if (el) el.remove();
  });
}

// Extract headings from markdown content (ignoring # in code blocks)
function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  // 1. Remove code blocks first to avoid matching # comments inside code
  const withoutCodeBlocks = content
    .replace(/```[\s\S]*?```/g, '') // Remove ```...``` blocks
    .replace(/`[^`\n]*`/g, '');     // Remove inline code like `...`
  
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(withoutCodeBlocks)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Generate slug matching the MarkdownRenderer's slugify (keep Chinese chars)
    const id = text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5-]/g, '') // Keep Chinese characters
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    headings.push({ id, text, level });
  }

  return headings;
}

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [showToc, setShowToc] = useState(false);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getById(slug!),
    enabled: !!slug,
  });

  const { data: likeStatus } = useQuery({
    queryKey: ['postLike', slug],
    queryFn: () => postsApi.getLikeStatus(slug!),
    enabled: !!slug,
  });

  // Extract headings and set SEO meta tags when post changes
  useEffect(() => {
    if (post?.content) {
      const extracted = extractHeadings(post.content);
      setHeadings(extracted);
    }
    if (post) {
      const title = post.title;
      const description = post.summary || post.content.replace(/[#*`_~\[\]]/g, '').slice(0, 200);
      const postUrl = `${SITE_URL}/post/${post.slug}`;
      // og:image: use project cover if available, otherwise a default
      const ogImage = post.project?.cover || `${SITE_URL}/og-default.png`;

      document.title = title;
      setMetaTag('og:title', title);
      setMetaTag('og:description', description);
      setMetaTag('og:image', ogImage);
      setMetaTag('og:url', postUrl);
      setMetaTag('description', description);
      setMetaTag('twitter:card', 'summary_large_image');
      setMetaTag('twitter:title', title);
      setMetaTag('twitter:description', description);
      setMetaTag('twitter:image', ogImage);
    }
    return () => clearMetaTags();
  }, [post]);

  const handleCloseToc = useCallback(() => {
    setShowToc(false);
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12 text-[var(--color-foreground-secondary)]">加载中...</div>
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

  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div>
      {/* TOC Toggle Button */}
      {headings.length > 0 && (
        <button
          onClick={() => setShowToc(!showToc)}
          className="fixed right-4 top-24 z-50 p-3 bg-[var(--color-background)] shadow-[var(--shadow-card-hover)] rounded-[8px] border border-[var(--color-border)] hover:bg-[var(--color-background-secondary)] transition-colors"
          title="文章目录"
        >
          <ListBulletIcon className="w-5 h-5 text-[var(--color-foreground-secondary)]" />
        </button>
      )}

      {/* TOC Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-72 bg-[var(--color-background)] shadow-xl z-40 transform transition-transform duration-300 ${
          showToc ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--color-foreground)]">文章目录</h3>
            <button
              onClick={() => setShowToc(false)}
              className="text-[var(--color-foreground-secondary)] hover:text-[var(--color-foreground)] text-lg"
            >
              ✕
            </button>
          </div>
          <TableOfContents headings={headings} onClose={handleCloseToc} />
        </div>
      </div>

      {/* Overlay */}
      {showToc && (
        <div
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setShowToc(false)}
        />
      )}

      {/* Main Content */}
      <article className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-block mb-6 text-[var(--color-primary)] hover:underline"
        >
          ← 返回首页
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-foreground)] mb-4" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-foreground-secondary)]">
            <span>{formatDate(post.created_at)}</span>
            <Link
              to={`/category/${post.project?.slug}`}
              className="text-[var(--color-primary)] hover:underline"
            >
              {post.project?.name || '无项目'}
            </Link>
            <span>{post.view_count} 阅读</span>
            <span>{readingTime} 分钟阅读</span>
          </div>

          {post.tags.length > 0 && (
            <div className="flex gap-2 mt-4">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/tag/${tag.slug}`}
                  className="text-sm px-2 py-1 bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)] rounded-[6px] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        <div className="bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] p-6 md:p-8 border border-[var(--color-border)]">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Like Button at end of article */}
        {slug && (
          <div className="mt-8 flex justify-center">
            <LikeButton
              slug={slug}
              initialLiked={likeStatus?.liked}
              initialCount={likeStatus?.like_count ?? post?.like_count ?? 0}
            />
          </div>
        )}

        {/* Wechat QR at end of article */}
        <WechatQR variant="article-end" />

        <div className="mt-8 text-sm text-[var(--color-foreground-secondary)]">
          作者：{post.author.username}
        </div>
      </article>
    </div>
  );
}
