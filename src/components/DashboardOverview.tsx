import { useState, useEffect } from 'react';
import { LoggedActivity } from '../types';
import { Sparkles, Lightbulb, Footprints, Thermometer, ArrowRight, Shield, Swords, Heart, Zap } from 'lucide-react';
import ChibiAvatar from './ChibiAvatar';
import { sfx } from '../utils/audio';

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
  const [bossShake, setBossShake] = useState(false);
  const [slashEffect, setSlashEffect] = useState(false);

  // Group emissions by categories
  const totals = activities.reduce(
    (acc, act) => {
      if (act.co2Impact > 0) {
        acc[act.category] = (acc[act.category] || 0) + act.co2Impact;
      }
      return acc;
    },
    { transport: 0, food: 0, energy: 0, purchases: 0 }
  );

  const totalSum = totals.transport + totals.food + totals.energy + totals.purchases;
  
  // Calculate completed quest offsets
  const totalOffset = activities
    .filter(act => act.co2Impact < 0)
    .reduce((sum, act) => sum + Math.abs(act.co2Impact), 0);

  const currentAnnualTonnes = (totalSum / 30) * 365 / 1000;
  const displayAnnual = Math.max(1.2, currentAnnualTonnes > 0 ? parseFloat(currentAnnualTonnes.toFixed(1)) : baselineAnnual);

  // Compute Level and XP
  let totalXp = 45;
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

  // Boss Battle Stats
  const maxBossHp = 600;
  // Dynamic calculation: emissions heal boss, offset mitigation damages it
  const baseHp = 300;
  const emissionsHeal = Math.round(totalSum * 0.8);
  const mitigationDamage = Math.round(totalOffset * 15);
  const bossHp = Math.max(0, Math.min(maxBossHp, baseHp + emissionsHeal - mitigationDamage));
  const bossHpPercent = Math.round((bossHp / maxBossHp) * 100);

  // Trigger attack effect when offset changes or manually clicked
  const handleAttackBoss = () => {
    sfx.playLevelUpSfx();
    setBossShake(true);
    setSlashEffect(true);
    setTimeout(() => {
      setBossShake(false);
      setSlashEffect(false);
    }, 400);
  };

  // Percentages for Donut
  const transportPerc = totalSum > 0 ? Math.round((totals.transport / totalSum) * 100) : 35;
  const foodPerc = totalSum > 0 ? Math.round((totals.food / totalSum) * 100) : 28;
  const energyPerc = totalSum > 0 ? Math.round((totals.energy / totalSum) * 100) : 22;
  const purchasesPerc = totalSum > 0 ? Math.round((totals.purchases / totalSum) * 100) : 15;

  const dataset = [
    { label: 'Transport', perc: transportPerc, color: '#3b82f6' },
    { label: 'Food Fuel', perc: foodPerc, color: '#fbbf24' },
    { label: 'Energy', perc: energyPerc, color: '#10b981' },
    { label: 'Acquisitions', perc: purchasesPerc, color: '#a78bfa' },
  ];

  let accumulatedPercent = 0;

  // Solarpunk Garden Grid Items Creator based on level
  const renderGardenItems = () => {
    const gardenItems: { icon: string; name: string }[] = [];
    if (playerLevel >= 1) {
      gardenItems.push({ icon: '🌱', name: 'Sprout' });
      gardenItems.push({ icon: '🌱', name: 'Sprout' });
    }
    if (playerLevel >= 2) {
      gardenItems.push({ icon: '🌸', name: 'Blossom' });
      gardenItems.push({ icon: '☘️', name: 'Clover' });
    }
    if (playerLevel >= 3) {
      gardenItems.push({ icon: '🌳', name: 'Oak' });
      gardenItems.push({ icon: '☀️', name: 'Solar Cell' });
    }
    if (playerLevel >= 4) {
      gardenItems.push({ icon: '🌻', name: 'Sunflower' });
      gardenItems.push({ icon: '🌀', name: 'Wind Orb' });
    }
    if (playerLevel >= 5) {
      gardenItems.push({ icon: '🏰', name: 'Eco Manor' });
      gardenItems.push({ icon: '🌈', name: 'Leyline Shield' });
    }

    return gardenItems.map((item, idx) => (
      <div 
        key={idx} 
        className="w-12 h-12 flex flex-col items-center justify-center rounded-lg bg-white/70 shadow-sm border border-white/50 animate-float"
        style={{ animationDelay: `${idx * 0.3}s` }}
        title={item.name}
      >
        <span className="text-2xl">{item.icon}</span>
      </div>
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* RPG Top Grid Panel: Guardian Stats + High Level Metrics */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch select-none">
        
        {/* Left Side: Animated Guardian Chibi Card */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full">
          <ChibiAvatar level={playerLevel} footprint={displayAnnual} />
        </div>

        {/* Right Side: Player RPG Character Control Panel */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-md">
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
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 border border-white/40 text-slate-900 rounded-full font-display text-[10px] font-black uppercase tracking-wider shadow-sm">
                <span>🔥 {streakDays}d Streak</span>
              </div>
            </div>

            {/* Level & XP Gauge - Neumorphic Style */}
            <div className="p-4 bg-white/40 border border-white/60 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs font-display font-black text-emerald-800 uppercase tracking-wide">
                <span className="flex items-center gap-1">🏆 Guardian Level {playerLevel}</span>
                <span className="text-slate-500">{currentLevelProgressXp} / {nextLevelXpThreshold} XP</span>
              </div>
              
              {/* Neumorphic Inset Slider Track */}
              <div className="h-4 neumorph-inset rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-500" 
                  style={{ width: `${(currentLevelProgressXp / nextLevelXpThreshold) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-emerald-700/80 font-sans italic">
                🎁 Complete Guild Quests (+85 XP) and record daily log deeds (+15 XP) to level up!
              </p>
            </div>

            {/* Carbon Annual Footprint Box */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 border border-white/50 p-4 rounded-xl text-center shadow-xs">
                <p className="font-display text-[9px] font-black uppercase tracking-wider text-slate-500 mb-1">ANNUAL TRACK CO₂</p>
                <p className="font-display text-3xl font-black text-slate-900 leading-none">
                  {displayAnnual.toFixed(1)}t
                </p>
                <p className="text-[9px] font-mono font-bold text-slate-400 mt-1.5">TONNES / YR</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 border border-white/30 p-4 rounded-xl text-center text-white shadow-sm">
                <p className="font-display text-[9px] font-black uppercase tracking-wider text-emerald-100 mb-1">GAIA VALUE</p>
                <p className="font-display text-3xl font-black text-white leading-none">
                  {Math.max(12, Math.round(100 - (displayAnnual / 7.5) * 50))}%
                </p>
                <p className="text-[9px] font-mono font-bold text-emerald-200 mt-1.5">ALIGNMENT RATING</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/30 flex justify-between items-center gap-1">
            <span className="text-[11px] font-sans text-slate-500 font-bold leading-tight">
              Defeat the Smog Lord: keep annual impact below 2.5 tonnes!
            </span>
            <button 
              onClick={() => onNavigateToTab('trend')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-display font-black uppercase tracking-wider rounded-lg border border-slate-950 flex items-center gap-1 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              Logs Trend <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

        </div>
      </section>

      {/* Dynamic Boss Battle Widget & Solarpunk Garden Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch select-none">
        
        {/* Boss Battle Widget (spans 6 cols) */}
        <div className="md:col-span-6 glass-panel p-5 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="font-display text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-rose-500" />
              Smog Lord Boss Battle
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              Mitigation Target: 0 HP
            </span>
          </div>

          <div className="flex items-center gap-4 py-3 bg-rose-50/30 rounded-xl border border-rose-100 px-4 relative">
            {/* Slash Hit Graphic Overlay */}
            {slashEffect && (
              <div className="absolute inset-0 bg-white/30 flex items-center justify-center z-20 animate-pulse">
                <span className="text-4xl animate-bounce">⚡💥⚔️</span>
              </div>
            )}

            {/* Boss Art SVG Container */}
            <div 
              onClick={handleAttackBoss}
              className={`w-20 h-20 shrink-0 cursor-pointer flex items-center justify-center rounded-full bg-slate-800 border-2 border-slate-900 shadow-md ${
                bossShake ? 'animate-shake' : 'animate-float'
              }`}
            >
              <svg viewBox="0 0 100 100" className="w-14 h-14">
                <path d="M20,60 C20,40 40,30 50,35 C60,30 80,40 80,60 C85,65 75,75 50,70 C25,75 15,65 20,60 Z" fill="#475569" stroke="#1e293b" strokeWidth="2" />
                {/* Glowing red angry eyes */}
                <circle cx="40" cy="50" r="3.5" fill="#ef4444" className="animate-pulse" />
                <circle cx="60" cy="50" r="3.5" fill="#ef4444" className="animate-pulse" />
                <path d="M42,57 Q50,52 58,57" fill="none" stroke="#000" strokeWidth="2" />
              </svg>
            </div>

            <div className="flex-grow space-y-1.5">
              <div className="flex justify-between items-center text-xs font-display font-black text-rose-800 uppercase tracking-wide">
                <span>💨 Smog Lord {bossHp === 0 ? '🏆 DEFEATED' : 'LVL 99'}</span>
                <span>{bossHp} / {maxBossHp} HP</span>
              </div>

              {/* HP Bar - Neumorphic design */}
              <div className="h-3.5 neumorph-inset rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500" 
                  style={{ width: `${bossHpPercent}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-500 italic">
                {bossHp === 0 
                  ? 'Gaia heals! The air index is pure and balanced.'
                  : '⚠️ Log mitigation deeds and complete quests to strike the monster down!'}
              </p>
            </div>
          </div>
        </div>

        {/* Solarpunk Garden Grid Visualizer (spans 6 cols) */}
        <div className="md:col-span-6 glass-panel p-5 rounded-2xl flex flex-col justify-between shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="font-display text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Solarpunk Sanctuary Garden
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500">
              Unlocked: {renderGardenItems().length} Items
            </span>
          </div>

          <div className="bg-emerald-50/30 rounded-xl border border-emerald-100 p-4 h-24 flex flex-wrap gap-2.5 items-center justify-center overflow-y-auto">
            {renderGardenItems()}
          </div>
          <p className="text-[9px] text-slate-500 mt-2 italic text-center">
            🌲 Elevate your level to plant solar cells, clover trees, and shield generators in your sanctuary!
          </p>
        </div>
      </section>

      {/* Comparison Metrics Gauge - Neumorphic styling */}
      <section className="glass-panel p-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3.5 gap-2 select-none">
          <span className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-500 animate-bounce" />
            Global Safe Emission Boundary
          </span>
          <p className="font-sans text-[11px] text-slate-600 font-bold">
            Average Citizen: <span className="font-bold">4.7t</span> | Safe Threshold <span className="font-bold text-emerald-600">2.5t</span>
          </p>
        </div>

        <div className="relative w-full h-5 neumorph-inset rounded-full overflow-hidden p-0.5">
          <div className="absolute left-[25%] top-0 bottom-0 w-0.5 bg-emerald-500/80 z-10" title="Safe: 2.5t" />
          <div className="absolute left-[47%] top-0 bottom-0 w-0.5 bg-orange-400/80 z-10" title="Global Avg: 4.7t" />
          
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400 rounded-full transition-all duration-[1000ms] relative" 
            style={{ width: `${Math.max(10, Math.min(100, (displayAnnual / 10) * 100))}%` }} 
          >
            <span className="absolute right-0 top-0 w-3 h-full bg-white opacity-40 animate-pulse" />
          </div>
        </div>

        <div className="flex justify-between mt-2 text-[8px] font-display font-black uppercase tracking-widest text-slate-500 px-1">
          <span>0 Tonnes</span>
          <span className="text-emerald-600 font-bold">Safe Point (2.5t)</span>
          <span className="text-orange-500 font-bold">Global Avg (4.7t)</span>
          <span>Danger Zone (10t+)</span>
        </div>
      </section>

      {/* Bento Grid: Source Donut + Active summaries */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Bento: Donut Chart */}
        <section className="md:col-span-6 glass-panel p-6 rounded-2xl shadow-md flex flex-col items-center justify-between select-none">
          <h3 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider self-start flex items-center gap-1.5 mb-4">
            <span className="p-1 bg-amber-100 text-amber-600 rounded">📊</span> Emissions Distribution
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
                    strokeWidth="4.5"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-700"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-black text-slate-800 leading-none">{totalSum.toFixed(0)}</span>
              <span className="font-display text-[9px] text-slate-400 tracking-widest font-black mt-1">TOTAL KG CO₂</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="grid grid-cols-2 gap-2 w-full border-t border-slate-100 pt-4 mt-4 text-left">
            {dataset.map((segment, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0 border border-white/50" style={{ backgroundColor: segment.color }} />
                <span className="font-sans text-[11px] font-bold text-slate-600 truncate">
                  {segment.label} ({segment.perc}%)
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Bento: Quests and AI advice columns */}
        <div className="md:col-span-6 space-y-6 flex flex-col justify-between">
          
          {/* AI Advisor Bubble */}
          <section className="glass-panel p-5 rounded-2xl relative overflow-hidden flex items-start gap-4 shadow-md">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500" />
            
            <div className="bg-indigo-100 text-indigo-700 p-2.5 shrink-0 rounded-xl border border-white/30">
              <Lightbulb className="w-4 h-4" />
            </div>

            <div className="space-y-1 select-none">
              <h4 className="font-display text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
                Chibi Sage Wisdom
              </h4>
              <p className="font-sans text-xs font-bold text-slate-700 italic leading-relaxed">
                "Hark! Switching to a grain-heavy organic menu just twice this week keeps the soil healthy and secures 15% lower diet emissions!"
              </p>
            </div>
          </section>

          {/* Core Urgent quests lists */}
          <section className="glass-panel p-5 rounded-2xl shadow-md flex-grow">
            <h3 className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span className="p-0.5 bg-emerald-100 text-emerald-600 rounded">⚔️</span> Daily Active Skirmishes
            </h3>

            <ul className="space-y-2">
              <li 
                onClick={() => onNavigateToTab('tracker')}
                className="flex justify-between items-center p-3.5 bg-white/60 hover:bg-white border border-white/50 hover:border-emerald-300 rounded-xl cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Footprints className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-sans text-xs font-bold text-slate-700">Commute via active biking</span>
                </div>
                <span className="font-display text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 py-1 px-2.5 rounded-full uppercase shrink-0">
                  +15 XP
                </span>
              </li>

              <li 
                onClick={() => onNavigateToTab('challenges')}
                className="flex justify-between items-center p-3.5 bg-white/60 hover:bg-white border border-white/50 hover:border-emerald-300 rounded-xl cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <Thermometer className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-sans text-xs font-bold text-slate-700">Complete Weekly Quest</span>
                </div>
                <span className="font-display text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300 py-1 px-2.5 rounded-full uppercase shrink-0">
                  +85 XP
                </span>
              </li>
            </ul>
          </section>

        </div>
      </div>

    </div>
  );
}
