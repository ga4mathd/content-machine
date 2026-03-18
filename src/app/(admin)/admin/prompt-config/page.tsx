'use client';

import { useState, useEffect } from 'react';
import { SYSTEM_PROMPT } from '@/lib/ai/prompts';

const groupColors: Record<string, { border: string; bg: string; text: string; icon: string }> = {
  A: { border: 'border-l-blue-400', bg: 'bg-blue-50/60', text: 'text-blue-700', icon: 'text-blue-400' },
  B: { border: 'border-l-purple-400', bg: 'bg-purple-50/60', text: 'text-purple-700', icon: 'text-purple-400' },
  C: { border: 'border-l-amber-400', bg: 'bg-amber-50/60', text: 'text-amber-700', icon: 'text-amber-400' },
  D: { border: 'border-l-emerald-400', bg: 'bg-emerald-50/60', text: 'text-emerald-700', icon: 'text-emerald-400' },
  E: { border: 'border-l-rose-400', bg: 'bg-rose-50/60', text: 'text-rose-700', icon: 'text-rose-400' },
};

const groupDescriptions: Record<string, { title: string; items: string }> = {
  A: { title: 'Nhân vật & Góc nhìn', items: 'A1-Đổi nhân vật, A2-Đổi POV, A3-Đổi bối cảnh' },
  B: { title: 'Source & Độ tin cậy', items: 'B1-Người thật, B2-Viral, B3-Hoạt hình, B4-Số liệu' },
  C: { title: 'Hook & Mở đầu', items: 'C1-Gây tranh cãi, C2-Câu hỏi, C3-Trending, C4-Số liệu sốc' },
  D: { title: 'Định dạng', items: 'D1-Story→Listicle, D2-Dài→Micro, D3-Monologue→Đối thoại' },
  E: { title: 'Kết quả & CTA', items: 'E1-Đổi outcome, E2-Đổi CTA' },
};

export default function PromptConfigPage() {
  const [systemPrompt] = useState(SYSTEM_PROMPT);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiModel, setAiModel] = useState<'claude' | 'gemini'>('claude');
  const [hasClaudeKey, setHasClaudeKey] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAiModel(data.data.ai_model);
          setHasClaudeKey(data.data.has_claude_key);
          setHasGeminiKey(data.data.has_gemini_key);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSaveModel(model: 'claude' | 'gemini') {
    setAiModel(model);
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ai_model: model }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMsg('Đã lưu');
        setTimeout(() => setSaveMsg(''), 2000);
      }
    } catch {
      setSaveMsg('Lỗi lưu');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Cấu hình AI & Prompt
        </h1>
        <p className="text-gray-500 text-sm mt-1">Chọn model AI và quản lý prompt hệ thống</p>
      </div>

      {/* AI Model Selection Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-emerald-50 text-emerald-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Model AI</h3>
              <p className="text-sm text-gray-500">
                Chọn model mặc định. Khi model chính lỗi, hệ thống tự động chuyển sang model còn lại.
              </p>
            </div>
            {saveMsg && (
              <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full animate-fade-in">
                {saveMsg}
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Claude Card */}
            <button
              onClick={() => handleSaveModel('claude')}
              disabled={saving}
              className={`text-left p-5 rounded-[14px] border-2 transition-all duration-200 relative ${
                aiModel === 'claude'
                  ? 'border-orange-400 bg-orange-50/60 shadow-md'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/30'
              }`}
            >
              {aiModel === 'claude' && (
                <div className="absolute right-3 top-3">
                  <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="text-2xl mb-2">🟠</div>
              <div className="font-bold text-sm text-gray-900 mb-0.5">Claude Opus 4</div>
              <p className="text-xs text-gray-500 mb-3">Anthropic — Model mạnh nhất cho content sáng tạo</p>
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium ${
                hasClaudeKey
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${hasClaudeKey ? 'bg-green-500' : 'bg-red-400'}`} />
                {hasClaudeKey ? 'API Key đã cấu hình' : 'Chưa có API Key'}
              </div>
            </button>

            {/* Gemini Card */}
            <button
              onClick={() => handleSaveModel('gemini')}
              disabled={saving}
              className={`text-left p-5 rounded-[14px] border-2 transition-all duration-200 relative ${
                aiModel === 'gemini'
                  ? 'border-blue-400 bg-blue-50/60 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              {aiModel === 'gemini' && (
                <div className="absolute right-3 top-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="text-2xl mb-2">🔵</div>
              <div className="font-bold text-sm text-gray-900 mb-0.5">Gemini 3.1 Pro Preview</div>
              <p className="text-xs text-gray-500 mb-3">Google — Model reasoning mạnh, 1M context</p>
              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium ${
                hasGeminiKey
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${hasGeminiKey ? 'bg-green-500' : 'bg-red-400'}`} />
                {hasGeminiKey ? 'API Key đã cấu hình' : 'Chưa có API Key'}
              </div>
            </button>
          </div>

          <div className="mt-4 p-3 bg-amber-50/80 rounded-[12px] border border-amber-200/40">
            <p className="text-xs text-amber-700">
              <span className="font-semibold">Fallback tự động:</span> Khi model chính bị lỗi (API key sai, rate limit, timeout...), hệ thống tự động chuyển sang model còn lại để đảm bảo không gián đoạn.
            </p>
          </div>
        </div>
      </div>

      {/* System Prompt Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-primary-50 text-primary-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">System Prompt</h3>
                <p className="text-sm text-gray-500">
                  Prompt hệ thống được sử dụng khi gọi Claude API để tạo biến thể.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-[10px] hover:bg-gray-50 transition-all duration-200"
            >
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
            </button>
          </div>
        </div>
        <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[2000px]' : 'max-h-64'}`}>
          <div className="relative">
            <div className="bg-gray-900 text-gray-100 p-5 text-sm whitespace-pre-wrap font-mono leading-relaxed overflow-auto">
              {systemPrompt}
            </div>
            {!isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none" />
            )}
          </div>
        </div>
        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
          <p className="text-xs text-gray-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            Để thay đổi prompt, sửa file <code className="px-1.5 py-0.5 bg-gray-200/80 rounded text-gray-600 text-[11px]">src/lib/ai/prompts.ts</code>
          </p>
        </div>
      </div>

      {/* Variation Types Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card mt-6 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-purple-50 text-purple-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">15 Kiểu biến thể</h3>
              <p className="text-sm text-gray-500">
                Danh sách kiểu biến thể được cấu hình tại <code className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 text-[11px]">src/lib/ai/variation-types.ts</code>
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {['A', 'B', 'C', 'D', 'E'].map((group) => {
              const colors = groupColors[group];
              const desc = groupDescriptions[group];
              return (
                <div
                  key={group}
                  className={`rounded-[12px] ${colors.bg} border-l-4 ${colors.border} p-4 hover:shadow-sm transition-all duration-200`}
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-[8px] bg-white/80 text-sm font-bold ${colors.text}`}>
                      {group}
                    </span>
                    <span className={`font-semibold text-sm ${colors.text}`}>
                      {desc.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 ml-10 leading-relaxed">
                    {desc.items}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
