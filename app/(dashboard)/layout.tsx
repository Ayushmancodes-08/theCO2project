'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { MobileNav } from '@/components/shared/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen text-[#0f172a] antialiased flex flex-col relative overflow-x-hidden">
      <header
        className="lg:hidden fixed top-0 w-full z-40 bg-white/70 backdrop-blur-md border-b border-white/30 h-16 flex justify-between items-center px-4 select-none"
        role="banner"
      >
        <span className="font-display text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 pt-1">
          <span aria-hidden="true">🌱</span> CarbonSense
        </span>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full bg-emerald-500 border border-emerald-400 flex items-center justify-center text-white text-xs select-none font-black font-mono shadow-sm"
            aria-label={session.user?.name ?? session.user?.email ?? 'User'}
          >
            {(session.user?.name ?? 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl w-full mx-auto pt-16 lg:pt-0 pb-20 lg:pb-0 h-full">
        <Sidebar />

        <main
          id="main-content"
          className="flex-grow px-4 md:px-8 pt-6 lg:pt-8 pb-10 max-w-full overflow-hidden"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
