import PostDetailClient from './PostDetailClient';
import postSlugs from '../../../post-slugs.json';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return (postSlugs as string[]).map((slug) => ({ slug }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostDetailClient initialPost={null} initialSlug={slug} />;
}
