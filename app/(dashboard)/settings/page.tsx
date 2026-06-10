'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, Save, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [goal, setGoal] = useState('200');
  const [saved, setSaved] = useState(false);

  const handleSaveGoal = useCallback(async () => {
    try {
      const res = await fetch('/api/footprint/goal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalKg: parseFloat(goal) }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // silently fail
    }
  }, [goal]);

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-800 text-[10px] font-display font-black uppercase tracking-wider">
          <Settings className="w-3.5 h-3.5" aria-hidden="true" />
          Settings
        </div>
        <h1 className="font-display text-2xl font-black text-slate-800 uppercase tracking-tight">
          Account Settings
        </h1>
      </header>

      <div className="glass-panel rounded-2xl p-6 shadow-md space-y-6">
        <div>
          <h2 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Name</label>
              <p className="text-sm font-bold text-slate-900">
                {session?.user?.name ?? 'Not set'}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Email</label>
              <p className="text-sm font-bold text-slate-900">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
            Carbon Goal
          </h2>
          <div className="flex items-end gap-4">
            <div className="flex-grow">
              <label
                htmlFor="monthly-goal"
                className="text-xs font-bold text-slate-600 block mb-2"
              >
                Monthly Carbon Budget (kg CO₂)
              </label>
              <input
                type="number"
                id="monthly-goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                min={50}
                max={2000}
                className="w-full neumorph-inset px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800"
              />
            </div>
            <button
              onClick={handleSaveGoal}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              Save
            </button>
          </div>
          {saved && (
            <p className="text-emerald-600 text-xs font-bold mt-2" role="status" aria-live="polite">
              Goal saved successfully!
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
            Account Actions
          </h2>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-6 py-3 rounded-xl text-sm transition-all border border-red-200"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
