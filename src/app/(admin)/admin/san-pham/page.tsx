'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';

const MARKETS = ['ALL', 'VN', 'KH', 'LA', 'PH'] as const;

const marketBadgeColor: Record<string, string> = {
  VN: 'bg-red-50 text-red-600 ring-1 ring-red-100',
  KH: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
  LA: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
  PH: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
};

const marketLabels: Record<string, string> = {
  ALL: 'Tất cả',
  VN: 'VN',
  KH: 'KH',
  LA: 'LA',
  PH: 'PH',
};

function SkeletonRow() {
  return (
    <tr>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200/80 rounded-full w-40 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200/80 rounded-full w-12 animate-pulse" /></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200/80 rounded-full w-24 animate-pulse" /></td>
      <td className="px-6 py-4 text-right"><div className="h-7 bg-gray-200/80 rounded-[10px] w-24 animate-pulse ml-auto" /></td>
    </tr>
  );
}

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marketFilter, setMarketFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải dữ liệu');
      setProducts(data.data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi xóa sản phẩm');
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      alert(message);
    }
  }

  const filtered =
    marketFilter === 'ALL'
      ? products
      : products.filter((p) => p.market === marketFilter);

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
              Sản phẩm
            </h1>
            {!loading && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-600 ring-1 ring-primary-100">
                {products.length}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý danh sách sản phẩm và knowledge base
          </p>
        </div>
        <Link
          href="/admin/san-pham/tao-moi"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-[12px] text-sm font-medium hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-card hover:shadow-card-hover"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Thêm sản phẩm
        </Link>
      </div>

      {/* Market Filter Pills */}
      <div className="mb-5 flex items-center gap-2">
        <span className="text-sm text-gray-500 mr-1">Thị trường:</span>
        {MARKETS.map((m) => (
          <button
            key={m}
            onClick={() => setMarketFilter(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              marketFilter === m
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
            }`}
          >
            {marketLabels[m]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tên
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Thị trường
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
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                    </svg>
                    <span className="text-gray-400 text-sm">Chưa có sản phẩm nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="hover:bg-primary-50/30 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900">{product.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        marketBadgeColor[product.market] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.market}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(product.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link
                      href={`/admin/san-pham/${product.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-primary-600 border border-primary-200 rounded-[10px] hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
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
