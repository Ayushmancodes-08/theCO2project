'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  Leaf,
  LayoutDashboard,
  FileText,
  Brain,
  Target,
  Trophy,
  Settings,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'track', label: 'Track Activity', icon: FileText, href: '/track' },
  { id: 'insights', label: 'Insights', icon: Brain, href: '/insights' },
  { id: 'actions', label: 'Actions', icon: Target, href: '/actions' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, href: '/leaderboard' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 hidden lg:flex flex-col sticky top-0 left-0 border-r border-white/30 p-6 h-screen select-none justify-between bg-white/45 backdrop-blur-md z-20"
      aria-label="Site navigation"
    >
      <div className="space-y-8">
        <div className="pt-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-500" aria-hidden="true" />
            <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight uppercase">
              CarbonSense
            </h1>
          </Link>
          <p className="text-emerald-700 font-display text-[9px] font-black uppercase tracking-widest mt-1 bg-emerald-50/70 border border-emerald-200/50 py-1 px-2.5 rounded-full w-fit">
            Track. Understand. Reduce.
          </p>
        </div>

        <nav aria-label="Main navigation">
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-display font-black uppercase tracking-wider transition-all rounded-xl border ${
                      isActive
                        ? 'bg-slate-900 border-slate-950 text-white shadow-md'
                        : 'text-slate-600 border-transparent hover:bg-white/50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/20">
        <Link
          href="/track"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-400 font-display text-[10px] font-black py-3.5 uppercase tracking-wider rounded-xl shadow-md cursor-pointer text-center transition-colors block"
          aria-label="Log a new activity"
        >
          Log Activity ⚡
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full border border-white/30 hover:bg-red-50/50 text-slate-500 hover:text-red-600 font-display text-[9px] font-black py-2.5 uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          aria-label="Sign out"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
