import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { tagsApi } from '../api/tags';
import Navbar from './Navbar';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <FolderIcon className="w-5 h-5 text-blue-600" />
                  项目
                </h3>
              </div>
              <div className="p-4">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">暂无项目</p>
                ) : (
                  <ul className="space-y-1">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link
                          to={`/category/${cat.slug}`}
                          className="flex items-center justify-between px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <span>{cat.name}</span>
                          <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <TagIcon className="w-5 h-5 text-purple-600" />
                  标签
                </h3>
              </div>
              <div className="p-4">
                {tags.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">暂无标签</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/tag/${tag.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
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
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 text-white">
                <h3 className="font-bold text-lg mb-2">关于博客</h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  这是一个使用 React + FastAPI 构建的个人博客，分享技术与生活。
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
