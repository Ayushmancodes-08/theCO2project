import { LoggedActivity } from '../types';
import { Sparkles, Lightbulb, Footprints, Thermometer, ArrowRight, Leaf, Shield, Swords, Award } from 'lucide-react';
import ChibiAvatar from './ChibiAvatar';

interface DashboardOverviewProps {
  activities: LoggedActivity[];
  baselineAnnual: number;
  onNavigateToTab: (tab: 'tracker' | 'challenges' | 'insights' | 'trend') => void;
  streakDays?: number;
}

export default function DashboardOverview({
  activities,
  baselineAnnual,
  onNavigateToTab,
  streakDays = 12,
}: DashboardOverviewProps) {
  // Group emissions by categories to calculate dynamic breakdown
  const totals = activities.reduce(
    (acc, act) => {
      // Ignore negative values representing offset savings in totals breakdown for strict absolute display sums
      if (act.co2Impact > 0) {
        acc[act.category] = (acc[act.category] || 0) + act.co2Impact;
      }
      return acc;
    },
    { transport: 0, food: 0, energy: 0, purchases: 0 }
  );

  const totalSum = totals.transport + totals.food + totals.energy + totals.purchases;
  const currentAnnualTonnes = (totalSum / 30) * 365 / 1000;
  const displayAnnual = Math.max(1.2, currentAnnualTonnes > 0 ? parseFloat(currentAnnualTonnes.toFixed(1)) : baselineAnnual);

  // Compute Level and XP on-the-fly dynamically using activities registry!
  // Normal activities count as +15 XP. Completed challenges (negative CO2) count as +85 XP!
  let totalXp = 45; // base starting XP to have a headstart!
  activities.forEach(act => {
    if (act.co2Impact < 0) {
      totalXp += 85;
    } else {
      totalXp += 15;
    }
  });

  const playerLevel = Math.max(1, Math.floor(totalXp / 100) + 1);
  const nextLevelXpThreshold = 100;
  const currentLevelProgressXp = totalXp % nextLevelXpThreshold;

  // Percentages for Donut
  const transportPerc = totalSum > 0 ? Math.round((totals.transport / totalSum) * 100) : 35;
  const foodPerc = totalSum > 0 ? Math.round((totals.food / totalSum) * 100) : 28;
  const energyPerc = totalSum > 0 ? Math.round((totals.energy / totalSum) * 100) : 22;
  const purchasesPerc = totalSum > 0 ? Math.round((totals.purchases / totalSum) * 100) : 15;

  const dataset = [
    { label: 'Transport Mode', perc: transportPerc, color: '#3b82f6' }, // electric cyan blue
    { label: 'Food Fuel', perc: foodPerc, color: '#fbbf24' }, // warm gold sun
    { label: 'Castle Energy', perc: energyPerc, color: '#10b981' }, // cute moss green
    { label: 'Acquisitions', perc: purchasesPerc, color: '#a78bfa' }, // violet purple
  ];

  let accumulatedPercent = 0;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* RPG Top Grid Panel: Guardian Stats + High Level Metrics */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch select-none">
        
        {/* Left Side: Animated Guardian Chibi Card (LFP: spans 5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <ChibiAvatar level={playerLevel} footprint={displayAnnual} />
        </div>

        {/* Right Side: Player RPG Character Control Panel (spans 7 cols) */}
        <div className="lg:col-span-7 bg-white border-2 border-brand-border p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decoration lines in background */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Shield className="w-44 h-44 text-slate-800" />
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-display font-black text-emerald-600 uppercase tracking-widest block">SUMMONER PROFILE</span>
                <h3 className="font-display text-xl font-black text-slate-900 tracking-wide uppercase">PLAYER SCOREBOARD</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1 bg-amber-400 border-2 border-slate-800 text-slate-900 rounded font-display text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span>🔥 {streakDays}d Streak</span>
              </div>
            </div>

            {/* Level & XP Gauge */}
            <div className="p-4 bg-emerald-50/50 border-2 border-slate-200 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-xs font-display font-black text-emerald-800 uppercase tracking-wide">
                <span className="flex items-center gap-1">🏆 Guardian Level {playerLevel}</span>
                <span className="text-slate-500">{currentLevelProgressXp} / {nextLevelXpThreshold} XP</span>
              </div>
              
              <div className="h-4 bg-white border border-slate-300 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${(currentLevelProgressXp / nextLevelXpThreshold) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-emerald-700/80 font-sans italic">
                🎁 Complete ongoing Weekly Quests (+85 XP) and record logs (+15 XP) to level up!
              </p>
            </div>

            {/* Carbon Annual Footprint Box */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border-2 border-brand-border p-3.5 rounded-lg text-center shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]">
                <p className="font-display text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">ANNUAL TRACK CO₂</p>
                <p className="font-display text-3xl font-black text-slate-900 leading-none">
                  {displayAnnual.toFixed(1)}t
                </p>
                <p className="text-[9px] font-mono font-bold text-slate-400 mt-1">TONNES / YR</p>
              </div>

              <div className="bg-emerald-500 border-2 border-slate-800 p-3.5 rounded-lg text-center text-white shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]">
                <p className="font-display text-[9px] font-black uppercase tracking-wider text-emerald-100 mb-1">GAIA VALUE</p>
                <p className="font-display text-3xl font-black text-white leading-none">
                  {Math.max(12, Math.round(100 - (displayAnnual / 7.5) * 50))}%
                </p>
                <p className="text-[9px] font-mono font-bold text-emerald-200 mt-1">ALIGNMENT RATING</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-center gap-1">
            <span className="text-[11px] font-sans text-slate-500 leading-tight">
              Defeat the Smog Lord: keep annual impact below 2.5 tonnes!
            </span>
            <button 
              onClick={() => onNavigateToTab('trend')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-display font-black uppercase tracking-wider rounded border border-slate-800 flex items-center gap-1 cursor-pointer transition-transform duration-100 hover:translate-x-0.5"
            >
              Logs Trend <ArrowRight className="w-3 h-3 shrink-0" />
            </button>
          </div>

        </div>
      </section>

      {/* Comparison Metrics Gauge - Gamified styling */}
      <section className="bg-white border-2 border-brand-border p-5 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3.5 gap-2 select-none">
          <span className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-emerald-500" />
            Emissions Boss Battle Line
          </span>
          <p className="font-sans text-[11px] text-slate-600 font-medium">
            World Average: <span className="font-bold">4.7t</span> | Solarpunk Safe Point <span className="font-bold text-emerald-600">2.5t</span>
          </p>
        </div>

        <div className="relative w-full h-5 bg-slate-100 border-2 border-slate-800 rounded-full overflow-hidden p-0.5">
          {/* Target line (2.5t is 25%) */}
          <div className="absolute left-[25%] top-0 bottom-0 w-1 bg-emerald-500 z-10" title="Solar Energy Target: 2.5t" />
          {/* World Average line (4.7t is 47%) */}
          <div className="absolute left-[47%] top-0 bottom-0 w-1 bg-orange-400 z-10" title="Average Citizen: 4.7t" />
          
          {/* User's fills with a fun animated retro stripe gradient */}
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400 rounded-full transition-all duration-[1000ms] relative" 
            style={{ width: `${Math.max(10, Math.min(100, (displayAnnual / 10) * 100))}%` }} 
          >
            {/* Pulsing focal node on end of bar */}
            <span className="absolute right-0 top-0 w-3 h-full bg-white opacity-40 animate-pulse" />
          </div>
        </div>

        <div className="flex justify-between mt-2.5 font-display text-[8px] text-slate-500 uppercase tracking-widest font-black px-1">
          <span>0 Tonnes</span>
          <span className="text-emerald-600">Target safe Zone (2.5t)</span>
          <span className="text-orange-500">Global Avg (4.7t)</span>
          <span>Danger Zone (10.0t+)</span>
        </div>
      </section>

      {/* Bento Grid: Source Donut + Active summaries */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Bento: Donut Chart (spans 6 cols) */}
        <section className="md:col-span-6 bg-white border-2 border-brand-border p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] flex flex-col items-center justify-between select-none">
          <h3 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider self-start flex items-center gap-1.5 mb-4">
            <span className="p-1 bg-amber-100 text-amber-600 rounded">📊</span> Energy Leak Diagnosis
          </h3>

          <div className="relative w-40 h-40 my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {dataset.map((segment, idx) => {
                const strokeDasharray = `${segment.perc} 100`;
                const strokeDashoffset = -accumulatedPercent;
                accumulatedPercent += segment.perc;

                if (segment.perc <= 0) return null;

                return (
                  <circle
                    key={idx}
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="4"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-xl font-black text-slate-800 leading-none">Breakdown</span>
              <span className="font-display text-[9px] text-slate-400 tracking-widest font-bold mt-1">EMISSIONS</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 w-full border-t border-slate-100 pt-4 mt-4 text-left">
            {dataset.map((segment, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm shrink-0 border border-slate-800" style={{ backgroundColor: segment.color }} />
                <span className="font-sans text-[11px] font-bold text-slate-700 truncate">
                  {segment.label} ({segment.perc}%)
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Bento: Quests and AI advice columns (spans 6 cols) */}
        <div className="md:col-span-6 space-y-6 flex flex-col justify-between">
          
          {/* AI Advisor Bubble */}
          <section className="border-2 border-brand-border p-5 rounded-xl bg-white relative overflow-hidden flex items-start gap-4 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500" />
            
            <div className="bg-indigo-100 text-indigo-700 p-2 shrink-0 rounded border border-slate-800">
              <Lightbulb className="w-4 h-4" />
            </div>

            <div className="space-y-1 select-none">
              <h4 className="font-display text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 animate-spin-slow" />
                Forest Spirit Chibi Sage
              </h4>
              <p className="font-sans text-xs font-semibold text-slate-700 italic leading-relaxed">
                "Hark! Switching to a grain-heavy organic menu just twice this week keeps the soil healthy and secures 15% lower diet emissions!"
              </p>
            </div>
          </section>

          {/* Core Urgent quests lists */}
          <section className="bg-white border-2 border-brand-border p-5 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] flex-grow">
            <h3 className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3.5 flex items-center gap-1">
              <span className="p-0.5 bg-emerald-100 text-emerald-600 rounded">⚔️</span> Daily Active Skirmishes
            </h3>

            <ul className="space-y-2">
              <li 
                onClick={() => onNavigateToTab('tracker')}
                className="flex justify-between items-center p-3 border-2 border-transparent hover:border-slate-800 bg-slate-50 hover:bg-white rounded-lg cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <Footprints className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-sans text-xs font-bold text-slate-800">Commute via active biking</span>
                </div>
                <span className="font-display text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 py-1 px-2 rounded-full uppercase shrink-0">
                  +12 XP
                </span>
              </li>

              <li 
                onClick={() => onNavigateToTab('challenges')}
                className="flex justify-between items-center p-3 border-2 border-transparent hover:border-slate-800 bg-slate-50 hover:bg-white rounded-lg cursor-pointer transition-all active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <Thermometer className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-sans text-xs font-bold text-slate-800">Complete Weekly Quest</span>
                </div>
                <span className="font-display text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300 py-1 px-2 rounded-full uppercase shrink-0">
                  +85 XP
                </span>
              </li>
            </ul>
          </section>

          {/* Dynamic Interactive Solarpunk Canvas backdrop */}
          <div className="bg-gradient-to-r from-emerald-100 to-indigo-100 border-2 border-brand-border p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] flex items-center justify-between relative overflow-hidden select-none">
            {/* Custom stylized mini mountain wind vectors using Tailwind */}
            <div className="flex flex-col space-y-0.5">
              <span className="font-display text-[10px] font-black uppercase tracking-widest text-slate-600">Solarpunk Kingdom</span>
              <p className="font-display text-xs font-black text-emerald-800">Clean Air Awakened!</p>
            </div>
            <div className="flex gap-1.5 text-2xl">
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🏠</span>
              <span className="animate-float">☀️</span>
              <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>🍃</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
