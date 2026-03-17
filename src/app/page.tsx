'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Đã xảy ra lỗi');
        return;
      }

      router.push(data.role === 'admin' ? '/admin' : '/team');
    } catch {
      setError('Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background gradient with mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-emerald-50" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-primary-300/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      {/* Login Card */}
      <div className="relative w-full max-w-[420px] mx-4 animate-fade-in">
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] shadow-modal border border-white/50 p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-[20px] bg-gradient-to-br from-primary-500 to-primary-700 text-white text-2xl font-bold mb-5 shadow-lg shadow-primary-500/25">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">
              Content Multiplication
            </h1>
            <p className="text-[15px] text-gray-500 mt-1.5 font-medium">
              Machine
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="w-8 h-[2px] bg-primary-200 rounded-full" />
              <span className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">Lollibooks</span>
              <span className="w-8 h-[2px] bg-primary-200 rounded-full" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-[13px] font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu để truy cập..."
                className="w-full px-4 py-3.5 bg-gray-50/80 border border-gray-200 rounded-[14px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all text-gray-900 text-[15px] placeholder:text-gray-400"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-[12px] text-[13px] font-medium border border-red-100 animate-fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-[14px] font-semibold text-[15px] hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-gray-100">
            <div className="flex -space-x-1">
              {['VN', 'KH', 'LA', 'PH'].map((market) => (
                <span
                  key={market}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[9px] font-bold text-gray-500 ring-2 ring-white"
                >
                  {market}
                </span>
              ))}
            </div>
            <span className="text-[11px] text-gray-400 font-medium">4 thị trường</span>
          </div>
        </div>
      </div>
    </div>
  );
}
