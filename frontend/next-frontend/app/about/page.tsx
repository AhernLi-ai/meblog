'use client';

import { useQuery } from '@tanstack/react-query';
import { aboutApi } from '@/api/about';
import AuthorCard from '@/components/AuthorCard';
import TechStack from '@/components/TechStack';
import SocialLinks from '@/components/SocialLinks';
import WechatQR from '@/components/WechatQR';

export default function About() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['about'],
    queryFn: aboutApi.getAbout,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)]">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <span className="text-[var(--color-foreground-secondary)]">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 rounded-[12px]">
          加载失败，请稍后重试
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Wechat QR - Visual Center/Prominent Card */}
      {data.wechat_qr_url && (
        <div className="mb-10">
          <WechatQR variant="article-end" />
        </div>
      )}

      {/* Author Card */}
      <div className="bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] border border-[var(--color-border)] p-8 mb-6">
        <AuthorCard
          username={data.username}
          avatar_url={data.avatar_url}
          bio={data.bio}
        />
      </div>

      {/* Tech Stack */}
      {data.tech_stack && data.tech_stack.length > 0 && (
        <div className="bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4 text-center" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            ⚡ 技术栈
          </h2>
          <TechStack tags={data.tech_stack} />
        </div>
      )}

      {/* Social Links */}
      {(data.github_url || data.zhihu_url || data.twitter_url || data.wechat_id) && (
        <div className="bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] border border-[var(--color-border)] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-4 text-center" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            🔗 找到我
          </h2>
          <SocialLinks
            github_url={data.github_url}
            zhihu_url={data.zhihu_url}
            twitter_url={data.twitter_url}
            wechat_id={data.wechat_id}
          />
        </div>
      )}
    </div>
  );
}
