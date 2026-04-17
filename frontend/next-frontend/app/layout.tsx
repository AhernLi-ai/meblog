import type { Metadata } from 'next';
import { Providers } from './providers';
import Layout from '@/components/Layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Meblog - 技术博客',
  description: '分享技术与生活的个人博客',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
