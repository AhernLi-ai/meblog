import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigate('/login');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || '注册失败');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate({ username, email, password });
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          注册
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={3}
              maxLength={20}
              pattern="^\w+$"
            />
            <p className="mt-1 text-xs text-gray-500">3-20个字符，支持字母、数字、下划线</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">至少8个字符，包含字母和数字</p>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerMutation.isPending ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          已有账号？{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
