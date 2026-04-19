import TagClient from './TagClient';
import tagSlugs from '@/tag-slugs.json';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return (tagSlugs as string[]).map((slug) => ({ slug }));
}

export default async function TagPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || '1', 10);

  return <TagClient initialTagSlug={slug} initialData={{ items: [], total: 0, page, size: 5, pages: 1 }} initialPage={page} />;
}
