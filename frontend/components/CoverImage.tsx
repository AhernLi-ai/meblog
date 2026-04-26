'use client';

import { useEffect, useMemo, useState } from 'react';
import { buildCoverFallbackCandidates } from '@/app/lib/cover-fallback';
import { filesApi } from '@/api/files';

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
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    let cancelled = false;
    const resolveSrc = async () => {
      if (!src?.startsWith('oss://')) {
        setResolvedSrc(src);
        return;
      }
      try {
        const signed = await filesApi.getSignedUrl(src);
        if (!cancelled) setResolvedSrc(signed.signed_url);
      } catch {
        if (!cancelled) setResolvedSrc(src);
      }
    };
    resolveSrc();
    return () => {
      cancelled = true;
    };
  }, [src]);

  const candidates = useMemo(() => {
    const fallbackCandidates = buildCoverFallbackCandidates(resolvedSrc, {
      giteeAssetsBase: process.env.NEXT_PUBLIC_GITEE_ASSETS_BASE || null,
    });
    return Array.from(new Set([...fallbackCandidates, placeholderSrc]));
  }, [resolvedSrc, placeholderSrc]);

  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [resolvedSrc, placeholderSrc]);

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
