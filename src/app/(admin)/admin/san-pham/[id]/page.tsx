'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Product } from '@/types';

const MARKETS = ['VN', 'KH', 'LA', 'PH'] as const;

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [name, setName] = useState('');
  const [market, setMarket] = useState<string>('VN');
  const [kbContent, setKbContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không tìm thấy sản phẩm');
      const product: Product = data.data;
      setName(product.name);
      setMarket(product.market);
      setKbContent(product.kb_content);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Vui lòng nhập tên sản phẩm');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          market,
          kb_content: kbContent.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật sản phẩm');

      router.push('/admin/san-pham');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.')) {
      return;
    }
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi xóa sản phẩm');
      }
      router.push('/admin/san-pham');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      alert(message);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="bg-white/80 rounded-[16px] border border-white/60 p-6 space-y-5">
            <div className="h-10 bg-gray-100 rounded-[12px]" />
            <div className="h-10 bg-gray-100 rounded-[12px]" />
            <div className="h-40 bg-gray-100 rounded-[12px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !name) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/san-pham"
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Quay lại danh sách
        </Link>
        <div className="mt-4 flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-[12px] text-sm font-medium border border-red-100">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/san-pham"
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Quay lại danh sách
        </Link>
        <h1 className="text-[22px] font-bold text-gray-900 mt-2 tracking-tight">
          Chỉnh sửa sản phẩm
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-[16px] shadow-card border border-white/60 p-6 space-y-5">
          <div>
            <label htmlFor="name" className="block text-[13px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Tên sản phẩm
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all text-gray-900 text-[15px]"
            />
          </div>

          <div>
            <label htmlFor="market" className="block text-[13px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Thị trường
            </label>
            <div className="flex gap-2">
              {MARKETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMarket(m)}
                  className={`px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all ${
                    market === m
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-gray-50/80 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="kb_content" className="block text-[13px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Knowledge Base
            </label>
            <textarea
              id="kb_content"
              value={kbContent}
              onChange={(e) => setKbContent(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all text-gray-900 text-[15px] resize-y"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Nội dung này sẽ được AI sử dụng để hiểu về sản phẩm khi nhân bản kịch bản.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-[12px] text-sm font-medium border border-red-100 animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-[12px] text-sm font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Đang lưu...
                </span>
              ) : 'Lưu thay đổi'}
            </button>
            <Link
              href="/admin/san-pham"
              className="px-6 py-2.5 rounded-[12px] text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
            >
              Hủy
            </Link>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2.5 rounded-[12px] text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all border border-red-100"
          >
            Xóa sản phẩm
          </button>
        </div>
      </form>
    </div>
  );
}
