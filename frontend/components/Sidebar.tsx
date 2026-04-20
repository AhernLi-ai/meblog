'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FolderIcon, TagIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { projectsApi } from '@/api/project';
import { tagsApi } from '@/api/tags';
import WechatQR from './WechatQR';

export default function Sidebar() {
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
    // 在生产环境中确保查询执行
    enabled: true,
  });

  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
    enabled: true,
  });

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('Sidebar - Projects:', projects, 'Loading:', projectsLoading);
    console.log('Sidebar - Tags:', tags, 'Loading:', tagsLoading);
  }

  return (
    <aside className="lg:w-72 mt-8 lg:mt-0 space-y-6">
      {/* Categories Widget */}
      <div className="bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] border border-[var(--color-border)] overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]">
        <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-background-secondary)]">
          <h3 className="flex items-center gap-2 font-semibold text-[var(--color-foreground)]">
            <FolderIcon className="w-5 h-5 text-[var(--color-primary)]" />
            项目
          </h3>
        </div>
        <div className="p-4">
          {projectsLoading ? (
            <p className="text-sm text-[var(--color-foreground-secondary)]">加载中...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-[var(--color-foreground-secondary)]">暂无项目</p>
          ) : (
            <ul className="space-y-1">
              {projects.map((proj) => (
                <li key={proj.id}>
                  <Link
                    href={`/project/${proj.slug}`}
                    className="flex items-center justify-between px-3 py-2 text-sm rounded-[8px] text-[var(--color-foreground)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                  >
                    <span>{proj.name}</span>
                    <span className="px-2 py-0.5 text-xs bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)] rounded-full">
                      {proj.post_count || 0}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Tags Widget */}
      <div className="bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] border border-[var(--color-border)] overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]">
        <div className="px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-background-secondary)]">
          <h3 className="flex items-center gap-2 font-semibold text-[var(--color-foreground)]">
            <TagIcon className="w-5 h-5 text-[var(--color-primary)]" />
            标签
          </h3>
        </div>
        <div className="p-4">
          {tagsLoading ? (
            <p className="text-sm text-[var(--color-foreground-secondary)]">加载中...</p>
          ) : tags.length === 0 ? (
            <p className="text-sm text-[var(--color-foreground-secondary)]">暂无标签</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)] rounded-[8px] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                >
                  <SparklesIcon className="w-3 h-3" />
                  {tag.name}
                  <span className="text-xs opacity-60">({tag.post_count || 0})</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* About Widget */}
      <div className="bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] dark:from-[#60A5FA] dark:to-[#A78BFA] rounded-[12px] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 text-white">
          <h3 className="font-bold text-lg mb-2">关于博客</h3>
          <p className="text-sm text-white/80 leading-relaxed">
            这是一个使用 React + FastAPI 构建的个人博客，分享技术与生活。
          </p>
        </div>
      </div>

      {/* Wechat QR Widget */}
      <WechatQR variant="sidebar" />
    </aside>
  );
}