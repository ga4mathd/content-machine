'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MARKETS = ['VN', 'KH', 'LA', 'PH'] as const;

export default function CreateProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [market, setMarket] = useState<string>('VN');
  const [kbContent, setKbContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Vui lòng nhập tên sản phẩm');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          market,
          kb_content: kbContent.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tạo sản phẩm');

      router.push('/admin/san-pham');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-8">
        <Link
          href="/admin/san-pham"
          className="inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-700 font-medium transition-colors duration-200 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại danh sách
        </Link>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mt-3">
          Thêm sản phẩm mới
        </h1>
        <p className="text-gray-500 text-sm mt-1">Tạo sản phẩm mới và nhập knowledge base</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-6 space-y-5">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tên sản phẩm
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Lollibooks Sticker Book"
              className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Market */}
          <div>
            <label htmlFor="market" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Thị trường
            </label>
            <select
              id="market"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all duration-200 text-gray-900"
            >
              {MARKETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Knowledge Base Content */}
          <div>
            <label htmlFor="kb_content" className="block text-sm font-semibold text-gray-700 mb-1.5">
              Knowledge Base
              <span className="font-normal text-gray-400 ml-1">(Nội dung kiến thức sản phẩm)</span>
            </label>
            <textarea
              id="kb_content"
              value={kbContent}
              onChange={(e) => setKbContent(e.target.value)}
              rows={12}
              placeholder="Nhập thông tin chi tiết về sản phẩm: tính năng, lợi ích, đối tượng khách hàng, USP..."
              className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400 resize-y"
            />
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              Nội dung này sẽ được AI sử dụng để hiểu về sản phẩm khi nhân bản kịch bản.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 px-4 py-3 rounded-[12px] text-sm flex items-center gap-2">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-[12px] text-sm font-medium hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-card hover:shadow-card-hover inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang tạo...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Tạo sản phẩm
              </>
            )}
          </button>
          <Link
            href="/admin/san-pham"
            className="px-6 py-2.5 rounded-[12px] text-sm font-medium text-gray-700 bg-gray-100/80 hover:bg-gray-200/80 transition-all duration-200"
          >
            Hủy
          </Link>
        </div>
      </form>
    </div>
  );
}
