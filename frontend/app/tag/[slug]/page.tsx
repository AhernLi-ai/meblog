import TagClient from './TagClient';
import type { Metadata } from 'next';
import { use } from 'react';
import { notFound } from 'next/navigation';
import type { PostListResponse } from '@/types';
import { fetchFromServerApi } from '@/app/lib/server-api';

export const revalidate = 1800;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

interface TagPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

function formatTagName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function getTagPosts(slug: string, page: number): Promise<PostListResponse> {
  return fetchFromServerApi<PostListResponse>(
    `/posts?tag=${encodeURIComponent(slug)}&page=${page}&size=5`,
    { revalidate }
  );
}

function assertValidPage(page: number): void {
  if (!Number.isInteger(page) || page < 1) {
    notFound();
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tagName = formatTagName(slug);

  return {
    title: `${tagName} - 标签文章`,
    description: `浏览 ${tagName} 标签下的最新文章`,
    alternates: { canonical: `/tag/${slug}` },
  };
}

export default function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = use(params);
  const { page: pageStr } = use(searchParams);
  const page = parseInt(pageStr || '1', 10);
  assertValidPage(page);
  const initialData: PostListResponse = use(getTagPosts(slug, page));

  return <TagClient initialTagSlug={slug} initialData={initialData} initialPage={page} />;
}
