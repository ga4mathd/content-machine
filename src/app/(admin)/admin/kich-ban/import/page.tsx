'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import type { Product } from '@/types';

interface ImportResult {
  title: string;
  success: boolean;
  error?: string;
}

interface ImportResponse {
  total: number;
  imported: number;
  failed: number;
  results: ImportResult[];
}

export default function ImportScriptsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi tải sản phẩm');
      const list: Product[] = data.data || [];
      setProducts(list);
      if (list.length > 0) setProductId(list[0].id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
    } finally {
      setLoadingProducts(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      const ext = selected.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx' && ext !== 'xls') {
        setError('Chỉ chấp nhận file .xlsx hoặc .xls');
        setFile(null);
        return;
      }
    }
    setFile(selected);
    setError('');
    setImportResult(null);
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setImportResult(null);

    if (!productId) {
      setError('Vui lòng chọn sản phẩm');
      return;
    }
    if (!file) {
      setError('Vui lòng chọn file Excel');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('product_id', productId);

      const res = await fetch('/api/scripts/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi import');

      setImportResult(data.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingProducts) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="bg-white/80 rounded-[16px] border border-white/60 p-6 space-y-5">
            <div className="h-10 bg-gray-100 rounded-[12px]" />
            <div className="h-10 bg-gray-100 rounded-[12px]" />
          </div>
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
          Import kịch bản từ Excel
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Upload file Excel chứa các kịch bản, app sẽ tự tạo từng kịch bản cho sản phẩm bạn chọn.
        </p>
      </div>

      {/* Template info */}
      <div className="bg-blue-50/80 border border-blue-200/60 rounded-[14px] p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Định dạng file Excel</h3>
        <p className="text-[13px] text-blue-700 mb-2">File cần có các cột sau (hàng đầu tiên là header):</p>
        <div className="overflow-x-auto">
          <table className="text-xs text-blue-800 border-collapse">
            <thead>
              <tr className="border-b border-blue-200">
                <th className="text-left pr-6 py-1.5 font-semibold">Tên cột</th>
                <th className="text-left pr-6 py-1.5 font-semibold">Bắt buộc</th>
                <th className="text-left py-1.5 font-semibold">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-blue-100">
                <td className="pr-6 py-1.5 font-mono">Tiêu đề</td>
                <td className="pr-6 py-1.5 text-red-600">Có</td>
                <td className="py-1.5">Tên kịch bản</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="pr-6 py-1.5 font-mono">Nội dung</td>
                <td className="pr-6 py-1.5 text-red-600">Có</td>
                <td className="py-1.5">Toàn bộ nội dung kịch bản gốc</td>
              </tr>
              <tr>
                <td className="pr-6 py-1.5 font-mono">Ghi chú</td>
                <td className="pr-6 py-1.5 text-gray-400">Không</td>
                <td className="py-1.5">Ghi chú hiệu suất (views, tương tác...)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleImport} className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-[16px] shadow-card border border-white/60 p-6 space-y-5">
          {/* Product select */}
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
              {products.length === 0 && (
                <option value="">Chưa có sản phẩm</option>
              )}
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.market})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1.5">
              Tất cả kịch bản trong file sẽ được gán cho sản phẩm này.
            </p>
          </div>

          {/* File upload */}
          <div>
            <label htmlFor="excel_file" className="block text-[13px] font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              File Excel
            </label>
            <div className="relative">
              <input
                ref={fileInputRef}
                id="excel_file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white outline-none transition-all text-gray-900 text-[15px] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:cursor-pointer"
              />
            </div>
            {file && (
              <p className="text-xs text-green-600 mt-1.5 font-medium">
                Đã chọn: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-[12px] text-sm font-medium border border-red-100 animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !file}
            className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2.5 rounded-[12px] text-sm font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Đang import...
              </span>
            ) : (
              <span className="inline-flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                Import kịch bản
              </span>
            )}
          </button>
          <Link
            href="/admin/kich-ban"
            className="px-6 py-2.5 rounded-[12px] text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            Hủy
          </Link>
        </div>
      </form>

      {/* Import Results */}
      {importResult && (
        <div className="mt-8 space-y-4 animate-fade-in">
          {/* Summary */}
          <div className={`rounded-[14px] p-4 border ${
            importResult.failed === 0
              ? 'bg-green-50/80 border-green-200/60'
              : 'bg-amber-50/80 border-amber-200/60'
          }`}>
            <div className="flex items-center gap-3">
              {importResult.failed === 0 ? (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                </div>
              )}
              <div>
                <p className={`font-semibold text-[15px] ${importResult.failed === 0 ? 'text-green-800' : 'text-amber-800'}`}>
                  Import xong: {importResult.imported}/{importResult.total} kịch bản
                </p>
                {importResult.failed > 0 && (
                  <p className="text-sm text-amber-600">{importResult.failed} kịch bản bị lỗi</p>
                )}
              </div>
            </div>
          </div>

          {/* Detail table */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[16px] shadow-card border border-white/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">STT</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Tiêu đề</th>
                  <th className="text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {importResult.results.map((r, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-2.5 text-gray-400 text-[13px]">{i + 1}</td>
                    <td className="px-4 py-2.5 text-gray-900 font-medium text-[13px]">{r.title}</td>
                    <td className="px-4 py-2.5">
                      {r.success ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-[13px] font-medium">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                          OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 text-[13px] font-medium">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          {r.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/kich-ban"
              className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-[12px] text-sm font-semibold hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm"
            >
              Xem danh sách kịch bản
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
