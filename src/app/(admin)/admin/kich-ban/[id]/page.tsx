'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Script, Product } from '@/types';

export default function EditScriptPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [structureTags, setStructureTags] = useState('');
  const [performanceNotes, setPerformanceNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    try {
      setLoading(true);
      const [scriptRes, productsRes] = await Promise.all([
        fetch(`/api/scripts/${id}`),
        fetch('/api/products'),
      ]);

      const scriptData = await scriptRes.json();
      const productsData = await productsRes.json();

      if (!scriptRes.ok) throw new Error(scriptData.error || 'Không tìm thấy kịch bản');
      if (!productsRes.ok) throw new Error(productsData.error || 'Lỗi tải sản phẩm');

      const script: Script = scriptData.data;
      setProducts(productsData.data || []);
      setProductId(script.product_id);
      setTitle(script.title);
      setContent(script.content);
      setStructureTags(script.structure_tags || '[]');
      setPerformanceNotes(script.performance_notes || '');
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

    if (!productId) {
      setError('Vui lòng chọn sản phẩm');
      return;
    }
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung kịch bản');
      return;
    }

    if (structureTags.trim()) {
      try {
        JSON.parse(structureTags.trim());
      } catch {
        setError('Structure tags không đúng định dạng JSON');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/scripts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          title: title.trim(),
          content: content.trim(),
          structure_tags: structureTags.trim() || '[]',
          performance_notes: performanceNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật kịch bản');

      router.push('/admin/kich-ban');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Bạn có chắc muốn xóa kịch bản này? Hành động này không thể hoàn tác.')) {
      return;
    }
    try {
      const res = await fetch(`/api/scripts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi xóa kịch bản');
      }
      router.push('/admin/kich-ban');
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
            <div className="h-32 bg-gray-100 rounded-[12px]" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin/kich-ban"
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
          href="/admin/kich-ban"
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium transition"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Quay lại danh sách
        </Link>
        <h1 className="text-[22px] font-bold text-gray-900 mt-2 tracking-tight">
          Chỉnh sửa kịch bản
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-[16px] shadow-card border border-white/60 p-6 space-y-5">
          <div>
            <label htmlFor="product_id" className="block text-[13px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Sản phẩm
            </label>
            <select
              id="product_id"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all text-gray-900 text-[15px]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.market})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="title" className="block text-[13px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Tiêu đề
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all text-gray-900 text-[15px]"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-[13px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Nội dung kịch bản
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all text-gray-900 text-[15px] resize-y"
            />
          </div>

          <div>
            <label htmlFor="structure_tags" className="block text-[13px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Structure Tags (JSON)
            </label>
            <textarea
              id="structure_tags"
              value={structureTags}
              onChange={(e) => setStructureTags(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all text-gray-900 font-mono text-sm resize-y"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Mảng JSON các tag cấu trúc. Các tag hợp lệ: hook, problem, build-up, solution, climax, cta, insight.
              Mỗi tag cần: tag, label, start (vị trí bắt đầu), end (vị trí kết thúc).
            </p>
          </div>

          <div>
            <label htmlFor="performance_notes" className="block text-[13px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Ghi chú hiệu suất
            </label>
            <textarea
              id="performance_notes"
              value={performanceNotes}
              onChange={(e) => setPerformanceNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all text-gray-900 text-[15px] resize-y"
            />
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
              href="/admin/kich-ban"
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
            Xóa kịch bản
          </button>
        </div>
      </form>
    </div>
  );
}
