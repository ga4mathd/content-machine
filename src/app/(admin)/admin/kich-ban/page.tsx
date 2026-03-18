'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Script, Product } from '@/types';

function SkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200/80 rounded-full w-48 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200/80 rounded-full w-32 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200/80 rounded-full w-16 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200/80 rounded-full w-24 animate-pulse" /></td>
      <td className="px-6 py-4 text-right"><div className="h-7 bg-gray-200/80 rounded-[10px] w-24 animate-pulse ml-auto" /></td>
    </tr>
  );
}

function TimesMultipliedBadge({ value }: { value: number }) {
  const maxBars = 5;
  const filledBars = Math.min(maxBars, Math.ceil(value / 5));

  let colorClass: string;
  let bgClass: string;
  let textClass: string;
  if (value > 20) {
    colorClass = 'bg-red-400';
    bgClass = 'bg-red-50';
    textClass = 'text-red-600';
  } else if (value > 10) {
    colorClass = 'bg-amber-400';
    bgClass = 'bg-amber-50';
    textClass = 'text-amber-600';
  } else {
    colorClass = 'bg-emerald-400';
    bgClass = 'bg-emerald-50';
    textClass = 'text-emerald-600';
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: maxBars }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-4 rounded-full ${i < filledBars ? colorClass : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${bgClass} ${textClass} ring-1 ring-inset ${
        value > 20 ? 'ring-red-100' : value > 10 ? 'ring-amber-100' : 'ring-emerald-100'
      }`}>
        {value}
      </span>
    </div>
  );
}

export default function ScriptListPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productFilter, setProductFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [scriptsRes, productsRes] = await Promise.all([
        fetch('/api/scripts'),
        fetch('/api/products'),
      ]);

      const scriptsData = await scriptsRes.json();
      const productsData = await productsRes.json();

      if (!scriptsRes.ok) throw new Error(scriptsData.error || 'Lỗi tải kịch bản');
      if (!productsRes.ok) throw new Error(productsData.error || 'Lỗi tải sản phẩm');

      setScripts(scriptsData.data || []);
      setProducts(productsData.data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Bạn có chắc muốn xóa kịch bản "${title}"?`)) return;
    try {
      const res = await fetch(`/api/scripts/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi xóa kịch bản');
      }
      setScripts((prev) => prev.filter((s) => s.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      alert(message);
    }
  }

  function getProductName(productId: string): string {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : 'Không rõ';
  }

  const filtered =
    productFilter === 'ALL'
      ? scripts
      : scripts.filter((s) => s.product_id === productFilter);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="bg-red-50/80 backdrop-blur-sm text-red-600 px-6 py-4 rounded-[16px] border border-red-100 shadow-card">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Kịch bản
            </h1>
            {!loading && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 ring-1 ring-purple-100">
                {scripts.length}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý kịch bản gốc để nhân bản nội dung
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/kich-ban/import"
            className="inline-flex items-center gap-2 bg-white border border-primary-200 text-primary-600 px-5 py-2.5 rounded-[12px] text-sm font-medium hover:bg-primary-50 transition-all duration-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Import Excel
          </Link>
          <Link
            href="/admin/kich-ban/tao-moi"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-[12px] text-sm font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-card hover:shadow-card-hover"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Thêm kịch bản
          </Link>
        </div>
      </div>

      {/* Product Filter Pills */}
      <div className="mb-5 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500 mr-1">Sản phẩm:</span>
        <button
          onClick={() => setProductFilter('ALL')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
            productFilter === 'ALL'
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
          }`}
        >
          Tất cả
        </button>
        {products.map((p) => (
          <button
            key={p.id}
            onClick={() => setProductFilter(p.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              productFilter === p.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Số lần nhân bản
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    <span className="text-gray-400 text-sm">Chưa có kịch bản nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((script) => (
                <tr key={script.id} className="hover:bg-primary-50/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">{script.title}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {getProductName(script.product_id)}
                  </td>
                  <td className="px-6 py-4">
                    <TimesMultipliedBadge value={script.times_multiplied} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(script.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/admin/kich-ban/${script.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 rounded-[10px] hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(script.id, script.title)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-[10px] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
