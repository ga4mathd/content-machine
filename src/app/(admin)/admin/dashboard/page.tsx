'use client';

import { useState, useEffect } from 'react';

interface DashboardData {
  total_products: number;
  total_scripts: number;
  total_generations: number;
  total_favorites: number;
  total_winners: number;
  top_types: { variation_type: string; count: number }[];
  recent_generations: {
    id: string;
    variation_type: string;
    created_at: string;
    created_by: string;
    script_title: string;
  }[];
  overused_scripts: {
    id: string;
    title: string;
    times_multiplied: number;
    product_name: string;
  }[];
}

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-5 ${className}`}>
      <div className="animate-pulse space-y-3">
        <div className="h-3 bg-gray-200/80 rounded-full w-1/3" />
        <div className="h-8 bg-gray-200/80 rounded-[10px] w-1/2" />
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-5">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200/80 rounded-full w-1/3" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-3 bg-gray-200/80 rounded-full flex-1" />
            <div className="h-3 bg-gray-200/80 rounded-full w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto animate-fade-in">
        <div className="mb-8">
          <div className="h-8 bg-gray-200/80 rounded-[10px] w-48 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonTable />
          <SkeletonTable />
          <div className="col-span-1 md:col-span-2">
            <SkeletonTable />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50/80 backdrop-blur-sm text-red-600 px-6 py-4 rounded-[16px] border border-red-100 shadow-card">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span className="font-medium">Lỗi tải dashboard</span>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Sản phẩm',
      value: data.total_products,
      gradient: 'from-blue-500 to-indigo-600',
      iconBg: 'bg-white/20',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      ),
    },
    {
      label: 'Kịch bản',
      value: data.total_scripts,
      gradient: 'from-purple-500 to-violet-600',
      iconBg: 'bg-white/20',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      ),
    },
    {
      label: 'Biến thể',
      value: data.total_generations,
      gradient: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-white/20',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
        </svg>
      ),
    },
    {
      label: 'Yêu thích',
      value: data.total_favorites,
      gradient: 'from-amber-400 to-orange-500',
      iconBg: 'bg-white/20',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
        </svg>
      ),
    },
    {
      label: 'Winner',
      value: data.total_winners,
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-white/20',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 0 1-3.77 1.522m0 0a6.003 6.003 0 0 1-3.77-1.522" />
        </svg>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm mt-1">Tổng quan hệ thống nhân bản nội dung</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-[16px] bg-gradient-to-br ${stat.gradient} p-5 text-white shadow-card hover:shadow-card-hover transition-all duration-300`}
          >
            <div className="absolute top-3 right-3">
              <div className={`${stat.iconBg} rounded-[10px] p-2`}>
                {stat.icon}
              </div>
            </div>
            <div className="relative">
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <div className="text-sm text-white/80 mt-1 font-medium">{stat.label}</div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Variation Types */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
            <h3 className="font-semibold text-gray-900">Kiểu biến thể phổ biến</h3>
          </div>
          {data.top_types.length === 0 ? (
            <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-3">
              {data.top_types.map((t, i) => (
                <div key={t.variation_type} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-400 w-5 text-right">{i + 1}.</span>
                  <span className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold flex-shrink-0 min-w-[3rem] text-center">
                    {t.variation_type}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-400 to-primary-600 h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (t.count / (data.top_types[0]?.count || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-10 text-right">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overused Scripts Alert */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
            </svg>
            <h3 className="font-semibold text-gray-900">Kịch bản được nhân bản nhiều nhất</h3>
          </div>
          {data.overused_scripts.length === 0 ? (
            <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-2">
              {data.overused_scripts.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-[12px] hover:bg-gray-50/80 transition-colors duration-200">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{s.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.product_name}</div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    s.times_multiplied > 20 ? 'bg-red-50 text-red-600 ring-1 ring-red-100' :
                    s.times_multiplied > 10 ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' :
                    'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                  }`}>
                    {s.times_multiplied} lần
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Generations */}
        <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-6 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <h3 className="font-semibold text-gray-900">Hoạt động gần đây</h3>
          </div>
          {data.recent_generations.length === 0 ? (
            <p className="text-gray-400 text-sm">Chưa có hoạt động</p>
          ) : (
            <div className="space-y-1.5">
              {data.recent_generations.map((g) => (
                <div key={g.id} className="flex items-center gap-4 p-3 rounded-[12px] hover:bg-gray-50/80 transition-colors duration-200">
                  <span className="px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold min-w-[3rem] text-center">
                    {g.variation_type}
                  </span>
                  <span className="text-sm text-gray-700 flex-1 truncate">{g.script_title}</span>
                  <span className="text-xs text-gray-400 font-medium flex-shrink-0">{g.created_by}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(g.created_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
