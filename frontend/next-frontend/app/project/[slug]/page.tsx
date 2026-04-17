import ProjectClient from './ProjectClient';

// Pre-defined project slugs for static generation
const PROJECT_SLUGS = [
  'sheng-huo',
  'ji-zhu',
];

export function generateStaticParams() {
  return PROJECT_SLUGS.map((slug) => ({ slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  return <ProjectClient initialProjectSlug={params.slug} />;
}
