'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Script, Product } from '@/types';

function getFreshnessColor(timesMultiplied: number): {
  label: string;
  color: string;
  bg: string;
  gradient: string;
} {
  if (timesMultiplied === 0) {
    return {
      label: 'Mới',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      gradient: 'from-emerald-500 to-emerald-600',
    };
  }
  if (timesMultiplied <= 5) {
    return {
      label: 'Tươi',
      color: 'text-green-700',
      bg: 'bg-green-50',
      gradient: 'from-green-500 to-emerald-500',
    };
  }
  if (timesMultiplied <= 15) {
    return {
      label: 'Trung bình',
      color: 'text-yellow-700',
      bg: 'bg-yellow-50',
      gradient: 'from-yellow-500 to-amber-500',
    };
  }
  return {
    label: 'Đã dùng nhiều',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    gradient: 'from-orange-500 to-red-500',
  };
}

function LoadingSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="h-4 w-48 bg-gray-100/80 rounded-[8px] mb-3 animate-pulse" />
        <div className="h-7 w-56 bg-gray-200/60 rounded-[10px] mb-2 animate-pulse" />
        <div className="h-4 w-72 bg-gray-100/80 rounded-[8px] animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/60 rounded-[16px] border border-white/60 p-6 animate-pulse"
          >
            <div className="h-5 w-44 bg-gray-200/60 rounded-[8px] mb-3" />
            <div className="space-y-2 mb-4">
              <div className="h-3 w-full bg-gray-100/60 rounded-[6px]" />
              <div className="h-3 w-4/5 bg-gray-100/60 rounded-[6px]" />
              <div className="h-3 w-3/5 bg-gray-100/60 rounded-[6px]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 bg-emerald-100/40 rounded-full" />
              <div className="h-3 w-24 bg-gray-100/40 rounded-[6px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductScriptsPage() {
  const params = useParams();
  const productId = params.productId as string;

  const [scripts, setScripts] = useState<Script[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [productId]);

  async function fetchData() {
    try {
      setLoading(true);
      const [productRes, scriptsRes] = await Promise.all([
        fetch(`/api/products/${productId}`),
        fetch('/api/scripts'),
      ]);

      const productData = await productRes.json();
      const scriptsData = await scriptsRes.json();

      if (!productRes.ok) throw new Error(productData.error || 'Không tìm thấy sản phẩm');
      if (!scriptsRes.ok) throw new Error(scriptsData.error || 'Lỗi tải kịch bản');

      setProduct(productData.data);
      const allScripts: Script[] = scriptsData.data || [];
      setScripts(allScripts.filter((s) => s.product_id === productId));
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
        <Link
          href="/team"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại danh sách sản phẩm
        </Link>
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
      {/* Header with Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/team"
          className="inline-flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Quay lại danh sách sản phẩm
        </Link>

        <div className="flex items-center gap-3 mt-3">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {product?.name || 'Sản phẩm'}
            </h1>
            <p className="text-sm text-gray-500">
              Chọn kịch bản để bắt đầu nhân bản nội dung
            </p>
          </div>
        </div>
      </div>

      {scripts.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-[16px] bg-gray-100/80 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm font-medium mb-1">Chưa có kịch bản nào</p>
          <p className="text-gray-300 text-xs">Kịch bản sẽ được admin thêm cho sản phẩm này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scripts.map((script, index) => {
            const freshness = getFreshnessColor(script.times_multiplied);
            const preview =
              script.content.length > 150
                ? script.content.slice(0, 150) + '...'
                : script.content;

            // Progress bar for times_multiplied (max visual at 30)
            const progressPercent = Math.min((script.times_multiplied / 30) * 100, 100);

            return (
              <Link
                key={script.id}
                href={`/team/${productId}/${script.id}`}
                className="group block bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card hover:shadow-card-hover p-6 transition-all duration-200 hover:translate-y-[-2px] relative overflow-hidden"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Gradient left accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${freshness.gradient} rounded-l-[16px]`} />

                <div className="flex items-start justify-between mb-3 pl-2">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2 pr-3 group-hover:text-emerald-700 transition-colors">
                    {script.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-3 pl-2 leading-relaxed">
                  {preview}
                </p>

                <div className="flex items-center gap-3 pl-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${freshness.bg} ${freshness.color} border border-current/10`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${freshness.gradient}`} />
                    {freshness.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    Đã nhân bản: {script.times_multiplied} lần
                  </span>
                </div>

                {/* Mini progress bar for times multiplied */}
                <div className="mt-4 pl-2">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${freshness.gradient} rounded-full transition-all duration-500`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Hover arrow */}
                <div className="absolute right-5 bottom-5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
