'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function TeamSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  const isActive = pathname === '/team' || pathname.startsWith('/team/');

  return (
    <aside className="w-[260px] bg-white/70 backdrop-blur-xl border-r border-gray-200/60 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <Link href="/team" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-[14px] tracking-tight">Content Machine</div>
            <div className="text-[11px] text-emerald-600 font-semibold tracking-wide uppercase">Team MKT</div>
          </div>
        </Link>
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <Link
          href="/team"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 ${
            isActive
              ? 'bg-emerald-50 text-emerald-700 shadow-sm'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <span className={`flex-shrink-0 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </span>
          <span>Sản phẩm</span>
          {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        </Link>
      </nav>

      <div className="px-3 pb-4 space-y-0.5">
        <div className="mx-2 mb-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 w-full text-left transition-all"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
