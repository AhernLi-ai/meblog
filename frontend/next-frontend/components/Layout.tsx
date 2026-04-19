'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  
  // Don't show sidebar on admin pages
  const isAdminPage = pathname.startsWith('/admin');

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

          {/* Sidebar - moved to dedicated client component */}
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
