'use client';

import { useState, useEffect, useRef } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/api/client';
import clsx from 'clsx';

interface LikeStatus {
  liked: boolean;
  like_count: number;
}

interface LikeButtonProps {
  slug: string;
  queryKey?: string[];
  initialLiked?: boolean;
  initialCount?: number;
}

export default function LikeButton({ slug, queryKey = ['postLike', slug], initialLiked = false, initialCount = 0 }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  // Use ref to track if this is the initial render
  const isFirstRender = useRef(true);

  // Only sync with server state on initial render to prevent overwrites after user interaction
  useEffect(() => {
    if (isFirstRender.current) {
      setLiked(initialLiked);
      setCount(initialCount);
      isFirstRender.current = false;
    }
  }, [initialLiked, initialCount]);

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
      // Invalidate the query to ensure consistency
      queryClient.invalidateQueries({ queryKey });
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
