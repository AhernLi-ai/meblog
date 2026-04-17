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
      <div className="bg-[var(--color-background)] rounded-[12px] shadow-[var(--shadow-card)] p-8 border border-[var(--color-border)]">
        <h1 className="text-2xl font-bold text-[var(--color-foreground)] mb-6 text-center" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
          注册
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-[8px] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-[8px] bg-[var(--color-background)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              required
              minLength={3}
              maxLength={20}
              pattern="^\w+$"
            />
            <p className="mt-1 text-xs text-[var(--color-foreground-secondary)]">3-20个字符，支持字母、数字、下划线</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              minLength={8}
            />
            <p className="mt-1 text-xs text-[var(--color-foreground-secondary)]">至少8个字符，包含字母和数字</p>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-2 px-4 bg-[var(--color-primary)] text-white rounded-[8px] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {registerMutation.isPending ? '注册中...' : '注册'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[var(--color-foreground-secondary)]">
          已有账号？{' '}
          <Link to="/login" className="text-[var(--color-primary)] hover:underline">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
}
