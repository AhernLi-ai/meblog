import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { postsApi } from '../api/posts';
import { categoriesApi } from '../api/categories';
import { tagsApi } from '../api/tags';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function AdminPostEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [error, setError] = useState('');

  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postsApi.getById(id!),
    enabled: !!id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setSummary(post.summary || '');
      setCategoryId(post.category.id);
      setTagIds(post.tags.map((t) => t.id));
      setStatus(post.status as 'draft' | 'published');
    }
  }, [post]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => postsApi.update(Number(id), data),
    onSuccess: () => {
      navigate('/admin/posts');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || '更新失败');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError('请选择分类');
      return;
    }
    setError('');
    updateMutation.mutate({
      title,
      content,
      summary,
      category_id: categoryId!,
      tag_ids: tagIds,
      status,
    });
  };

  const handleTagToggle = (tagId: number) => {
    setTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((tid) => tid !== tagId) : [...prev, tagId]
    );
  };

  if (postLoading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        编辑文章
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            分类
          </label>
          <select
            value={categoryId || ''}
            onChange={(e) => setCategoryId(Number(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">选择分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            标签
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  tagIds.includes(tag.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            正文 (Markdown)
          </label>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="在这里编写 Markdown 内容..."
              required
            />
            <div className="h-96 overflow-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <MarkdownRenderer content={content || '*预览区域*'} />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            摘要（可选）
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 h-24"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            状态
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === 'draft'}
                onChange={() => setStatus('draft')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700 dark:text-gray-300">草稿</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === 'published'}
                onChange={() => setStatus('published')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700 dark:text-gray-300">发布</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? '保存中...' : '保存'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/posts')}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
