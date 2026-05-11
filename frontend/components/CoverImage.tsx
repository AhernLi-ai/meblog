'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { buildCoverFallbackCandidates } from '@/app/lib/cover-fallback';
import { isSignableOssMediaUrl, resolveSignedMediaUrl } from '@/app/lib/media-url';

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
  // Cache signed URL per src to avoid repeated resolution calls.
  const cacheRef = useRef<Record<string, string>>({});
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    // Hydration-safe initial value: use src directly; signed resolution runs in useEffect.
    if (cacheRef.current[src]) return cacheRef.current[src];
    return src;
  });

  useEffect(() => {
    // Return early if already cached.
    if (cacheRef.current[src]) {
      setResolvedSrc(cacheRef.current[src]);
      return;
    }

    let cancelled = false;
    const resolveSrc = async () => {
      if (!src || !isSignableOssMediaUrl(src)) {
        cacheRef.current[src] = src;
        if (!cancelled) setResolvedSrc(src);
        return;
      }
      try {
        const signedUrl = await resolveSignedMediaUrl(src);
        if (!cancelled) {
          cacheRef.current[src] = signedUrl;
          setResolvedSrc(signedUrl);
        }
      } catch {
        if (!cancelled) {
          cacheRef.current[src] = src;
          setResolvedSrc(src);
        }
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
