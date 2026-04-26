'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildCoverFallbackCandidates } from '@/app/lib/cover-fallback';

interface CoverImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
}

export default function CoverImage({
  src,
  alt,
  className,
  placeholderSrc = '/cover-placeholder.svg',
}: CoverImageProps) {
  const candidates = useMemo(() => {
    const fallbackCandidates = buildCoverFallbackCandidates(src, {
      giteeAssetsBase: process.env.NEXT_PUBLIC_GITEE_ASSETS_BASE || null,
    });
    return Array.from(new Set([...fallbackCandidates, placeholderSrc]));
  }, [src, placeholderSrc]);

  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [src, placeholderSrc]);

  const currentSrc = candidates[candidateIndex] || placeholderSrc;

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        setCandidateIndex((current) => (current < candidates.length - 1 ? current + 1 : current));
      }}
    />
  );
}
