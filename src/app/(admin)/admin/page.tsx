import Link from 'next/link';

const quickLinks = [
  {
    title: 'San pham',
    titleVi: 'Sản phẩm',
    description: 'Quan ly san pham va knowledge base',
    descriptionVi: 'Quản lý sản phẩm và knowledge base',
    href: '/admin/san-pham',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
    gradient: 'from-blue-500 to-indigo-500',
    iconBg: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Kich ban',
    titleVi: 'Kịch bản',
    description: 'Quan ly kich ban goc de nhan ban',
    descriptionVi: 'Quản lý kịch bản gốc để nhân bản',
    href: '/admin/kich-ban',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    gradient: 'from-purple-500 to-violet-500',
    iconBg: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'Dashboard',
    titleVi: 'Dashboard',
    description: 'Thong ke va bieu do tong quan',
    descriptionVi: 'Thống kê và biểu đồ tổng quan',
    href: '/admin/dashboard',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-50 text-emerald-600',
  },
];

export default function AdminHomePage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <p className="text-sm font-medium text-primary-400 tracking-wide uppercase mb-2">
          Lollibooks Admin
        </p>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-purple-500 bg-clip-text text-transparent">
          Chào mừng trở lại, Admin
        </h1>
        <p className="text-gray-500 mt-2 text-base">
          Quản lý hệ thống nhân bản nội dung của bạn từ đây.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group block bg-white/80 backdrop-blur-sm rounded-[16px] border border-white/60 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className={`h-1 bg-gradient-to-r ${link.gradient}`} />
            <div className="p-6">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-[12px] ${link.iconBg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {link.icon}
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1.5">{link.titleVi}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{link.descriptionVi}</p>
              <div className="mt-4 flex items-center text-sm font-medium text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Truy cập</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs text-gray-400 tracking-wider">
          Lollibooks Content Replication System
        </p>
      </div>
    </div>
  );
}
