import { useState, useMemo, useCallback, useId } from 'react';
import type { LoggedActivity, ActivityCategory } from '../types';
import { TrendingDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DayData {
  dateStr:     string;
  displayDate: string;
  total:       number;
  transport:   number;
  food:        number;
  energy:      number;
  purchases:   number;
}

interface CategoryMeta {
  id:       ActivityCategory;
  label:    string;
  color:    string;
  bgClass:  string;
}

interface ProgressTrendProps {
  activities:       LoggedActivity[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META: CategoryMeta[] = [
  { id: 'transport', label: 'Commute & Travel',   color: '#3b82f6', bgClass: 'bg-[#3b82f6]' },
  { id: 'food',      label: 'Dietary Consumption', color: '#fbbf24', bgClass: 'bg-[#fbbf24]' },
  { id: 'energy',    label: 'Home Energy',          color: '#10b981', bgClass: 'bg-[#10b981]' },
  { id: 'purchases', label: 'Material Purchases',  color: '#a78bfa', bgClass: 'bg-[#a78bfa]' },
];

const SVG_WIDTH  = 1000;
const SVG_HEIGHT = 200;
const GRAPH_H    = 180; // usable graph height (leaving top padding)
const DAYS       = 30;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildLast30Days(activities: LoggedActivity[]): DayData[] {
  const now = new Date();
  return Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (DAYS - 1 - i));
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const dayActs = activities.filter((a) => a.date === dateStr);
    const transport = dayActs.filter((a) => a.category === 'transport').reduce((s, a) => s + a.co2Impact, 0);
    const food      = dayActs.filter((a) => a.category === 'food').reduce((s, a) => s + a.co2Impact, 0);
    const energy    = dayActs.filter((a) => a.category === 'energy').reduce((s, a) => s + a.co2Impact, 0);
    const purchases = dayActs.filter((a) => a.category === 'purchases').reduce((s, a) => s + a.co2Impact, 0);

    return { dateStr, displayDate, total: Math.max(0, transport + food + energy + purchases), transport, food, energy, purchases };
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProgressTrend({ activities }: ProgressTrendProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartId = useId();

  // Memoised heavy computations
  const last30Days = useMemo(() => buildLast30Days(activities), [activities]);

  const maxEmissions = useMemo(
    () => Math.max(...last30Days.map((d) => d.total), 12),
    [last30Days]
  );

  const categoryTotals = useMemo(() =>
    activities.reduce(
      (acc, act) => {
        if (act.co2Impact > 0) acc[act.category] = (acc[act.category] ?? 0) + act.co2Impact;
        return acc;
      },
      { transport: 0, food: 0, energy: 0, purchases: 0 } as Record<ActivityCategory, number>
    ),
    [activities]
  );

  const grandTotal = useMemo(() =>
    categoryTotals.transport + categoryTotals.food + categoryTotals.energy + categoryTotals.purchases,
    [categoryTotals]
  );

  // SVG point computations (memoised)
  const points = useMemo(() => {
    const stepX = SVG_WIDTH / (DAYS - 1);
    return last30Days.map((day, idx) => ({
      x:   idx * stepX,
      y:   GRAPH_H - (day.total / maxEmissions) * (GRAPH_H - 20),
      day,
    }));
  }, [last30Days, maxEmissions]);

  const linePath  = useMemo(() => points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '), [points]);
  const areaPath  = useMemo(() => `0,${GRAPH_H} ${linePath} ${SVG_WIDTH},${GRAPH_H}`, [linePath]);

  const handleMouseEnter = useCallback((idx: number) => setHoverIndex(idx), []);
  const handleMouseLeave = useCallback(() => setHoverIndex(null), []);
  const handleFocus      = useCallback((idx: number) => setHoverIndex(idx), []);
  const handleBlur       = useCallback(() => setHoverIndex(null), []);

  // Accessible table summary for the chart
  const chartSummaryId = `${chartId}-summary`;

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* 30-day Trend Graph */}
      <section aria-labelledby="trend-heading" className="glass-panel p-5 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <h2
              id="trend-heading"
              className="font-display text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide"
            >
              <TrendingDown className="w-5 h-5 text-emerald-500" aria-hidden="true" />
              30-Day Emission Trend
            </h2>
            <p className="text-xs text-slate-500 font-sans font-semibold mt-0.5">
              Daily CO₂ emissions (kg) over the last 30 days.
            </p>
          </div>

          {/* Legend */}
          <ul
            className="flex flex-wrap items-center gap-3 text-[9px] font-display uppercase tracking-widest font-black text-slate-500 list-none p-0 m-0"
            aria-label="Chart legend"
          >
            {CATEGORY_META.map((cat) => (
              <li key={cat.id} className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full border border-white/40 ${cat.bgClass}`}
                  aria-hidden="true"
                />
                {cat.label}
              </li>
            ))}
          </ul>
        </div>

        {/* SVG Chart */}
        <div
          className="relative py-2 bg-white/40 border border-white/50 rounded-xl p-3 shadow-inner"
          role="img"
          aria-labelledby={chartSummaryId}
        >
          <p id={chartSummaryId} className="sr-only">
            Line chart showing daily CO₂ emissions for the last 30 days.
            The maximum daily emission was {maxEmissions.toFixed(1)} kg.
            Total over period: {grandTotal.toFixed(1)} kg.
            Hover or focus a data point to see the breakdown.
          </p>

          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            className="w-full h-[180px] overflow-visible"
            aria-hidden="true"
          >
            <title>30-day CO₂ emissions trend line chart</title>
            {/* Grid lines */}
            <line x1="0" y1="30"  x2={SVG_WIDTH} y2="30"  stroke="rgba(15,23,42,0.08)" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="0" y1="105" x2={SVG_WIDTH} y2="105" stroke="rgba(15,23,42,0.08)" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="0" y1={GRAPH_H} x2={SVG_WIDTH} y2={GRAPH_H} stroke="rgba(15,23,42,0.3)" strokeWidth="1.5" />

            {/* Area fill */}
            <polygon points={areaPath} fill="rgba(16,185,129,0.1)" />

            {/* Trend line */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={linePath}
            />

            {/* Data points (keyboard + mouse interactive) */}
            {points.map((p, idx) => (
              <g
                key={idx}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleFocus(idx)}
                onBlur={handleBlur}
                onClick={() => handleFocus(idx)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`${p.day.displayDate}: ${p.day.total.toFixed(1)} kg CO₂`}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFocus(idx); }}
              >
                {/* Large transparent hit-area for easier mouse/touch targeting */}
                <rect x={Math.max(0, p.x - 15)} y="0" width="30" height={GRAPH_H} fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoverIndex === idx ? 7 : 4}
                  className={`transition-all duration-75 ${
                    hoverIndex === idx ? 'fill-amber-400 stroke-slate-900 stroke-2' : 'fill-slate-800'
                  }`}
                />
              </g>
            ))}
          </svg>

          {/* Hover tooltip (visual only — aria-hidden; screen readers get the button label above) */}
          {hoverIndex !== null && (
            <div
              aria-hidden="true"
              className="absolute z-10 bg-slate-900/95 backdrop-blur-md text-white rounded-xl p-3.5 text-[11px] font-mono border border-white/10 space-y-1.5 pointer-events-none shadow-xl"
              style={{
                left:   `${(hoverIndex / (DAYS - 1)) * 76 + 6}%`,
                bottom: '110px',
              }}
            >
              <div className="font-bold border-b border-white/10 pb-1 flex justify-between gap-4 text-emerald-400">
                <span>{last30Days[hoverIndex].displayDate}</span>
                <span>{last30Days[hoverIndex].total.toFixed(1)} kg</span>
              </div>
              <div className="text-[10px] text-slate-300 space-y-0.5">
                {CATEGORY_META.map((cat) => (
                  <div key={cat.id} className="flex justify-between gap-4">
                    <span>{cat.label}:</span>
                    <span className="text-white font-bold">
                      {Number(last30Days[hoverIndex]?.[cat.id] || 0).toFixed(1)} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* X-axis labels */}
        <div
          className="flex justify-between text-[10px] font-display font-black uppercase tracking-widest text-[#064e3b] border-t border-slate-200/50 pt-3.5 px-1 mt-1"
          aria-hidden="true"
        >
          <span>{last30Days[0]?.displayDate} (30 days ago)</span>
          <span>Mid-period</span>
          <span>Today ({last30Days[DAYS - 1]?.displayDate})</span>
        </div>
      </section>

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Category proportions */}
        <section aria-labelledby="breakdown-heading" className="glass-panel p-5 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-display font-black text-slate-400 uppercase tracking-widest">
              Emissions Breakdown
            </span>
            <h3
              id="breakdown-heading"
              className="font-display text-base font-black text-slate-800 uppercase mt-0.5"
            >
              Category Shares
            </h3>
            <p className="text-xs text-slate-500 font-sans font-semibold mt-1">
              Distribution from {grandTotal.toFixed(1)} kg CO₂ logged.
            </p>
          </div>

          <ul className="py-4 space-y-3 list-none p-0 m-0" role="list">
            {CATEGORY_META.map((cat) => {
              const emissions = categoryTotals[cat.id] ?? 0;
              const perc = grandTotal > 0 ? (emissions / grandTotal) * 100 : 0;
              return (
                <li key={cat.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700 uppercase">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-full border border-white/50 ${cat.bgClass}`} aria-hidden="true" />
                      {cat.label}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {perc.toFixed(0)}% ({emissions.toFixed(1)} kg)
                    </span>
                  </div>
                  <div
                    className="w-full neumorph-inset h-3.5 rounded-full overflow-hidden p-0.5"
                    role="meter"
                    aria-valuenow={perc}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cat.label}: ${perc.toFixed(0)}% of total emissions`}
                  >
                    <div
                      className={`${cat.bgClass} h-full rounded-full transition-all duration-300`}
                      style={{ width: `${perc}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Global comparison */}
        <section
          aria-labelledby="comparison-heading"
          className="glass-panel rounded-2xl p-5 shadow-md flex flex-col justify-between bg-amber-50/20 border-amber-200"
        >
          <div className="space-y-2">
            <span className="font-display text-[9px] font-black text-amber-800 uppercase tracking-widest block">
              <span aria-hidden="true">🛡️</span> World Comparison
            </span>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-semibold">
              To meet Paris Accord targets, per-capita emissions must fall below{' '}
              <strong className="text-emerald-600">2.0 Tonnes / Year</strong> by 2030.
            </p>
          </div>

          <div className="p-4 bg-white/70 border border-white/60 rounded-xl mt-4 space-y-3 shadow-xs">
            <h3
              id="comparison-heading"
              className="text-[9px] font-display font-black text-slate-400 uppercase tracking-widest block"
            >
              Annual Impact Per Capita (Tonnes/yr)
            </h3>
            <ul className="space-y-2.5 text-xs font-bold text-slate-600 list-none p-0 m-0" role="list">
              <li className="flex justify-between items-center">
                <span>🇺🇸 United States avg.:</span>
                <span className="font-mono font-black text-rose-500">14.7 T</span>
              </li>
              <li className="flex justify-between items-center">
                <span>🇪🇺 European Union avg.:</span>
                <span className="font-mono font-black text-amber-500">6.1 T</span>
              </li>
              <li className="flex justify-between items-center text-emerald-600 font-black bg-emerald-50/50 py-2.5 px-3 rounded-lg border border-emerald-100">
                <span>🌱 Your current score:</span>
                <span className="font-mono">
                  {((grandTotal * 12) / 1000).toFixed(1)} T
                </span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
