import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

interface NavbarProps {
  showAdminLink?: boolean;
}

export default function Navbar({ showAdminLink = true }: NavbarProps) {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
          >
            Meblog
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              首页
            </Link>
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              分类
            </Link>
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              标签
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/admin"
                  className={clsx(
                    'text-sm px-3 py-1 rounded transition-colors',
                    showAdminLink
                      ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                      : 'hidden'
                  )}
                >
                  管理后台
                </Link>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.username}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                >
                  退出
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
