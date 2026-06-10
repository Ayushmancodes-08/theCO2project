'use client';

import type { CategoryBreakdown } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants/emissionFactors';

interface CategoryBreakdownChartProps {
  breakdown: CategoryBreakdown;
}

export function CategoryBreakdownChart({ breakdown }: CategoryBreakdownChartProps) {
  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <div className="glass-panel rounded-2xl p-6 shadow-md">
        <h3 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
          Emissions Breakdown
        </h3>
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-semibold">
          No data yet. Start logging activities to see your breakdown.
        </div>
      </div>
    );
  }

  return (
    <div
      className="glass-panel rounded-2xl p-6 shadow-md"
      aria-label={`Emissions breakdown chart. Total: ${total.toFixed(1)} kg CO₂`}
    >
      <h3 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
        Emissions Breakdown
      </h3>

      <div className="relative w-48 h-48 mx-auto">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <title>Category breakdown donut chart</title>
          {(() => {
            const entries = Object.entries(breakdown).filter(([, v]) => v > 0);
            let offset = 0;
            return entries.map(([category, value]) => {
              const percentage = (value / total) * 100;
              if (percentage <= 0) return null;
              const segment = (
                <circle
                  key={category}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke={CATEGORY_COLORS[category] ?? '#94a3b8'}
                  strokeWidth="4.5"
                  strokeDasharray={`${percentage} 100`}
                  strokeDashoffset={offset}
                  className="transition-all duration-700"
                  strokeLinecap="round"
                  aria-label={`${CATEGORY_LABELS[category] ?? category}: ${percentage.toFixed(0)}%`}
                />
              );
              offset -= percentage;
              return segment;
            });
          })()}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
          <span className="font-display text-xl font-black text-slate-800 leading-none">
            {total.toFixed(0)}
          </span>
          <span className="font-display text-[9px] text-slate-400 tracking-widest font-black mt-1">
            KG CO₂
          </span>
        </div>
      </div>

      <ul className="mt-6 space-y-2 list-none p-0 m-0" role="list" aria-label="Category breakdown">
        {Object.entries(breakdown)
          .filter(([, v]) => v > 0)
          .sort(([, a], [, b]) => b - a)
          .map(([category, value]) => {
            const percent = (value / total) * 100;
            return (
              <li key={category} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_COLORS[category] ?? '#94a3b8' }}
                  aria-hidden="true"
                />
                <div className="flex-grow">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{CATEGORY_LABELS[category] ?? category}</span>
                    <span className="font-mono">{percent.toFixed(0)}%</span>
                  </div>
                  <div
                    className="h-2 neumorph-inset rounded-full overflow-hidden mt-1 p-0.5"
                    role="meter"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${CATEGORY_LABELS[category] ?? category}: ${percent.toFixed(0)}%`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: CATEGORY_COLORS[category] ?? '#94a3b8',
                      }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 w-16 text-right">
                  {value.toFixed(1)} kg
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
