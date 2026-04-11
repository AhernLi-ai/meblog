import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  HomeIcon,
  FolderIcon,
  TagIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">📝</span>
            <span>Meblog</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" icon={<HomeIcon className="w-4 h-4" />} label="首页" />
            <NavLink to="/projects" icon={<FolderIcon className="w-4 h-4" />} label="项目" />
            <NavLink to="/tags" icon={<TagIcon className="w-4 h-4" />} label="标签" />
            <NavLink to="/about" icon={<UserCircleIcon className="w-4 h-4" />} label="关于" />

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />

            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <MobileMenu isAuthenticated={isAuthenticated} />
          </div>

          {/* Desktop User Menu */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <UserCircleIcon className="w-6 h-6" />
                  <span className="font-medium">{user?.username}</span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/admin"
                            className={`flex items-center gap-2 px-4 py-2 text-sm ${
                              active ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <Cog6ToothIcon className="w-4 h-4" />
                            管理后台
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={logout}
                            className={`flex items-center gap-2 w-full px-4 py-2 text-sm text-left ${
                              active ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                            退出登录
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm hover:shadow"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Nav link component
function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all"
    >
      {icon}
      {label}
    </Link>
  );
}

// Mobile menu component
function MobileMenu({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <Bars3Icon className="w-6 h-6" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="py-2">
            <Menu.Item>
              {({ active }) => (
                <Link to="/" className={`flex items-center gap-2 px-4 py-3 text-sm ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                  <HomeIcon className="w-5 h-5" />
                  <span className="text-gray-700 dark:text-gray-300">首页</span>
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link to="/projects" className={`flex items-center gap-2 px-4 py-3 text-sm ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                  <FolderIcon className="w-5 h-5" />
                  <span className="text-gray-700 dark:text-gray-300">项目</span>
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link to="/tags" className={`flex items-center gap-2 px-4 py-3 text-sm ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                  <TagIcon className="w-5 h-5" />
                  <span className="text-gray-700 dark:text-gray-300">标签</span>
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link to="/about" className={`flex items-center gap-2 px-4 py-3 text-sm ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                  <UserCircleIcon className="w-5 h-5" />
                  <span className="text-gray-700 dark:text-gray-300">关于</span>
                </Link>
              )}
            </Menu.Item>
            
            {!isAuthenticated && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
                <Menu.Item>
                  {({ active }) => (
                    <Link to="/login" className={`flex items-center gap-2 px-4 py-3 text-sm ${active ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                      <span className="text-gray-700 dark:text-gray-300">登录</span>
                    </Link>
                  )}
                </Menu.Item>
              </>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
