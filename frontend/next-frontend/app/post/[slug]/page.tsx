import PostDetailClient from './PostDetailClient';

// Pre-defined slugs for static generation - this list should be updated when posts change
const POST_SLUGS = [
  'react-18-new-features',
  'linux-server-ops',
  'docker-deployment-guide',
  'ai-da-mo-xing-ying-yong-kai-fa-1',
  'frontend-backend-separation',
  'postgresql-performance',
  'fastapi-best-practices',
  'git-workflow',
  'python-async-programming',
  'typescript-generics',
];

export function generateStaticParams() {
  return POST_SLUGS.map((slug) => ({ slug }));
}

export default function PostPage({ params }: { params: { slug: string } }) {
  return <PostDetailClient initialSlug={params.slug} />;
}
