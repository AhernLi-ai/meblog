import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { tagsApi } from '../api/tags';
import Navbar from './Navbar';
import WechatQR from './WechatQR';
import { FolderIcon, TagIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: projectsApi.getAll,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  // Don't show sidebar on admin pages
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="lg:flex lg:gap-8">
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* Sidebar */}
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
                {categories.length === 0 ? (
                  <p className="text-sm text-[var(--color-foreground-secondary)]">暂无项目</p>
                ) : (
                  <ul className="space-y-1">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          to={`/category/${cat.slug}`}
                          className="flex items-center justify-between px-3 py-2 text-sm rounded-[8px] text-[var(--color-foreground)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                        >
                          <span>{cat.name}</span>
                          <span className="px-2 py-0.5 text-xs bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)] rounded-full">
                            {cat.post_count || 0}
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
                {tags.length === 0 ? (
                  <p className="text-sm text-[var(--color-foreground-secondary)]">暂无标签</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/tag/${tag.slug}`}
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
        </div>
      </div>
    </div>
  );
}
