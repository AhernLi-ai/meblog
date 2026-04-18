import ProjectClient from './ProjectClient';
import projectSlugs from '@/project-slugs.json';
import type { Project } from '@/types';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return (projectSlugs as string[]).map((slug) => ({ slug }));
}

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1', 10);

  return (
    <ProjectClient
      initialProjectSlug={slug}
      initialCategory={null as unknown as Project}
      initialData={{ items: [], total: 0, page: 1, size: 5, pages: 1 }}
      initialPage={page}
    />
  );
}
