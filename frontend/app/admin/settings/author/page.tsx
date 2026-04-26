'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline';
import { aboutApi } from '@/api/about';
import AdminGuard from '@/components/AdminGuard';
import OssUploadInput from '@/components/OssUploadInput';

export default function AdminAuthorSettingsPage() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [techStackText, setTechStackText] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [zhihuUrl, setZhihuUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [wechatId, setWechatId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['about'],
    queryFn: aboutApi.getAbout,
  });

  useEffect(() => {
    if (!data) return;
    setUsername(data.username || '');
    setAvatarUrl(data.avatar_url || '');
    setBio(data.bio || '');
    setTechStackText((data.tech_stack || []).join('\n'));
    setGithubUrl(data.github_url || '');
    setZhihuUrl(data.zhihu_url || '');
    setTwitterUrl(data.twitter_url || '');
    setWechatId(data.wechat_id || '');
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: aboutApi.updateAbout,
    onSuccess: () => {
      setError('');
      setMessage('作者设置已保存');
      queryClient.invalidateQueries({ queryKey: ['about'] });
    },
    onError: (err: any) => {
      setMessage('');
      setError(err.response?.data?.detail || '保存失败');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    const techStack = techStackText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    updateMutation.mutate({
      username: username.trim() || undefined,
      avatar_url: avatarUrl || null,
      bio: bio || null,
      tech_stack: techStack,
      github_url: githubUrl || null,
      zhihu_url: zhihuUrl || null,
      twitter_url: twitterUrl || null,
      wechat_id: wechatId || null,
    });
  };

  const inputClass =
    'w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-background)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]';
  const labelClass = 'block text-sm font-medium text-[var(--color-foreground)] mb-1';

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            作者设置
          </h1>
          <p className="mt-2 text-sm text-[var(--color-foreground-secondary)]">
            维护作者资料、个人简介和社交账号链接。
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-background-secondary)]">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            返回管理后台
          </Link>
          <Link
            href="/admin/settings"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            返回设置列表
          </Link>
        </div>

        {isLoading && <div className="text-[var(--color-foreground-secondary)] py-10">加载中...</div>}

        {!isLoading && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl p-6 shadow-[var(--shadow-card)]">
            {message && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">{message}</div>}
            {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>}

            <div>
              <label className={labelClass}>作者名称</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} required />
            </div>

            <OssUploadInput
              label="头像 URL"
              value={avatarUrl}
              onChange={setAvatarUrl}
              folder="author/avatar"
              placeholder="https://example.com/avatar.png"
            />

            <div>
              <label className={labelClass}>个人简介</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className={`${inputClass} h-24`} />
            </div>

            <div>
              <label className={labelClass}>技术栈（每行一项）</label>
              <textarea value={techStackText} onChange={(e) => setTechStackText(e.target.value)} className={`${inputClass} h-32`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-background-secondary)]">
              <div>
                <label className={labelClass}>GitHub URL</label>
                <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>知乎 URL</label>
                <input type="url" value={zhihuUrl} onChange={(e) => setZhihuUrl(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Twitter/X URL</label>
                <input type="url" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>微信号</label>
                <input type="text" value={wechatId} onChange={(e) => setWechatId(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
              >
                {updateMutation.isPending ? '保存中...' : '保存设置'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AdminGuard>
  );
}
