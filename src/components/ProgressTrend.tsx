import { useState } from 'react';
import { LoggedActivity } from '../types';
import { Trash2, TrendingDown, Calendar, Swords, Shield } from 'lucide-react';

interface ProgressTrendProps {
  activities: LoggedActivity[];
  onDeleteActivity: (id: string) => void;
}

export default function ProgressTrend({ activities, onDeleteActivity }: ProgressTrendProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Group activities by the last 30 days.
  const last30Days: { dateStr: string; displayDate: string; total: number; transport: number; food: number; energy: number; purchases: number }[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    // Short label, e.g. "Jun 08"
    const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Filter logs matching this day
    const dayActivities = activities.filter((act) => act.date === dateStr);

    const transport = dayActivities.filter((a) => a.category === 'transport').reduce((sum, a) => sum + a.co2Impact, 0);
    const food = dayActivities.filter((a) => a.category === 'food').reduce((sum, a) => sum + a.co2Impact, 0);
    const energy = dayActivities.filter((a) => a.category === 'energy').reduce((sum, a) => sum + a.co2Impact, 0);
    const purchases = dayActivities.filter((a) => a.category === 'purchases').reduce((sum, a) => sum + a.co2Impact, 0);

    // Filter offsets/negative values algebraically
    const total = transport + food + energy + purchases;

    last30Days.push({
      dateStr,
      displayDate,
      total: Math.max(0, total),
      transport,
      food,
      energy,
      purchases,
    });
  }

  const maxEmissions = Math.max(...last30Days.map((d) => d.total), 12); // minimum peak threshold at 12

  // Category Colors
  const catColors = {
    transport: 'bg-[#3b82f6]', // sky blue
    food: 'bg-[#fbbf24]', // gold sun
    energy: 'bg-[#10b981]', // emerald green
    purchases: 'bg-[#a78bfa]', // violet purple
  };

  const categoryTotals = activities.reduce(
    (acc, act) => {
      if (act.co2Impact > 0) {
        acc[act.category] = (acc[act.category] || 0) + act.co2Impact;
      }
      return acc;
    },
    { transport: 0, food: 0, energy: 0, purchases: 0 }
  );

  const grandTotal = categoryTotals.transport + categoryTotals.food + categoryTotals.energy + categoryTotals.purchases;

  // Custom SVG path computations
  const paddingX = 1000 / 29;
  const points = last30Days.map((day, idx) => {
    const x = idx * paddingX;
    const y = 180 - (day.total / maxEmissions) * 150;
    return { x, y, day };
  });

  const linePath = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath = `0,180 ${linePath} 1000,180`;

  return (
    <div className="space-y-6 animate-fade-in pb-10 select-none">
      
      {/* 30-day Trend Graph Card */}
      <div className="bg-white border-2 border-brand-border p-5 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-display text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
              30-Day Historical Leash
            </h2>
            <p className="text-xs text-slate-500 font-sans font-semibold mt-0.5">
              Defending nature leylines: continuous tracking of daily emissions indexed in carbon weights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[9px] font-display uppercase tracking-widest font-black select-none text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] border border-slate-900" /> Transits
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] border border-slate-900" /> Food fuel
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] border border-slate-900" /> Energies
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a78bfa] border border-slate-900" /> Gears
            </span>
          </div>
        </div>

        {/* Custom High-Contrast SVG Line Graph */}
        <div className="relative py-2 bg-slate-50 border-2 border-slate-800 rounded-lg p-3">
          <svg viewBox="0 0 1000 200" className="w-full h-[180px] overflow-visible">
            {/* Horizontal Grid lines */}
            <line x1="0" y1="30" x2="1000" y2="30" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="0" y1="105" x2="1000" y2="105" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 6" />
            <line x1="0" y1="180" x2="1000" y2="180" stroke="#1e293b" strokeWidth="2" />

            {/* Area gradient path under curve */}
            <polygon
              points={areaPath}
              className="fill-emerald-400/10 text-emerald-400/10"
              style={{ opacity: 0.6 }}
            />

            {/* Main high-density curve line */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={linePath}
            />

            {/* Interactive hover overlays */}
            {points.map((p, idx) => (
              <g
                key={idx}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-pointer"
              >
                <rect
                  x={Math.max(0, p.x - 15)}
                  y="0"
                  width="30"
                  height="180"
                  fill="transparent"
                />

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoverIndex === idx ? '7' : '4'}
                  className={`transition-all duration-75 ${
                    hoverIndex === idx ? 'fill-amber-400 stroke-slate-900 stroke-2' : 'fill-slate-900 stroke-none'
                  }`}
                />
              </g>
            ))}
          </svg>

          {/* Absolute Hover Tooltip */}
          {hoverIndex !== null && (
            <div
              className="absolute z-10 bg-slate-900 text-white rounded-lg p-3.5 text-[11px] font-mono border-2 border-slate-950 space-y-1.5 pointer-events-none transition-transform duration-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              style={{
                left: `${(hoverIndex / 29) * 76 + 6}%`,
                bottom: '110px',
              }}
            >
              <div className="font-bold border-b border-white/20 pb-1 flex justify-between gap-4 text-emerald-400">
                <span>{last30Days[hoverIndex].displayDate}</span>
                <span className="font-extrabold">{last30Days[hoverIndex].total.toFixed(1)} kg</span>
              </div>
              <div className="text-[10px] text-slate-300 space-y-0.5">
                <div className="flex justify-between gap-4">
                  <span>🚗 Transport:</span>
                  <span className="text-white font-bold">{last30Days[hoverIndex].transport.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>🍛 Diet Fuel:</span>
                  <span className="text-white font-bold">{last30Days[hoverIndex].food.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>🎛️ Utilities:</span>
                  <span className="text-white font-bold">{last30Days[hoverIndex].energy.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>🛍️ Gears Bought:</span>
                  <span className="text-white font-bold">{last30Days[hoverIndex].purchases.toFixed(1)} kg</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* X-Axis labels */}
        <div className="flex justify-between text-[10px] font-display font-black uppercase tracking-widest text-[#064e3b] border-t-2 border-slate-100 pt-3.5 px-1 mt-1">
          <span>{last30Days[0].displayDate} (Past Realm)</span>
          <span>Mid Month</span>
          <span>Today ({last30Days[29].displayDate})</span>
        </div>
      </div>

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Proportional bars */}
        <div className="bg-white border-2 border-brand-border p-5 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-display font-black text-slate-400 uppercase tracking-widest">EMISSIONS CONCENTRATION</span>
            <h3 className="font-display text-base font-black text-slate-800 uppercase mt-0.5">Categorical Spells Shares</h3>
            <p className="text-xs text-slate-500 font-sans font-semibold mt-1">
              Distribution ratio of all recorded ledger metrics totaling {grandTotal.toFixed(1)} kg CO₂ equivalents.
            </p>
          </div>

          <div className="py-4 space-y-3">
            {[
              { id: 'transport', label: 'Commute Portal Travel', emissions: categoryTotals.transport, color: 'bg-[#3b82f6]' },
              { id: 'food', label: 'Dietary Consumables', emissions: categoryTotals.food, color: 'bg-[#fbbf24]' },
              { id: 'energy', label: 'Guild Power Core', emissions: categoryTotals.energy, color: 'bg-[#10b981]' },
              { id: 'purchases', label: 'Material Deliveries', emissions: categoryTotals.purchases, color: 'bg-[#a78bfa]' },
            ].map((cat) => {
              const perc = grandTotal > 0 ? (cat.emissions / grandTotal) * 100 : 0;
              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-800 uppercase">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 rounded-sm border border-slate-900 ${cat.color}`} />
                      {cat.label}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {perc.toFixed(0)}% ({cat.emissions.toFixed(1)} kg)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 border-2 border-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
                    <div className={`${cat.color} h-full rounded-full transition-all duration-300`} style={{ width: `${perc}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global comparisons */}
        <div className="bg-amber-50/50 border-2 border-brand-border rounded-xl p-5 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] flex flex-col justify-between">
          <div className="space-y-2">
            <span className="font-display text-[9px] font-black text-amber-800 uppercase tracking-widest block">
              🛡️ COMPANION WORLD STATISTICS
            </span>
            <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
              To hold temperatures within reasonable boundaries (Paris Accord guidelines), active planetary per capita output metrics must settle under <strong className="text-emerald-600 font-bold">2.0 Tonnes / Year</strong> by 2030. Let's inspect other nations:
            </p>
          </div>

          <div className="p-4 bg-white border-2 border-slate-800 rounded-lg mt-4 space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="text-[9px] font-display font-black text-slate-400 uppercase tracking-widest block">
              Average Annual Impact Per Capita (Tonnes/yr)
            </span>
            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <div className="flex justify-between items-center">
                <span>🇺🇸 United States Average:</span>
                <span className="font-mono font-black text-red-500">14.7 T</span>
              </div>
              <div className="flex justify-between items-center">
                <span>🇪🇺 European Union Average:</span>
                <span className="font-mono font-black text-orange-400">6.1 T</span>
              </div>
              <div className="flex justify-between items-center text-emerald-600 font-black bg-emerald-50 py-2 pin px-2.5 rounded border border-emerald-200">
                <span className="flex items-center gap-1">🌱 Your Current Score:</span>
                <span className="font-mono">
                  {((grandTotal * 12) / 1000).toFixed(1)} T
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
