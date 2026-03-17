import TeamSidebar from '@/components/team/Sidebar';

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <TeamSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
