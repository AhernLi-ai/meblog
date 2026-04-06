import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '../api/tags';

export default function AdminTags() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: tagsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || '创建失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      tagsApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || '更新失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: tagsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || '删除失败');
    },
  });

  const openModal = (tag?: { id: number; name: string }) => {
    if (tag) {
      setEditingId(tag.id);
      setName(tag.name);
    } else {
      setEditingId(null);
      setName('');
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setName('');
    setEditingId(null);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateMutation.mutate({ id: editingId, name });
    } else {
      createMutation.mutate({ name });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个标签吗？')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          标签管理
        </h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          新建标签
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  别名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  文章数
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tags.map((tag) => (
                <tr key={tag.id}>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {tag.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {tag.slug}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {tag.post_count || 0}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(tag)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id)}
                      className="text-red-600 dark:text-red-400 hover:underline"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {tags.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无标签
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? '编辑标签' : '新建标签'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  名称
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="标签名称"
                  autoFocus
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? '保存中...'
                    : '保存'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
