import ProjectClient from './ProjectClient';
import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import projectSlugs from '@/project-slugs.json';
import type { Project, PostListResponse } from '@/types';
import { fetchFromServerApi, ServerApiError } from '@/app/lib/server-api';

export const revalidate = 1800;
export const dynamicParams = false;
const projectSlugSet = new Set(projectSlugs as string[]);

export async function generateStaticParams() {
  return (projectSlugs as string[]).map((slug) => ({ slug }));
}

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

const getProject = cache(async (slug: string): Promise<Project | null> => {
  try {
    return await fetchFromServerApi<Project>(`/projects/${encodeURIComponent(slug)}`, { revalidate });
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
});

function assertKnownProjectSlug(slug: string): void {
  if (!projectSlugSet.has(slug)) {
    notFound();
  }
}

function assertValidPage(page: number): void {
  if (!Number.isInteger(page) || page < 1) {
    notFound();
  }
}

function ensureProjectExists(project: Project | null): Project {
  if (!project) {
    notFound();
  }

  return project;
}

async function getProjectPosts(slug: string, page: number): Promise<PostListResponse> {
  return fetchFromServerApi<PostListResponse>(
    `/posts?project=${encodeURIComponent(slug)}&page=${page}&size=5`,
    { revalidate }
  );
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  assertKnownProjectSlug(slug);
  const project = await getProject(slug);
  if (!project) {
    return {
      title: '项目不存在 - Meblog',
      description: '未找到该项目内容',
    };
  }

  const title = project?.name || slug;
  const description = project?.description || `浏览 ${title} 项目下的文章`;

  return {
    title: `${title} - 项目文章`,
    description,
    alternates: { canonical: `/project/${slug}` },
    openGraph: {
      title: `${title} - 项目文章`,
      description,
      images: project?.cover ? [{ url: project.cover }] : undefined,
    },
  };
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { slug } = await params;
  assertKnownProjectSlug(slug);
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1', 10);
  assertValidPage(page);
  const project = ensureProjectExists(await getProject(slug));
  let initialData: PostListResponse = { items: [], total: 0, page, size: 5, pages: 1 };

  initialData = await getProjectPosts(slug, page);

  return (
    <ProjectClient
      initialProjectSlug={slug}
      initialCategory={project}
      initialData={initialData}
      initialPage={page}
    />
  );
}
