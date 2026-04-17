import TagClient from './TagClient';

// Pre-defined tag slugs for static generation
const TAG_SLUGS = [
  'fastapi',
  'docker',
  'yunwei',
  'ai',
  'sql',
  'redis',
];

export function generateStaticParams() {
  return TAG_SLUGS.map((slug) => ({ slug }));
}

export default function TagPage({ params }: { params: { slug: string } }) {
  return <TagClient initialTagSlug={params.slug} />;
}
