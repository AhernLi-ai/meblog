import { Link, useLocation } from 'react-router-dom';
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
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="bg-[var(--color-background)] border-b border-[var(--color-border)] sticky top-0 z-50 h-16 flex items-center" style={{ boxShadow: 'var(--shadow-navbar)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            <span className="text-2xl">📝</span>
            <span>Meblog</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" icon={<HomeIcon className="w-4 h-4" />} label="首页" isActive={location.pathname === '/'} />
            <NavLink to="/projects" icon={<FolderIcon className="w-4 h-4" />} label="项目" isActive={location.pathname === '/projects'} />
            <NavLink to="/tags" icon={<TagIcon className="w-4 h-4" />} label="标签" isActive={location.pathname === '/tags'} />
            <NavLink to="/archive" icon={<ClockIcon className="w-4 h-4" />} label="归档" isActive={location.pathname === '/archive'} />
            <NavLink to="/about" icon={<UserCircleIcon className="w-4 h-4" />} label="关于" isActive={location.pathname === '/about'} />

            <div className="w-px h-6 bg-[var(--color-border)] mx-2" />

            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <MobileMenu isAuthenticated={isAuthenticated} />
          </div>

          {/* Desktop User Menu */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-3">
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 text-sm text-[var(--color-foreground)] hover:text-[var(--color-primary)] transition-colors">
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
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card-hover)] ring-1 ring-black ring-opacity-5 focus:outline-none border border-[var(--color-border)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[var(--color-border)]">
                      <p className="text-sm font-medium text-[var(--color-foreground)]">{user?.username}</p>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/admin"
                            className={`flex items-center gap-2 px-4 py-2 text-sm ${
                              active ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-foreground)]'
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
                              active ? 'bg-red-500 text-white' : 'text-[var(--color-foreground)]'
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
          )}
        </div>
      </div>
    </nav>
  );
}

// Nav link component
function NavLink({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-[8px] transition-all ${
        isActive 
          ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' 
          : 'text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-background-secondary)]'
      }`}
    >
      {icon}
      {label}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)] rounded-full" />
      )}
    </Link>
  );
}

// Mobile menu component
function MobileMenu({ isAuthenticated: _isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="p-2 text-[var(--color-foreground)] hover:bg-[var(--color-background-secondary)] rounded-[8px] transition-colors">
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
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card-hover)] ring-1 ring-black ring-opacity-5 focus:outline-none border border-[var(--color-border)] overflow-hidden">
          <div className="py-2">
            <Menu.Item>
              {({ active }) => (
                <Link to="/" className={`flex items-center gap-2 px-4 py-3 text-sm ${active ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-foreground)]'}`}>
                  <HomeIcon className="w-5 h-5" />
                  首页
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link to="/projects" className={`flex items-center gap-2 px-4 py-3 text-sm ${active ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-foreground)]'}`}>
                  <FolderIcon className="w-5 h-5" />
                  项目
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link to="/tags" className={`flex items-center gap-2 px-4 py-3 text-sm ${active ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-foreground)]'}`}>
                  <TagIcon className="w-5 h-5" />
                  标签
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link to="/about" className={`flex items-center gap-2 px-4 py-3 text-sm ${active ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-foreground)]'}`}>
                  <UserCircleIcon className="w-5 h-5" />
                  关于
                </Link>
              )}
            </Menu.Item>
            
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
