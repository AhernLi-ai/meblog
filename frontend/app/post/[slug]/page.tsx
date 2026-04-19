import PostDetailClient from './PostDetailClient';
import postSlugs from '../../../post-slugs.json';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return (postSlugs as string[]).map((slug) => ({ slug }));
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  console.log('PostPage called with slug:', slug);
  return <PostDetailClient initialPost={null} initialSlug={slug} />;
}
