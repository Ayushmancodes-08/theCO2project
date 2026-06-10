'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Brain, Target } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'track', label: 'Track', icon: FileText, href: '/track' },
  { id: 'insights', label: 'Insights', icon: Brain, href: '/insights' },
  { id: 'actions', label: 'Actions', icon: Target, href: '/actions' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-20 bg-white/70 backdrop-blur-md border-t border-white/30 px-2 select-none shadow-lg"
      aria-label="Mobile navigation"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            className={`flex flex-col items-center justify-center w-20 h-full select-none transition-transform active:scale-95 ${
              isActive
                ? 'text-emerald-600 border-t-4 border-emerald-500 font-black'
                : 'text-slate-500 hover:text-emerald-500 pt-1 font-semibold'
            }`}
          >
            <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="font-display text-[9px] uppercase tracking-wider mt-1.5">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
