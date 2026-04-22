import type { PostListItem, PostListResponse, Project, Tag } from '@/types';
import { fetchFromServerApi } from './server-api';

const DEFAULT_SITE_URL = 'http://localhost:3000';

export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL;
  return siteUrl.replace(/\/+$/, '');
}

export async function fetchAllPublishedPosts(pageSize = 100): Promise<PostListItem[]> {
  const firstPage = await fetchFromServerApi<PostListResponse>(`/posts?page=1&size=${pageSize}`, {
    revalidate: 1800,
  });

  const posts = [...firstPage.items];
  for (let page = 2; page <= firstPage.pages; page += 1) {
    const nextPage = await fetchFromServerApi<PostListResponse>(`/posts?page=${page}&size=${pageSize}`, {
      revalidate: 1800,
    });
    posts.push(...nextPage.items);
  }

  return posts;
}

export async function fetchAllProjects(): Promise<Project[]> {
  return fetchFromServerApi<Project[]>('/projects', { revalidate: 1800 });
}

export async function fetchAllTags(): Promise<Tag[]> {
  return fetchFromServerApi<Tag[]>('/tags', { revalidate: 1800 });
}
