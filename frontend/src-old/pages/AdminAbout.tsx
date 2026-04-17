import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aboutApi, AboutData } from '../api/about';

export default function AdminAbout() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<Partial<AboutData>>({});
  const [techInput, setTechInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['about'],
    queryFn: aboutApi.getAbout,
  });

  // Pre-fill form when data loads
  useEffect(() => {
    if (data) {
      setForm({ ...data });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<AboutData>) => aboutApi.updateAbout(payload),
    onSuccess: (updated) => {
      setForm({ ...updated });
      queryClient.setQueryData(['about'], updated);
      setSuccessMsg('保存成功！');
      setErrorMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.detail || '保存失败，请稍后重试');
      setSuccessMsg('');
      setTimeout(() => setErrorMsg(''), 5000);
    },
  });

  const handleChange = (field: keyof AboutData, value: string | string[] | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTechTag = () => {
    const trimmed = techInput.trim();
    if (!trimmed) return;
    if (form.tech_stack && !form.tech_stack.includes(trimmed)) {
      handleChange('tech_stack', [...(form.tech_stack || []), trimmed]);
    }
    setTechInput('');
  };

  const removeTechTag = (tag: string) => {
    handleChange('tech_stack', (form.tech_stack || []).filter((t) => t !== tag));
  };

  const handleTechKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTechTag();
    } else if (e.key === 'Backspace' && !techInput && form.tech_stack && form.tech_stack.length > 0) {
      removeTechTag(form.tech_stack[form.tech_stack.length - 1]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          关于页面设置
        </h1>
        <a
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          查看关于页面 →
        </a>
      </div>

      {/* Success / Error */}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          ✗ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            基本信息
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                作者名字
              </label>
              <input
                type="text"
                value={form.username || ''}
                onChange={(e) => handleChange('username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="你的名字"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                头像 URL
              </label>
              <input
                type="url"
                value={form.avatar_url || ''}
                onChange={(e) => handleChange('avatar_url', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/avatar.jpg"
              />
              {form.avatar_url && (
                <img
                  src={form.avatar_url}
                  alt="头像预览"
                  className="mt-2 w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                个人简介
              </label>
              <textarea
                value={form.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="简单介绍一下自己..."
              />
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            技术栈
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            输入后按 <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Enter</kbd> 或 <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">,</kbd> 添加标签
          </p>

          <div className="flex flex-wrap gap-2 mb-2 min-h-[36px]">
            {(form.tech_stack || []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTechTag(tag)}
                  className="hover:text-blue-800 dark:hover:text-blue-300 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={handleTechKeyDown}
              onBlur={addTechTag}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="例如: React, TypeScript, Go..."
            />
            <button
              type="button"
              onClick={addTechTag}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
            >
              添加
            </button>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            社交链接
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={form.github_url || ''}
                onChange={(e) => handleChange('github_url', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://github.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                知乎 URL
              </label>
              <input
                type="url"
                value={form.zhihu_url || ''}
                onChange={(e) => handleChange('zhihu_url', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://zhihu.com/people/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Twitter URL
              </label>
              <input
                type="url"
                value={form.twitter_url || ''}
                onChange={(e) => handleChange('twitter_url', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://twitter.com/username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                微信 ID
              </label>
              <input
                type="text"
                value={form.wechat_id || ''}
                onChange={(e) => handleChange('wechat_id', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="微信号"
              />
            </div>
          </div>
        </div>

        {/* WeChat QR */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            微信公众号二维码
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                微信二维码图片 URL
              </label>
              <input
                type="url"
                value={form.wechat_qr_url || ''}
                onChange={(e) => handleChange('wechat_qr_url', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/wechat-qr.jpg"
              />
              {form.wechat_qr_url && (
                <img
                  src={form.wechat_qr_url}
                  alt="微信二维码预览"
                  className="mt-2 w-24 h-24 object-contain border border-gray-200 dark:border-gray-600 rounded"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                引导文案
              </label>
              <input
                type="text"
                value={form.wechat_guide_text || ''}
                onChange={(e) => handleChange('wechat_guide_text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="关注公众号回复关键字..."
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm"
          >
            {updateMutation.isPending ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  );
}
