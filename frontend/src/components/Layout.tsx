import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { categoriesApi } from '../api/categories';
import { tagsApi } from '../api/tags';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className={showSidebar ? 'flex gap-8' : ''}>
          {/* Main Content */}
          <main className={showSidebar ? 'flex-1 min-w-0' : 'w-full'}>
            {children}
          </main>

          {/* Sidebar */}
          {showSidebar && (
            <aside className="w-64 flex-shrink-0">
              {/* Categories */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  分类
                </h3>
                <ul className="space-y-2">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/category/${cat.slug}`}
                        className="flex justify-between text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <span>{cat.name}</span>
                        <span className="text-gray-400">{cat.post_count || 0}</span>
                      </Link>
                    </li>
                  ))}
                  {categories.length === 0 && (
                    <li className="text-sm text-gray-400">暂无分类</li>
                  )}
                </ul>
              </div>

              {/* Tags */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/tag/${tag.slug}`}
                      className="text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {tag.name}
                    </Link>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-sm text-gray-400">暂无标签</span>
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
