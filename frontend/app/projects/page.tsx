import Link from 'next/link';
import type { Project } from '@/types';
import { fetchFromServerApi } from '@/app/lib/server-api';
import CoverImage from '@/components/CoverImage';

export const revalidate = 180;
export const dynamic = 'force-dynamic';

function isImageUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  const lower = value.toLowerCase();
  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('/') ||
    lower.startsWith('data:image/')
  );
}

export default async function ProjectsPage() {
  let projects: Project[] = [];
  let loadFailed = false;

  try {
    projects = (await fetchFromServerApi<Project[]>('/projects?include_hidden=true', { revalidate })) || [];
  } catch {
    loadFailed = true;
    // Keep page render resilient when API is temporarily unavailable.
  }

  if (loadFailed) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-semibold text-[var(--color-foreground)] mb-2">项目列表加载失败</h2>
        <p className="text-[var(--color-foreground-secondary)]">请稍后刷新页面重试。</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-12">
        <p className="text-xs tracking-[0.35em] text-[var(--color-foreground-secondary)] mb-3 uppercase">
          Project Index
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-foreground)] mb-4" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          所有项目
        </h1>
        <p className="text-[var(--color-foreground-secondary)] leading-7 max-w-3xl">
          项目用于聚合相关主题文章与实践记录，当前累计收录 {projects?.length || 0} 个项目。
        </p>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">暂无项目</h3>
          <p className="text-[var(--color-foreground-secondary)]">稍后再来看看吧</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/project/${proj.slug}`}
              className="group bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all duration-300 overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary)]"
            >
              {/* Cover Image */}
              <div className="aspect-video bg-[var(--color-background-secondary)] overflow-hidden">
                {isImageUrl(proj.cover) ? (
                  <CoverImage
                    src={proj.cover!}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--color-foreground-secondary)] text-4xl">
                    📁
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-1 group-hover:text-[var(--color-primary)] transition-colors" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                  {proj.name}
                </h2>
                <p className="text-sm text-[var(--color-foreground-secondary)]">
                  {proj.post_count || 0} 篇文章
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
