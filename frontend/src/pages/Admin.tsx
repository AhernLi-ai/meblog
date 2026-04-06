import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        管理后台
      </h1>

      {/* Welcome */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          欢迎回来，{user?.username}！
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          这里是你博客的管理后台，可以管理文章、分类和标签。
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/posts"
          className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            文章
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            管理你的文章
          </p>
        </Link>

        <Link
          to="/admin/categories"
          className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
            分类
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            管理文章分类
          </p>
        </Link>

        <Link
          to="/admin/tags"
          className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            标签
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            管理文章标签
          </p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          快捷操作
        </h3>
        <div className="flex gap-4">
          <Link
            to="/admin/posts/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            写文章
          </Link>
          <Link
            to="/"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            查看博客
          </Link>
        </div>
      </div>
    </div>
  );
}
