import { useState, useEffect } from 'react';
import { commentsApi, Comment as ApiComment } from '../api/comments';
import sanitizeHtml from 'sanitize-html';

// ============================================================
// Types
// ============================================================

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
  postId: number;
  postSlug: string;
  visible?: boolean;
}

interface CommentFormData {
  nickname: string;
  email: string;
  website?: string;
  content: string;
}

// ============================================================
// API → Component adapter
// ============================================================

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

// ============================================================
// 递归计算总评论数（含所有嵌套）
// ============================================================

function countAllComments(comments: Comment[]): number {
  let total = 0;
  for (const c of comments) {
    total += 1; // 顶级
    if (c.replies && c.replies.length > 0) {
      total += countAllComments(c.replies);
    }
  }
  return total;
}

// ============================================================
// 时间格式化
// ============================================================

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ============================================================
// 评论表单
// ============================================================

interface CommentFormProps {
  onSubmit: (data: CommentFormData) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
  submitLabel?: string;
  showCancel?: boolean;
  onCancel?: () => void;
  isReply?: boolean;
}

export function CommentForm({
  onSubmit,
  loading = false,
  placeholder = '写下你的留言...',
  submitLabel: _submitLabel = '发表留言',
  showCancel = false,
  onCancel,
  isReply = false,
}: CommentFormProps) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [content, setContent] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<Partial<CommentFormData>>({});

  useEffect(() => {
    if (rememberMe) {
      const savedNickname = localStorage.getItem('comment_nickname');
      const savedEmail = localStorage.getItem('comment_email');
      const savedWebsite = localStorage.getItem('comment_website');
      if (savedNickname) setNickname(savedNickname);
      if (savedEmail) setEmail(savedEmail);
      if (savedWebsite) setWebsite(savedWebsite);
    }
  }, [rememberMe]);

  const validate = (): boolean => {
    const newErrors: Partial<CommentFormData> = {};
    if (!nickname.trim()) newErrors.nickname = '必填';
    if (!email.trim()) {
      newErrors.email = '必填';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '邮箱格式不正确';
    }
    if (!content.trim()) newErrors.content = '请填写留言内容';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ nickname: nickname.trim(), email: email.trim(), website: website.trim(), content: content.trim() });
    setContent('');
    if (rememberMe) {
      localStorage.setItem('comment_nickname', nickname.trim());
      localStorage.setItem('comment_email', email.trim());
      localStorage.setItem('comment_website', website.trim());
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 rounded-[var(--radius-btn)] bg-[var(--color-background-secondary)] text-[var(--color-foreground)] placeholder-[var(--color-foreground-secondary)] border ${
      hasError
        ? 'border-red-500 dark:border-red-400'
        : 'border-[var(--color-border)] focus:border-[var(--color-primary)]'
    } outline-none transition-colors text-sm`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-6">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`${inputClass(!!errors.content)} resize-none`}
          aria-label="评论内容"
        />
        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="您的大名（必填）"
              className={inputClass(!!errors.nickname)}
              aria-label="昵称"
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱（必填，不公开）"
              className={inputClass(!!errors.email)}
              aria-label="邮箱"
            />
          </div>
        </div>
        <div className="w-full sm:w-1/2">
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="个人网址（我信任你，不会填写广告链接）"
            className={inputClass(!!errors.website)}
            aria-label="个人网址"
          />
        </div>
        <div className={isReply ? 'flex items-center justify-end gap-2' : 'flex flex-col gap-2'}>
          {!isReply && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[var(--color-primary)]"
              />
              <label htmlFor="remember-me" className="text-sm text-[var(--color-foreground-secondary)] cursor-pointer select-none">
                记住个人信息
              </label>
            </div>
          )}
          <div className={isReply ? 'flex gap-2' : 'flex gap-2 w-full sm:w-1/2'}>
            {showCancel && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm rounded-[var(--radius-btn)] border border-[var(--color-border)] text-[var(--color-foreground-secondary)] hover:bg-[var(--color-background-secondary)] transition-colors"
              >
                取消
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-base rounded-[var(--radius-btn)] bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-1/2"
            >
              {loading ? '提交中...' : '发表'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

// ============================================================
// 单条评论内容（不含子评论容器）
// ============================================================

interface CommentBodyProps {
  comment: Comment;
  parentNickname?: string;
  replyToId?: string;
  onReply?: (data: CommentFormData, parentId: string) => Promise<void>;
}

function CommentBody({ comment, parentNickname, onReply }: CommentBodyProps) {
  return (
    <div className="flex gap-3">
      {/* 头像 */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary-light)] dark:bg-[var(--color-primary)]/20 flex items-center justify-center">
        <svg className="w-4 h-4 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        {/* 头部：昵称 + 回复信息 + 时间 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[var(--color-foreground)]">
            {comment.nickname}
          </span>
          {parentNickname && (
            <>
              <span className="text-[var(--color-foreground-secondary)] text-xs">回复</span>
              <span className="text-xs text-[var(--color-primary)]">@{parentNickname}</span>
              <span className="text-[var(--color-foreground-secondary)] text-xs">·</span>
            </>
          )}
          {!parentNickname && (
            <span className="text-[var(--color-foreground-secondary)] text-xs">·</span>
          )}
          <span className="text-xs text-[var(--color-foreground-secondary)]">
            {formatTime(comment.createdAt)}
          </span>
        </div>
        {/* 评论内容 */}
        <p className="mt-1 text-sm text-[var(--color-foreground)] leading-relaxed whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: sanitizeHtml(comment.content, { allowedTags: [], allowedAttributes: {} }) }} />
        {/* 回复按钮 - 点击滚动到评论框 */}
        {onReply && (
          <button
            onClick={() => {
              document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="mt-1.5 text-xs text-[var(--color-foreground-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            回复
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 评论列表：顶级评论 + 嵌套竖线容器
// ============================================================

interface CommentListProps {
  comments: Comment[];
  onReply?: (data: CommentFormData, parentId: string) => Promise<void>;
}

function CommentList({ comments, onReply }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-[var(--color-foreground-secondary)] text-sm">
        暂无留言，来抢沙发吧~
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {comments.map((comment, index) => {
        const hasReplies = comment.replies && comment.replies.length > 0;
        return (
          <div key={comment.id}>
            {/* 顶级评论本身 */}
            <div className={index > 0 ? 'pt-4 border-t border-[var(--color-border)]' : 'pb-3'}>
              <CommentBody
                comment={comment}
                onReply={onReply}
              />
            </div>

            {/* 嵌套回复区：所有层级的回复都扁平地挂在一条竖线下 */}
            {hasReplies && (
              <NestedReplies
                replies={comment.replies!}
                onReply={onReply}
                ancestorNicknames={new Map([[comment.id, comment.nickname]])}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// 嵌套回复区：共享一条竖线，扁平渲染所有层级（不限深度）
// ============================================================

interface NestedRepliesProps {
  replies: Comment[];
  onReply?: (data: CommentFormData, parentId: string) => Promise<void>;
  /** 祖先昵称映射：评论id → 昵称（包含当前层级以上的所有评论） */
  ancestorNicknames: Map<string, string>;
}

function NestedReplies({ replies, onReply, ancestorNicknames }: NestedRepliesProps) {
  // 扁平化：将所有层级的回复收集到一个数组中，统一渲染
  const allReplies = flattenDeep(replies);
  
  if (allReplies.length === 0) return null;

  // 构建昵称映射：先用祖先昵称初始化，再加入所有后代的昵称
  const nicknameMap = new Map(ancestorNicknames);
  const childNicknameMap = buildNicknameMap(allReplies);
  childNicknameMap.forEach((v, k) => nicknameMap.set(k, v));

  return (
    <div className="ml-6 sm:ml-8 mt-2 border-l-2 border-[var(--color-border)] pl-4 space-y-3">
      {allReplies.map((reply) => (
        <div key={reply.id}>
          <CommentBody
            comment={reply}
            parentNickname={reply.parentId ? (nicknameMap.get(reply.parentId) ?? undefined) : undefined}
            replyToId={reply.parentId ? String(reply.parentId) : undefined}
            onReply={onReply}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 工具函数：深度优先收集所有回复到扁平数组
// ============================================================

function flattenDeep(replies: Comment[]): Comment[] {
  const result: Comment[] = [];
  for (const reply of replies) {
    result.push(reply); // 先加入当前节点
    if (reply.replies && reply.replies.length > 0) {
      result.push(...flattenDeep(reply.replies)); // 递归加入子节点
    }
  }
  return result;
}

// ============================================================
// 工具函数：构建昵称映射表
// ============================================================

function buildNicknameMap(comments: Comment[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of comments) {
    map.set(c.id, c.nickname);
    if (c.replies) {
      const childMap = buildNicknameMap(c.replies);
      childMap.forEach((v, k) => map.set(k, v));
    }
  }
  return map;
}

// ============================================================
// 主评论组件
// ============================================================

export default function Comments({
  postId,
  postSlug,
  visible = true,
}: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!postSlug) return;
    setLoading(true);
    commentsApi.getBySlug(postSlug)
      .then((res) => {
        setComments(res.items.map(fromApiComment));
      })
      .catch(() => {
        // Silently fail - show empty comments
      })
      .finally(() => setLoading(false));
  }, [postSlug]);

  const handleSubmit = async (data: CommentFormData) => {
    setSubmitLoading(true);
    try {
      await commentsApi.create({
        post_id: postId,
        nickname: data.nickname,
        email: data.email,
        website: data.website || undefined,
        content: data.content,
        parent_id: null,
      });
      const res = await commentsApi.getBySlug(postSlug);
      setComments(res.items.map(fromApiComment));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReply = async (data: CommentFormData, parentId: string) => {
    setSubmitLoading(true);
    try {
      await commentsApi.create({
        post_id: postId,
        parent_id: Number(parentId),
        nickname: data.nickname,
        email: data.email,
        website: data.website || undefined,
        content: data.content,
      });
      const res = await commentsApi.getBySlug(postSlug);
      setComments(res.items.map(fromApiComment));
    } finally {
      setSubmitLoading(false);
    }
  };

  // 统计所有评论数（含嵌套）
  const totalCommentCount = countAllComments(comments);

  if (!visible) return null;

  return (
    <section id="comment-form" className="mt-12">
      {/* 标题 */}
      <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        留言
        {totalCommentCount > 0 && (
          <span className="text-sm font-normal text-[var(--color-foreground-secondary)]">
            ({totalCommentCount})
          </span>
        )}
      </h2>

      {/* 分割线 */}
      <div className="mb-6 h-px bg-[var(--color-border)]" />

      {/* 评论列表 */}
      {loading ? (
        <div className="py-8 text-center text-[var(--color-foreground-secondary)] text-sm">
          加载评论中...
        </div>
      ) : (
        <CommentList comments={comments} onReply={handleReply} />
      )}

      {/* 评论表单 - 在评论区下方 */}
      <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
        <CommentForm onSubmit={handleSubmit} loading={submitLoading} />
      </div>
    </section>
  );
}
