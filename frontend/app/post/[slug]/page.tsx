import PostDetailClient from './PostDetailClient';
import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { PostDetail } from '@/types';
import { fetchFromServerApi, ServerApiError } from '@/app/lib/server-api';
import postSlugs from '../../../post-slugs.json';

export const revalidate = 3600;
export const dynamicParams = false;
const postSlugSet = new Set(postSlugs as string[]);

export async function generateStaticParams() {
  return (postSlugs as string[]).map((slug) => ({ slug }));
}

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

function fallbackDescription(content: string): string {
  return content.replace(/[#*`_~\[\]]/g, '').slice(0, 200);
}

const getPostBySlug = cache(async (slug: string): Promise<PostDetail | null> => {
  try {
    return await fetchFromServerApi<PostDetail>(`/posts/${encodeURIComponent(slug)}`, {
      revalidate,
    });
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
});

function assertKnownSlug(slug: string): void {
  if (!postSlugSet.has(slug)) {
    notFound();
  }
}

function assertValidSlug(slug: string): void {
  if (!slug || !slug.trim()) {
    notFound();
  }
}

function ensurePostExists(post: PostDetail | null): PostDetail {
  if (!post) {
    notFound();
  }

  return post;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  assertValidSlug(slug);
  assertKnownSlug(slug);
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: '文章不存在 - Meblog',
      description: '未找到该文章内容',
    };
  }

  const description = post.summary || fallbackDescription(post.content);
  const image = post.project?.cover;
  const canonicalUrl = `/post/${post.slug}`;

  return {
    title: post.title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: canonicalUrl,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  assertValidSlug(slug);
  assertKnownSlug(slug);
  const post = await getPostBySlug(slug);
  return <PostDetailClient initialPost={ensurePostExists(post)} initialSlug={slug} />;
}
