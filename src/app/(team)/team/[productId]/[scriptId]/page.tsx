'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Generation, StoryboardScene, ProductionNote } from '@/types';
import { VARIATION_TYPES, VARIATION_GROUPS, isValidCombo, getVariationType } from '@/lib/ai/variation-types';
import { STRATEGIES } from '@/lib/ai/strategies';

interface ScriptWithProduct {
  id: string;
  title: string;
  content: string;
  product_name: string;
  product_market: string;
  times_multiplied: number;
}

interface Suggestion {
  combo: string;
  types: string[];
  labels: string[];
  times_used: number;
}

/* ---------- Group accent colors ---------- */
const groupAccent: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
  A: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-400', activeBg: 'bg-violet-100' },
  B: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-400', activeBg: 'bg-sky-100' },
  C: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-400', activeBg: 'bg-amber-100' },
  D: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-400', activeBg: 'bg-rose-100' },
  E: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-400', activeBg: 'bg-teal-100' },
};

/* ---------- Freshness helpers ---------- */
function getFreshnessStyle(score: number) {
  if (score >= 70) return { gradient: 'from-emerald-500 to-green-500', text: 'text-emerald-700', bg: 'bg-emerald-50', pulse: false };
  if (score >= 40) return { gradient: 'from-yellow-500 to-amber-500', text: 'text-yellow-700', bg: 'bg-yellow-50', pulse: false };
  return { gradient: 'from-orange-500 to-red-500', text: 'text-red-700', bg: 'bg-red-50', pulse: true };
}

/* ---------- Loading skeleton ---------- */
function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-4 w-20 bg-gray-100/80 rounded-[8px] mb-2 animate-pulse" />
          <div className="h-7 w-64 bg-gray-200/60 rounded-[10px] mb-2 animate-pulse" />
          <div className="h-4 w-40 bg-gray-100/80 rounded-[8px] animate-pulse" />
        </div>
        <div className="h-10 w-36 bg-gray-100/80 rounded-[12px] animate-pulse" />
      </div>
      <div className="h-12 w-72 bg-gray-100/60 rounded-[12px] mb-6 animate-pulse" />
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3 space-y-4">
          <div className="h-48 bg-white/60 rounded-[16px] animate-pulse" />
          <div className="h-64 bg-white/60 rounded-[16px] animate-pulse" />
        </div>
        <div className="col-span-2">
          <div className="h-48 bg-gray-50/60 rounded-[16px] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ========== MAIN COMPONENT ========== */
export default function GenerationWorkspacePage() {
  const params = useParams();
  const scriptId = params.scriptId as string;
  const productId = params.productId as string;

  const [script, setScript] = useState<ScriptWithProduct | null>(null);
  const [freshness, setFreshness] = useState<number>(100);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [variationParams, setVariationParams] = useState<Record<string, string>>({});
  const [activeGroup, setActiveGroup] = useState('A');
  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'compare'>('create');
  const [mode, setMode] = useState<'auto' | 'advanced'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('cm-mode') as 'auto' | 'advanced') || 'auto';
    }
    return 'auto';
  });
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<'claude' | 'gemini'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('cm-ai-model') as 'claude' | 'gemini') || 'claude';
    }
    return 'claude';
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    variation_label: string;
    variation_description: string;
    full_script: string;
    storyboard: StoryboardScene[];
    production_note?: ProductionNote;
    id: string;
    auto_params?: Record<string, string>;
    model_used?: string;
    is_fallback?: boolean;
  } | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [compareGen, setCompareGen] = useState<Generation | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [scriptRes, freshnessRes, suggestionsRes] = await Promise.all([
        fetch(`/api/scripts/${scriptId}`),
        fetch(`/api/scripts/${scriptId}/freshness`),
        fetch(`/api/scripts/${scriptId}/suggestions`),
      ]);

      const scriptData = await scriptRes.json();
      const freshnessData = await freshnessRes.json();
      const suggestionsData = await suggestionsRes.json();

      if (scriptData.success) setScript(scriptData.data);
      if (freshnessData.success) setFreshness(freshnessData.data.freshness_score);
      if (suggestionsData.success) setSuggestions(suggestionsData.data);
    } catch {
      setError('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [scriptId]);

  const loadGenerations = useCallback(async () => {
    const res = await fetch(`/api/generations?script_id=${scriptId}`);
    const data = await res.json();
    if (data.success) setGenerations(data.data);
  }, [scriptId]);

  useEffect(() => {
    loadData();
    loadGenerations();
  }, [loadData, loadGenerations]);

  function toggleType(typeId: string) {
    setSelectedTypes((prev) => {
      if (prev.includes(typeId)) {
        return prev.filter((t) => t !== typeId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, typeId];
    });
  }

  function handleParamChange(key: string, value: string) {
    setVariationParams((prev) => ({ ...prev, [key]: value }));
  }

  function switchMode(newMode: 'auto' | 'advanced') {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cm-mode', newMode);
    }
  }

  function switchModel(model: 'claude' | 'gemini') {
    setSelectedModel(model);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cm-ai-model', model);
    }
  }

  async function handleGenerateAuto() {
    if (!selectedStrategy) {
      setError('Vui lòng chọn 1 chiến lược');
      return;
    }

    setGenerating(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_id: scriptId,
          strategy_id: selectedStrategy,
          variation_types: [],
          variation_params: {},
          num_variations: 1,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Lỗi tạo biến thể');
        return;
      }

      if (data.data && data.data.length > 0) {
        setResult({ ...data.data[0], model_used: data.model_used, is_fallback: data.is_fallback });
        loadGenerations();
        loadData();
      }
    } catch {
      setError('Lỗi kết nối server');
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerate() {
    if (selectedTypes.length === 0) {
      setError('Vui lòng chọn ít nhất 1 kiểu biến thể');
      return;
    }

    const validation = isValidCombo(selectedTypes);
    if (!validation.valid) {
      setError(validation.reason_vi || 'Combo không hợp lệ');
      return;
    }

    setGenerating(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_id: scriptId,
          variation_types: selectedTypes,
          variation_params: variationParams,
          num_variations: 1,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Lỗi tạo biến thể');
        return;
      }

      if (data.data && data.data.length > 0) {
        setResult({ ...data.data[0], model_used: data.model_used, is_fallback: data.is_fallback });
        loadGenerations();
        loadData();
      }
    } catch {
      setError('Lỗi kết nối server');
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  async function handleExportDocx(generationId: string) {
    const res = await fetch('/api/export/docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generation_id: generationId }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `variation-${generationId.slice(0, 8)}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleToggleFavorite(genId: string) {
    await fetch(`/api/generations/${genId}/favorite`, { method: 'PATCH' });
    loadGenerations();
  }

  async function handleToggleWinner(genId: string) {
    await fetch(`/api/generations/${genId}/winner`, { method: 'PATCH' });
    loadGenerations();
  }

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!script) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 rounded-[14px] bg-red-50 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
        </div>
        <p className="text-red-500 font-medium">Không tìm thấy kịch bản</p>
      </div>
    );
  }

  const fStyle = getFreshnessStyle(freshness);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* ============ HEADER ============ */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href={`/team/${productId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-600 font-medium transition-colors mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Quay lại
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{script.title}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100/80 rounded-[8px] text-xs text-gray-500 font-medium">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
              {script.product_name}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100/80 rounded-[8px] text-xs text-gray-500 font-medium">
              {script.product_market}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Model Selector */}
          <div className="inline-flex gap-0.5 bg-gray-100/80 p-0.5 rounded-[10px]">
            <button
              onClick={() => switchModel('claude')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all duration-200 ${
                selectedModel === 'claude'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>🟠</span> Claude
            </button>
            <button
              onClick={() => switchModel('gemini')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all duration-200 ${
                selectedModel === 'gemini'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>🔵</span> Gemini
            </button>
          </div>

          {/* Freshness Badge */}
          <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] ${fStyle.bg} border border-current/5 ${fStyle.pulse ? 'animate-pulse-soft' : ''}`}>
            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${fStyle.gradient}`} />
            <span className={`text-sm font-semibold ${fStyle.text}`}>Freshness: {freshness}/100</span>
          </div>
        </div>
      </div>

      {/* ============ TABS ============ */}
      <div className="mb-6">
        <div className="inline-flex gap-1 bg-gray-100/80 p-1 rounded-[12px]">
          {[
            { key: 'create', label: 'Tạo mới', icon: 'M12 4.5v15m7.5-7.5h-15' },
            { key: 'history', label: `Lịch sử (${generations.length})`, icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
            { key: 'compare', label: 'So sánh A/B', icon: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'create' | 'history' | 'compare')}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50/80 backdrop-blur-sm text-red-600 px-4 py-3 rounded-[12px] text-sm mb-4 border border-red-200/60 flex items-center gap-2 animate-fade-in">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ============ CREATE TAB ============ */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-5 gap-6">
          {/* -------- Left Panel 3/5 -------- */}
          <div className="col-span-3 space-y-4">
            {/* Original Script */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <h3 className="font-semibold text-gray-900 text-sm">Kịch bản gốc</h3>
              </div>
              <div className="text-sm text-gray-600 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed bg-gray-50/80 rounded-[12px] p-4">
                {script.content}
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="inline-flex gap-1 bg-gray-100/80 p-1 rounded-[10px]">
                <button
                  onClick={() => switchMode('auto')}
                  className={`px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-all duration-200 ${
                    mode === 'auto'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  AI tự động
                </button>
                <button
                  onClick={() => switchMode('advanced')}
                  className={`px-3.5 py-1.5 rounded-[8px] text-xs font-medium transition-all duration-200 ${
                    mode === 'advanced'
                      ? 'bg-gray-700 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Nâng cao
                </button>
              </div>
              {mode === 'auto' && (
                <span className="text-xs text-gray-400">AI tự chọn combo + tham số</span>
              )}
            </div>

            {/* ====== AUTO MODE: Strategy Cards ====== */}
            {mode === 'auto' && (
              <>
                <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 rounded-[6px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">Chọn chiến lược</h3>
                    <span className="text-xs text-gray-400 ml-auto">Chọn 1, AI lo phần còn lại</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {STRATEGIES.map((strategy) => {
                      const isSelected = selectedStrategy === strategy.id;
                      return (
                        <button
                          key={strategy.id}
                          onClick={() => setSelectedStrategy(isSelected ? null : strategy.id)}
                          className={`text-left p-4 rounded-[14px] border-2 transition-all duration-200 relative overflow-hidden group ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-50/80 shadow-md'
                              : 'border-gray-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-sm'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute right-3 top-3">
                              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                              </div>
                            </div>
                          )}
                          <div className="text-xl mb-2">{strategy.icon}</div>
                          <div className="font-semibold text-sm text-gray-900 mb-1 pr-6">{strategy.name_vi}</div>
                          <p className="text-xs text-gray-500 leading-relaxed">{strategy.description_vi}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Auto Generate Button */}
                <button
                  onClick={handleGenerateAuto}
                  disabled={generating || !selectedStrategy}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-[14px] font-semibold text-base shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      AI đang tạo biến thể...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                      </svg>
                      TẠO BIẾN THỂ
                    </>
                  )}
                </button>
              </>
            )}

            {/* ====== ADVANCED MODE: Original UI ====== */}
            {mode === 'advanced' && (
              <>
                {/* Smart Suggestions */}
                {suggestions.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-emerald-200/60 shadow-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-[6px] bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-emerald-800 text-sm">Gợi ý combo chưa dùng</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.slice(0, 5).map((s) => (
                        <button
                          key={s.combo}
                          onClick={() => {
                            setSelectedTypes(s.types);
                            setVariationParams({});
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-full text-xs text-emerald-700 font-medium hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200"
                        >
                          <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                          </svg>
                          {s.labels.join(' + ')}
                          {s.times_used > 0 && <span className="text-emerald-400">({s.times_used}x)</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Variation Configurator */}
                <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                    </svg>
                    <h3 className="font-semibold text-gray-900 text-sm">Chọn kiểu biến thể</h3>
                    <span className="text-xs text-gray-400 ml-auto">{selectedTypes.length}/3</span>
                  </div>

                  {/* Group Tabs */}
                  <div className="flex gap-1 mb-4 bg-gray-100/80 p-1 rounded-[12px]">
                    {Object.entries(VARIATION_GROUPS).map(([key, group]) => {
                      const accent = groupAccent[key] || groupAccent.A;
                      const isActive = activeGroup === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveGroup(key)}
                          className={`flex-1 px-3 py-2 rounded-[10px] text-xs font-medium transition-all duration-200 ${
                            isActive
                              ? `${accent.activeBg} ${accent.text} shadow-sm`
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {group.name_vi}
                        </button>
                      );
                    })}
                  </div>

                  {/* Variation Type Cards */}
                  <div className="space-y-2">
                    {VARIATION_TYPES.filter((t) => t.group === activeGroup).map((vType) => {
                      const isSelected = selectedTypes.includes(vType.id);
                      return (
                        <div key={vType.id}>
                          <button
                            onClick={() => toggleType(vType.id)}
                            className={`w-full text-left p-3.5 rounded-[12px] border transition-all duration-200 relative overflow-hidden ${
                              isSelected
                                ? 'border-emerald-400 bg-emerald-50/50 shadow-sm'
                                : 'border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/50'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-l-[12px]" />
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-[8px] bg-gray-100/80 text-[10px] font-mono font-bold text-gray-500">
                                  {vType.id}
                                </span>
                                <span className="font-medium text-sm text-gray-900">{vType.name_vi}</span>
                              </div>
                              <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all duration-200 ${
                                isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5 ml-9">{vType.description_vi}</p>
                            <p className="text-xs text-gray-400 mt-0.5 ml-9 italic">{vType.example_vi}</p>
                          </button>

                          {isSelected && vType.params.length > 0 && (
                            <div className="ml-9 mt-2 space-y-2.5 pb-2 animate-fade-in">
                              {vType.params.map((param) => (
                                <div key={param.key}>
                                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                    {param.label_vi} {param.required && <span className="text-red-500">*</span>}
                                  </label>
                                  {param.type === 'select' && param.options ? (
                                    <select
                                      value={variationParams[param.key] || ''}
                                      onChange={(e) => handleParamChange(param.key, e.target.value)}
                                      className="w-full px-3 py-2.5 border border-gray-200 rounded-[12px] text-sm text-gray-900 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                                    >
                                      <option value="">Chọn...</option>
                                      {param.options.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type="text"
                                      value={variationParams[param.key] || ''}
                                      onChange={(e) => handleParamChange(param.key, e.target.value)}
                                      placeholder={param.placeholder}
                                      className="w-full px-3 py-2.5 border border-gray-200 rounded-[12px] text-sm text-gray-900 bg-white/80 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {selectedTypes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400 font-medium">Đã chọn:</span>
                        {selectedTypes.map((typeId) => {
                          const vType = getVariationType(typeId);
                          return (
                            <span
                              key={typeId}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"
                            >
                              <span className="font-mono font-bold">{typeId}</span>
                              <span className="text-emerald-500">-</span>
                              {vType?.name_vi}
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleType(typeId); }}
                                className="ml-0.5 text-emerald-400 hover:text-emerald-700 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={generating || selectedTypes.length === 0}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-[14px] font-semibold text-base shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang tạo biến thể...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                      </svg>
                      TẠO BIẾN THỂ
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* -------- Right Panel 2/5 -------- */}
          <div className="col-span-2">
            {/* Generating State */}
            {generating && (
              <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-8 text-center animate-fade-in">
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-gray-700 font-medium">AI đang tạo biến thể</p>
                <p className="text-xs text-gray-400 mt-1.5">
                  Có thể mất 10-30 giây
                  <span className="inline-flex ml-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </p>
              </div>
            )}

            {/* Result Card */}
            {result && !generating && (
              <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-5 space-y-4 sticky top-4 animate-slide-in-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{result.variation_label}</h3>
                    {result.model_used && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        result.model_used === 'claude'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {result.model_used === 'claude' ? '🟠 Claude' : '🔵 Gemini'}
                        {result.is_fallback && <span className="text-red-500">(fallback)</span>}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleCopy(result.full_script)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100/80 rounded-full text-xs font-medium text-gray-600 hover:bg-gray-200/80 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={() => handleExportDocx(result.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-full text-xs font-medium hover:bg-primary-100 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      .docx
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">{result.variation_description}</p>

                {/* Auto Params - what AI chose */}
                {result.auto_params && Object.keys(result.auto_params).length > 0 && (
                  <div className="bg-emerald-50/80 rounded-[12px] p-3 border border-emerald-200/40">
                    <h4 className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1.5">AI đã chọn</h4>
                    <div className="space-y-1">
                      {Object.entries(result.auto_params).map(([key, value]) => (
                        <div key={key} className="text-xs text-emerald-700">
                          <span className="font-medium text-emerald-500">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Script */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kịch bản</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50/80 rounded-[12px] p-4 max-h-64 overflow-y-auto leading-relaxed">
                    {result.full_script}
                  </div>
                </div>

                {/* Production Note */}
                {result.production_note && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gợi ý dựng</h4>
                    <div className="bg-gray-50/80 rounded-[12px] p-4 space-y-2 text-xs text-gray-600">
                      {result.production_note.visual_style && (
                        <div><span className="font-semibold text-gray-700">Visual:</span> {result.production_note.visual_style}</div>
                      )}
                      {result.production_note.footage_suggestions && (
                        <div><span className="font-semibold text-gray-700">Footage:</span> {result.production_note.footage_suggestions}</div>
                      )}
                      {result.production_note.music_mood && (
                        <div><span className="font-semibold text-gray-700">Nhạc:</span> {result.production_note.music_mood}</div>
                      )}
                      {result.production_note.text_overlay_tips && (
                        <div><span className="font-semibold text-gray-700">Text overlay:</span> {result.production_note.text_overlay_tips}</div>
                      )}
                      {result.production_note.estimated_duration && (
                        <div><span className="font-semibold text-gray-700">Độ dài:</span> {result.production_note.estimated_duration}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!result && !generating && (
              <div className="rounded-[16px] border-2 border-dashed border-gray-200/80 p-10 text-center">
                <div className="w-12 h-12 rounded-[12px] bg-gray-100/80 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Chọn kiểu biến thể</p>
                <p className="text-gray-300 text-xs mt-1">Kết quả sẽ hiển thị ở đây</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============ HISTORY TAB ============ */}
      {activeTab === 'history' && (
        <div className="space-y-3 animate-fade-in">
          {generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 rounded-[14px] bg-gray-100/80 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm font-medium">Chưa có biến thể nào được tạo</p>
              <p className="text-gray-300 text-xs mt-1">Biến thể sẽ xuất hiện sau khi bạn tạo</p>
            </div>
          ) : (
            generations.map((gen, idx) => {
              let storyboard: StoryboardScene[] = [];
              try { storyboard = JSON.parse(gen.output_storyboard || '[]'); } catch { /* */ }

              return (
                <div
                  key={gen.id}
                  className={`bg-white/80 backdrop-blur-sm rounded-[16px] border shadow-card p-5 transition-all duration-200 hover:shadow-card-hover ${
                    gen.is_winner ? 'border-emerald-300/60' : 'border-white/60'
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Winner badge */}
                  {gen.is_winner ? (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-100 to-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-200/60">
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 3h14l-1.5 5H6.5L5 3zM5 3l-.5 2M19 3l.5 2M6.5 8L4 21h16L17.5 8H6.5z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Winner
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-600 rounded-[8px] text-xs font-mono font-semibold">
                        {gen.variation_type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(gen.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Favorite */}
                      <button
                        onClick={() => handleToggleFavorite(gen.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                          gen.is_favorite
                            ? 'bg-amber-100 text-amber-500'
                            : 'bg-gray-100/80 text-gray-300 hover:text-amber-500 hover:bg-amber-50'
                        }`}
                        title="Yêu thích"
                      >
                        <svg className="w-4 h-4" fill={gen.is_favorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                        </svg>
                      </button>

                      {/* Winner */}
                      <button
                        onClick={() => handleToggleWinner(gen.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                          gen.is_winner
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-100/80 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title="Winner"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721" />
                        </svg>
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(gen.output_text)}
                        className="w-8 h-8 rounded-full bg-gray-100/80 text-gray-400 flex items-center justify-center hover:bg-gray-200/80 hover:text-gray-600 transition-all duration-200"
                        title="Copy"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                        </svg>
                      </button>

                      {/* Export docx */}
                      <button
                        onClick={() => handleExportDocx(gen.id)}
                        className="w-8 h-8 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center hover:bg-primary-100 hover:text-primary-700 transition-all duration-200"
                        title="Export .docx"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </button>

                      {/* Compare */}
                      <button
                        onClick={() => { setCompareGen(gen); setActiveTab('compare'); }}
                        className="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center hover:bg-purple-100 hover:text-purple-700 transition-all duration-200"
                        title="So sánh"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4 leading-relaxed">
                    {gen.output_text}
                  </div>

                  {storyboard.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                      <span className="text-xs text-gray-400">{storyboard.length} cảnh</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ============ COMPARE TAB ============ */}
      {activeTab === 'compare' && (
        <div className="grid grid-cols-2 gap-6 animate-fade-in">
          {/* Original */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-l-[16px]" />
            <div className="flex items-center gap-2 mb-4 pl-2">
              <div className="w-6 h-6 rounded-[8px] bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-xs font-bold">A</span>
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">Kịch bản gốc</h3>
            </div>
            <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed pl-2">
              {script.content}
            </div>
          </div>

          {/* Variation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card p-5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-l-[16px]" />
            <div className="flex items-center justify-between mb-4 pl-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[8px] bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600 text-xs font-bold">B</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">Biến thể</h3>
              </div>
              {!compareGen && (
                <select
                  onChange={(e) => {
                    const gen = generations.find((g) => g.id === e.target.value);
                    if (gen) setCompareGen(gen);
                  }}
                  className="text-sm border border-gray-200 rounded-[12px] px-3 py-2 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                >
                  <option value="">Chọn biến thể...</option>
                  {generations.map((g) => (
                    <option key={g.id} value={g.id}>
                      [{g.variation_type}] {new Date(g.created_at).toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {compareGen ? (
              <div className="pl-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-600 rounded-[8px] text-xs font-mono font-semibold">
                    {compareGen.variation_type}
                  </span>
                  <button
                    onClick={() => setCompareGen(null)}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 transition-colors font-medium"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                    </svg>
                    Đổi biến thể
                  </button>
                </div>
                <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {compareGen.output_text}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 rounded-[12px] bg-gray-100/80 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Chọn biến thể để so sánh</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
