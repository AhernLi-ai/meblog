'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api/posts';
import { projectsApi } from '@/api/project';
import { tagsApi } from '@/api/tags';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import AdminGuard from '@/components/AdminGuard';

export default function AdminPostNewPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [projectId, setProjectId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [error, setError] = useState('');

  const { data: projects = [] } = useQuery({ queryKey: ['projects'], queryFn: projectsApi.getAll });
  const { data: tags = [] } = useQuery({ queryKey: ['tags'], queryFn: tagsApi.getAll });

  const createMutation = useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      router.push('/admin/posts');
    },
    onError: (err: any) => setError(err.response?.data?.detail || '创建失败'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createMutation.mutate({
      title,
      content,
      summary,
      project_id: projectId ?? undefined,
      tag_ids: tagIds,
      status,
    });
  };

  const handleTagToggle = (tagId: number) => {
    setTagIds((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]));
  };

  return (
    <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">新建文章</h1>
        {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标题</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">项目（可选）</label>
            <select value={projectId || ''} onChange={(e) => setProjectId(Number(e.target.value) || null)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
              <option value="">无项目</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标签</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button key={tag.id} type="button" onClick={() => handleTagToggle(tag.id)} className={`px-3 py-1 text-sm rounded-full transition-colors ${tagIds.includes(tag.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">正文 (Markdown)</label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="在这里编写 Markdown 内容..." required />
              <div className="h-96 overflow-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <MarkdownRenderer content={content || '*预览区域*'} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">摘要（可选）</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 h-24" placeholder="文章摘要，不填则自动截取正文前200字" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">状态</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" value="draft" checked={status === 'draft'} onChange={() => setStatus('draft')} className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">草稿</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" value="published" checked={status === 'published'} onChange={() => setStatus('published')} className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700 dark:text-gray-300">发布</span>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="submit" disabled={createMutation.isPending} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {createMutation.isPending ? '保存中...' : '保存'}
            </button>
            <button type="button" onClick={() => router.push('/admin/posts')} className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
              取消
            </button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}
