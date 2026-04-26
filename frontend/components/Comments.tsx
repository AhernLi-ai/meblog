'use client';

import { useEffect, useMemo, useState } from 'react';
import sanitizeHtml from 'sanitize-html';
import { commentsApi, Comment as ApiComment } from '../api/comments';

export interface Comment {
  id: string;
  nickname: string;
  email: string;
  website?: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  replies?: Comment[];
}

interface CommentsProps {
  postId: string;
  postSlug: string;
  visible?: boolean;
}

interface CommentFormData {
  nickname: string;
  email: string;
  website?: string;
  content: string;
}

function fromApiComment(c: ApiComment): Comment {
  return {
    id: String(c.id),
    nickname: c.nickname,
    email: c.email ?? '',
    website: c.website ?? undefined,
    content: c.content,
    createdAt: c.created_at,
    parentId: c.parent_id != null ? String(c.parent_id) : null,
    replies: c.replies?.map(fromApiComment),
  };
}

function countAllComments(comments: Comment[]): number {
  let total = 0;
  for (const c of comments) {
    total += 1;
    if (c.replies && c.replies.length > 0) {
      total += countAllComments(c.replies);
    }
  }
  return total;
}

function formatDiscussionTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 1000 / 60));
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 60) return `${diffMin} MINUTES AGO`;
  if (diffHour < 24) return `${diffHour} HOURS AGO`;
  if (diffDay < 7) return `${diffDay} DAYS AGO`;

  return date
    .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    .toUpperCase();
}

function getAvatarText(nickname: string): string {
  const trimmed = nickname.trim();
  if (!trimmed) return 'U';
  const first = trimmed[0];
  return /[\u4e00-\u9fa5]/.test(first) ? first : first.toUpperCase();
}

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<void>;
  loading?: boolean;
}

function CommentForm({ onSubmit, loading = false }: CommentFormProps) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [content, setContent] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Partial<CommentFormData>>({});

  useEffect(() => {
    const savedNickname = localStorage.getItem('comment_nickname');
    const savedEmail = localStorage.getItem('comment_email');
    const savedWebsite = localStorage.getItem('comment_website');
    if (savedNickname) setNickname(savedNickname);
    if (savedEmail) setEmail(savedEmail);
    if (savedWebsite) setWebsite(savedWebsite);
  }, []);

  const inputClass =
    'w-full px-4 py-3 bg-[var(--color-background-secondary)] border border-[var(--color-border)] text-[var(--color-foreground)] rounded-none outline-none focus:border-[var(--color-primary)] transition-colors';

  const validate = (): boolean => {
    const nextErrors: Partial<CommentFormData> = {};
    if (!nickname.trim()) nextErrors.nickname = 'Name is required';
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Invalid email format';
    }
    if (!content.trim()) nextErrors.content = 'Comment is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      nickname: nickname.trim(),
      email: email.trim(),
      website: website.trim(),
      content: content.trim(),
    });

    setContent('');
    if (rememberMe) {
      localStorage.setItem('comment_nickname', nickname.trim());
      localStorage.setItem('comment_email', email.trim());
      localStorage.setItem('comment_website', website.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3
        className="text-4xl font-bold text-[var(--color-foreground)]"
        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
      >
        Leave a Reply
      </h3>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Your Comment"
          rows={6}
          className={`${inputClass} resize-none`}
          aria-label="Your comment"
        />
        {errors.content && <p className="mt-2 text-xs text-red-500">{errors.content}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Name *"
            className={inputClass}
            aria-label="Name"
          />
          {errors.nickname && <p className="mt-2 text-xs text-red-500">{errors.nickname}</p>}
        </div>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email *"
            className={inputClass}
            aria-label="Email"
          />
          {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email}</p>}
        </div>
      </div>

      <div>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="Website"
          className={inputClass}
          aria-label="Website"
        />
      </div>

      <label className="flex items-center gap-3 text-sm text-[var(--color-foreground-secondary)]">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 accent-[var(--color-primary)]"
        />
        Save my name, email, and website in this browser for the next time I comment.
      </label>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center px-8 py-3 bg-[#0B1636] text-white text-sm font-semibold tracking-[0.16em] uppercase border border-[#0B1636] hover:bg-[#10204A] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Submitting...' : 'Post Comment'}
      </button>
    </form>
  );
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  onReply?: (data: CommentFormData, parentId: string) => Promise<void>;
}

function CommentItem({ comment, depth = 0, onReply }: CommentItemProps) {
  const safeContent = sanitizeHtml(comment.content, { allowedTags: [], allowedAttributes: {} });
  const avatar = getAvatarText(comment.nickname);

  return (
    <div className={depth > 0 ? 'ml-8 mt-5 pl-5 border-l border-[var(--color-border)]' : ''}>
      <div className="flex gap-4">
        <div className="w-12 h-12 shrink-0 rounded-md bg-[#0B1636] text-white flex items-center justify-center font-semibold">
          {avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <h4 className="text-xl font-semibold text-[var(--color-foreground)] leading-tight">
              {comment.nickname}
            </h4>
            <span className="text-xs font-semibold tracking-[0.14em] text-[var(--color-foreground-secondary)] uppercase whitespace-nowrap mt-1">
              {formatDiscussionTime(comment.createdAt)}
            </span>
          </div>
          <p
            className="mt-2 text-[15px] text-[var(--color-foreground-secondary)] leading-8 whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />
          {onReply && (
            <button
              onClick={() => document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="mt-3 text-sm font-semibold tracking-[0.1em] text-[#0B1636] uppercase hover:opacity-80 transition-opacity"
            >
              Reply
            </button>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Comments({ postId, postSlug, visible = true }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!postSlug) return;
    setLoading(true);
    commentsApi
      .getBySlug(postSlug)
      .then((res) => setComments(res.items.map(fromApiComment)))
      .catch(() => {
        // Graceful degradation: keep empty list when request fails.
      })
      .finally(() => setLoading(false));
  }, [postSlug]);

  const totalCommentCount = useMemo(() => countAllComments(comments), [comments]);

  const refreshComments = async () => {
    const res = await commentsApi.getBySlug(postSlug);
    setComments(res.items.map(fromApiComment));
  };

  const handleSubmit = async (data: CommentFormData) => {
    setSubmitLoading(true);
    try {
      await commentsApi.create({
        post_id: postId,
        parent_id: null,
        nickname: data.nickname,
        email: data.email,
        website: data.website || undefined,
        content: data.content,
      });
      await refreshComments();
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReply = async (data: CommentFormData, parentId: string) => {
    setSubmitLoading(true);
    try {
      await commentsApi.create({
        post_id: postId,
        parent_id: parentId,
        nickname: data.nickname,
        email: data.email,
        website: data.website || undefined,
        content: data.content,
      });
      await refreshComments();
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <section id="comment-form" className="mt-14">
      <div className="mb-8">
        <h2
          className="text-4xl font-bold text-[var(--color-foreground)]"
          style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        >
          Discussion ({totalCommentCount})
        </h2>
      </div>

      {loading ? (
        <div className="py-8 text-sm text-[var(--color-foreground-secondary)]">Loading discussion...</div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-sm text-[var(--color-foreground-secondary)]">
          No comments yet. Be the first to share your thoughts.
        </div>
      ) : (
        <div className="space-y-7 border-t border-[var(--color-border)] pt-7">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onReply={handleReply} />
          ))}
        </div>
      )}

      <div className="mt-12 border border-[var(--color-border)] bg-[var(--color-background)] p-8 md:p-10">
        <CommentForm onSubmit={handleSubmit} loading={submitLoading} />
      </div>
    </section>
  );
}
