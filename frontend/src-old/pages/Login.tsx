import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // Store token first, then get user info
      localStorage.setItem('token', data.access_token);
      const user = await authApi.getMe();
      login(data.access_token, user);
      navigate('/admin');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || '登录失败');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] p-8 border border-[var(--color-border)]">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-6 text-center" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          登录
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-[8px] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
              用户名 / 邮箱
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-[8px] bg-[var(--color-background)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-[8px] bg-[var(--color-background)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-2 px-4 bg-[var(--color-primary)] text-white rounded-[8px] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loginMutation.isPending ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--color-foreground-secondary)]">
          还没有账号？{' '}
          <Link to="/register" className="text-[var(--color-primary)] hover:underline">
            注册
          </Link>
        </p>
      </div>
    </div>
  );
}
