'use client';

import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import api from '@/api/client';
import clsx from 'clsx';

interface LikeStatus {
  liked: boolean;
  like_count: number;
}

interface LikeButtonProps {
  slug: string;
  initialLiked?: boolean;
  initialCount?: number;
}

export default function LikeButton({ slug, initialLiked = false, initialCount = 0 }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // Initialize status when switching to another post.
  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
    setLoading(false);

    let cancelled = false;
    const loadLikeStatus = async () => {
      try {
        const res = await api.get<LikeStatus>(`/posts/${slug}/like`);
        if (cancelled) return;
        setLiked(res.data.liked);
        setCount(res.data.like_count);
      } catch {
        // Keep fallback values when status query fails.
      }
    };

    if (slug) {
      loadLikeStatus();
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);

    // Optimistic update: immediately toggle
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const res = await api.post<LikeStatus>(`/posts/${slug}/like`);
      // Sync with server response
      setLiked(res.data.liked);
      setCount(res.data.like_count);
    } catch {
      // Revert on error
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={clsx(
        'flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200',
        'border focus:outline-none focus:ring-2 focus:ring-offset-2',
        liked
          ? 'border-red-300 bg-red-50 text-red-600 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400 focus:ring-red-400'
          : 'border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground-secondary)] hover:border-red-300 hover:text-red-500 dark:hover:border-red-600 dark:hover:text-red-400 focus:ring-gray-400',
        loading && 'opacity-60 cursor-not-allowed'
      )}
      aria-label={liked ? '取消点赞' : '点赞'}
    >
      {liked ? (
        <HeartIconSolid className="w-5 h-5" />
      ) : (
        <HeartIcon className="w-5 h-5" />
      )}
      <span className="font-medium text-sm">{count}</span>
    </button>
  );
}
