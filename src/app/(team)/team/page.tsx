'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';

const marketBadgeColor: Record<string, string> = {
  VN: 'bg-red-50 text-red-600 border border-red-200/60',
  KH: 'bg-blue-50 text-blue-600 border border-blue-200/60',
  LA: 'bg-amber-50 text-amber-600 border border-amber-200/60',
  PH: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
};

function LoadingSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="h-7 w-48 bg-gray-200/60 rounded-[10px] mb-2 animate-pulse" />
        <div className="h-4 w-72 bg-gray-100/80 rounded-[8px] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/60 rounded-[16px] border border-white/60 p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-36 bg-gray-200/60 rounded-[8px]" />
              <div className="h-6 w-10 bg-gray-100/80 rounded-full" />
            </div>
            <div className="h-3 w-32 bg-gray-100/60 rounded-[6px] mb-4" />
            <div className="h-4 w-28 bg-emerald-100/40 rounded-[8px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeamHomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
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

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="bg-red-50/80 backdrop-blur-sm text-red-600 px-5 py-4 rounded-[14px] border border-red-200/60 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <span className="text-sm font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chọn sản phẩm</h1>
            <p className="text-sm text-gray-500">
              Chọn sản phẩm để xem và nhân bản kịch bản
            </p>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-[16px] bg-gray-100/80 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">Chưa có sản phẩm nào</p>
          <p className="text-gray-300 text-xs">Sản phẩm sẽ được admin thêm vào hệ thống</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <Link
              key={product.id}
              href={`/team/${product.id}`}
              className="group block bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card hover:shadow-card-hover p-6 transition-all duration-200 hover:translate-y-[-2px] relative overflow-hidden"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Gradient left accent border */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-l-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 truncate pr-3">
                  {product.name}
                </h2>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                    marketBadgeColor[product.market] || 'bg-gray-50 text-gray-600 border border-gray-200/60'
                  }`}
                >
                  {product.market}
                </span>
              </div>

              <p className="text-sm text-gray-400">
                Tạo ngày {new Date(product.created_at).toLocaleDateString('vi-VN')}
              </p>

              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-600 group-hover:text-emerald-700 transition-colors">
                  Xem kịch bản
                </span>
                <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <svg className="w-4 h-4 text-emerald-600 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
