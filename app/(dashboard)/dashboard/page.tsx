'use client';

import { useFootprintData } from '@/hooks/useFootprintData';
import { CarbonScoreGauge } from '@/components/charts/CarbonScoreGauge';
import { CategoryBreakdownChart } from '@/components/charts/CategoryBreakdownChart';
import { useRouter } from 'next/navigation';
import { Leaf, Target } from 'lucide-react';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants/emissionFactors';

export default function DashboardPage() {
  const { data, isLoading, error } = useFootprintData();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="Loading dashboard data"
        />
      </div>
    );
  }

  if (error || !data?.success || !data.data) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <p className="text-slate-600">Failed to load dashboard data. Please try again later.</p>
      </div>
    );
  }

  const { breakdown, score, goalKg } = data.data;

  const loadingState = isLoading && !data;
  const noData = !loadingState && !data?.success;

  if (loadingState) return <DashboardSkeleton />;
  if (noData) return <DashboardError />;

  return (
    <div className="space-y-6 pb-10">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full text-emerald-800 text-[10px] font-display font-black uppercase tracking-wider">
          <Leaf className="w-3.5 h-3.5" aria-hidden="true" />
          Carbon Dashboard
        </div>
        <h1 className="font-display text-2xl font-black text-slate-800 uppercase tracking-tight">
          Your Footprint Overview
        </h1>
        <p className="text-xs text-slate-600 font-sans font-semibold">
          Track your progress toward a lower carbon lifestyle.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CarbonScoreGauge score={score.percentage} total={score.monthly} goal={goalKg} />
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <h3 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">
                  Daily Average
                </p>
                <p className="font-display text-2xl font-black text-slate-900">
                  {score.daily.toFixed(1)}{' '}
                  <span className="text-sm font-mono text-slate-500">kg CO₂</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">
                  This Week
                </p>
                <p className="font-display text-2xl font-black text-slate-900">
                  {score.weekly.toFixed(1)}{' '}
                  <span className="text-sm font-mono text-slate-500">kg CO₂</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] font-display font-black text-slate-400 uppercase tracking-wider">
                  Monthly Goal
                </p>
                <p className="font-display text-2xl font-black text-slate-900">
                  {score.monthly.toFixed(0)}{' '}
                  <span className="text-sm font-mono text-slate-500">
                    / {goalKg} kg
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div
            className="mt-4 pt-4 border-t border-slate-100"
            role="meter"
            aria-valuenow={score.monthly}
            aria-valuemin={0}
            aria-valuemax={goalKg}
            aria-label={`Monthly progress: ${((score.monthly / goalKg) * 100).toFixed(0)}% of goal`}
          >
            <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 mb-1">
              <span>Progress</span>
              <span>{((score.monthly / goalKg) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-3 neumorph-inset rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (score.monthly / goalKg) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdownChart breakdown={breakdown} />

        <div className="glass-panel rounded-2xl p-6 shadow-md">
          <h3 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
            Top Categories
          </h3>
          <ul className="space-y-3 list-none p-0 m-0" role="list">
            {Object.entries(breakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([category, value]) => (
                <li key={category} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/50">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[category] ?? '#94a3b8' }}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {CATEGORY_LABELS[category] ?? category}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900">
                    {value.toFixed(1)} kg
                  </span>
                </li>
              ))}
          </ul>

          {score.percentage < 50 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs font-semibold text-amber-800">
                You&apos;re using more than half your monthly budget. Check your insights for
                reduction tips.
              </p>
            </div>
          )}

          {score.percentage >= 80 && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-xs font-semibold text-emerald-800">
                Great job! You&apos;re well within your monthly goal. Keep it up!
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 shadow-md">
        <h3 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/track')}
            className="p-4 bg-white/60 hover:bg-white border border-white/50 hover:border-emerald-300 rounded-xl text-left transition-all cursor-pointer"
          >
            <p className="text-xs font-bold text-slate-700">Log Today&apos;s Activity</p>
            <p className="text-[10px] text-slate-400 mt-1">Track your daily carbon impact</p>
          </button>
          <button
            onClick={() => router.push('/insights')}
            className="p-4 bg-white/60 hover:bg-white border border-white/50 hover:border-emerald-300 rounded-xl text-left transition-all cursor-pointer"
          >
            <p className="text-xs font-bold text-slate-700">Get AI Insights</p>
            <p className="text-[10px] text-slate-400 mt-1">Personalized reduction tips</p>
          </button>
          <button
            onClick={() => router.push('/actions')}
            className="p-4 bg-white/60 hover:bg-white border border-white/50 hover:border-emerald-300 rounded-xl text-left transition-all cursor-pointer"
          >
            <p className="text-xs font-bold text-slate-700">View Action Plan</p>
            <p className="text-[10px] text-slate-400 mt-1">Commit to reducing your footprint</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-10 animate-pulse">
      <div className="h-8 w-48 bg-slate-200 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-slate-200 rounded-2xl" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}

function DashboardError() {
  return (
    <div className="glass-panel rounded-2xl p-8 text-center">
      <p className="text-slate-600">Failed to load dashboard data. Please try again later.</p>
    </div>
  );
}
