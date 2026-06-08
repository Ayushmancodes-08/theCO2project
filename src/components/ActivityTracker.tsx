import React, { useState } from 'react';
import { ActivityCategory, LoggedActivity, QuizAnswers } from '../types';
import { Car, Plane, Utensils, Tv, Wind, ShoppingBag, Trash2, Calendar, CheckSquare, Swords } from 'lucide-react';
import { sfx } from '../utils/audio';

interface ActivityTrackerProps {
  onAddActivity: (activity: Omit<LoggedActivity, 'id'>) => void;
  onDeleteActivity?: (id: string) => void;
  activities: LoggedActivity[];
  quizAnswers: QuizAnswers;
}

export default function ActivityTracker({
  onAddActivity,
  onDeleteActivity,
  activities,
  quizAnswers,
}: ActivityTrackerProps) {
  const [customText, setCustomText] = useState('');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4000);
  };

  const presets = [
    {
      id: 'car',
      title: 'Drive Fossil Mount 🚗',
      icon: Car,
      detail: '2.4kg CO₂ / 10mi',
      category: 'transport' as ActivityCategory,
      qty: 10,
      co2: 2.4,
    },
    {
      id: 'flight',
      title: 'Sky Flying Portal ✈️',
      icon: Plane,
      detail: '250kg CO₂ / short',
      category: 'transport' as ActivityCategory,
      qty: 1,
      co2: 250.0,
    },
    {
      id: 'meal',
      title: 'Feast Behemoth Meat 🥩',
      icon: Utensils,
      detail: '7.2kg CO₂ / serving',
      category: 'food' as ActivityCategory,
      qty: 1,
      co2: 7.2,
    },
    {
      id: 'streaming',
      title: 'Tome Streaming 📺',
      icon: Tv,
      detail: '0.1kg CO₂ / hour',
      category: 'energy' as ActivityCategory,
      qty: 1,
      co2: 0.1,
    },
    {
      id: 'ac',
      title: 'Summon AC Frost ❄️',
      icon: Wind,
      detail: '1.5kg CO₂ / hour',
      category: 'energy' as ActivityCategory,
      qty: 1,
      co2: 1.5,
    },
    {
      id: 'order',
      title: 'Deploy Gear Order 📦',
      icon: ShoppingBag,
      detail: '0.8kg CO₂ / courier',
      category: 'purchases' as ActivityCategory,
      qty: 1,
      co2: 0.8,
    },
  ];

  const handleQuickAdd = (p: typeof presets[0]) => {
    sfx.playLogSfx();
    onAddActivity({
      date: new Date().toISOString().split('T')[0],
      category: p.category,
      description: p.title,
      amount: p.qty,
      co2Impact: p.co2,
    });
    triggerToast(`Logged ${p.title} (+${p.co2.toFixed(1)} kg CO₂e) successfully!`);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    sfx.playLogSfx();
    const query = customText.trim().toLowerCase();
    let estimatedCo2 = 1.2;
    let cat: ActivityCategory = 'purchases';

    if (query.includes('car') || query.includes('drive') || query.includes('ride') || query.includes('commute')) {
      estimatedCo2 = 3.2;
      cat = 'transport';
    } else if (query.includes('beef') || query.includes('burger') || query.includes('meat') || query.includes('steak') || query.includes('dinner')) {
      estimatedCo2 = 5.8;
      cat = 'food';
    } else if (query.includes('delivery') || query.includes('package') || query.includes('shopping') || query.includes('electronics')) {
      estimatedCo2 = 1.4;
      cat = 'purchases';
    } else if (query.includes('solar') || query.includes('renewable')) {
      estimatedCo2 = 0.1;
      cat = 'energy';
    } else if (query.includes('heat') || query.includes('power') || query.includes('ac') || query.includes('electricity')) {
      estimatedCo2 = 2.1;
      cat = 'energy';
    }

    onAddActivity({
      date: new Date().toISOString().split('T')[0],
      category: cat,
      description: customText.trim(),
      amount: 1,
      co2Impact: estimatedCo2,
    });

    triggerToast(`Logged "${customText.trim()}" successfully! (+${estimatedCo2.toFixed(1)} kg CO₂e)`);
    setCustomText('');
  };

  const sortedActivities = [...activities].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in relative select-none pb-10">
      
      {/* Toast alert system - Glassmorphic / Premium styling */}
      {activeNotification && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white border border-white/30 text-xs font-display font-black uppercase tracking-wider py-4 px-6 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckSquare className="w-5 h-5 text-amber-300 shrink-0" />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* Header */}
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full text-emerald-800 text-[10px] font-display font-black uppercase tracking-wider">
          <Swords className="w-3.5 h-3.5" /> Environmental Battle Log
        </div>
        <h2 className="font-display text-2xl font-black text-slate-800 uppercase tracking-tight">Record Daily Skirmishes</h2>
        <p className="text-xs text-slate-600 font-sans font-semibold">
          Every action alters your real-time budget. Log clean deeds or carbon expenses!
        </p>
      </header>

      {/* Quick Add Section using tactile neumorph-buttons */}
      <section className="space-y-3">
        <h3 className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <span>⚡</span> Rapid Selection Deck
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {presets.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                id={`quick-add-${p.id}`}
                onClick={() => handleQuickAdd(p)}
                className="group flex flex-col items-center justify-center p-5 rounded-2xl text-center neumorph-button h-full cursor-pointer"
              >
                <Icon className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform shrink-0" />
                <span className="font-sans text-xs font-black text-slate-700 block leading-tight">{p.title}</span>
                <span className="text-slate-400 font-mono text-[9px] mt-1.5 bg-white border border-slate-100 px-2 py-0.5 rounded-full">{p.detail}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Custom Entry Section - Glassmorphic / Neumorphic Inset Form */}
      <section className="glass-panel p-5 rounded-2xl shadow-md space-y-3">
        <h3 className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest block">
          🔮 Spell Custom Caster
        </h3>
        <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            id="custom-activity-input"
            required
            placeholder="Type a custom deed... (e.g. Composted organic wastes)"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="flex-grow neumorph-inset px-4 py-3.5 text-xs font-sans font-bold rounded-xl outline-none focus:ring-1 focus:ring-emerald-400/50 text-slate-800 placeholder:text-slate-400 border-none"
          />
          <button
            type="submit"
            id="custom-activity-submit-btn"
            className="bg-emerald-500 text-white font-display text-[10px] font-black px-6 py-3.5 uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer rounded-xl border border-white/20 shadow-md"
          >
            Register Spell ✨
          </button>
        </form>
      </section>

      {/* Recent Entries - styled as clean glass list items */}
      <section className="space-y-3">
        <div className="flex justify-between items-center select-none">
          <h3 className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest">
            🛡️ Past Quest History (Last 5)
          </h3>
          <span className="text-emerald-600 font-display text-[9px] font-black tracking-wider uppercase border border-emerald-200 px-2.5 py-1 bg-emerald-50 rounded-full">
            Realtime Budget Ledger
          </span>
        </div>

        <div className="space-y-3">
          {sortedActivities.length === 0 ? (
            <div className="p-8 glass-panel rounded-2xl text-center text-xs text-slate-400 font-sans font-bold">
              Your battle history is currently vacant. Trigger an action above!
            </div>
          ) : (
            sortedActivities.map((act) => {
              let IconComponent = Car;
              if (act.category === 'food') IconComponent = Utensils;
              else if (act.category === 'energy') IconComponent = Wind;
              else if (act.category === 'purchases') IconComponent = ShoppingBag;

              const isOffset = act.co2Impact < 0;

              return (
                <div
                  key={act.id}
                  id={`activity-row-${act.id}`}
                  className={`flex items-center justify-between p-4 glass-panel rounded-2xl shadow-xs transition-transform duration-100 hover:translate-x-0.5 ${
                    isOffset ? 'bg-gradient-to-r from-emerald-50/50 to-white/60 border-emerald-200' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border border-white/40 shrink-0 ${isOffset ? 'bg-emerald-500 text-white' : 'bg-white/80'}`}>
                      <IconComponent className={`w-5 h-5 ${isOffset ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <div>
                      <p className="font-sans text-xs font-black text-slate-700 leading-tight">
                        {act.description}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {act.date} {isOffset && <span className="bg-emerald-500 text-white text-[8px] font-display font-black px-1.5 py-0.5 uppercase tracking-widest rounded-full ml-1.5 shadow-sm">Quest Reward</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`font-display text-lg font-black leading-none ${isOffset ? 'text-emerald-500' : 'text-slate-800'}`}>
                        {isOffset ? `${act.co2Impact.toFixed(1)}kg` : `+${act.co2Impact.toFixed(1)}kg`}
                      </p>
                      <p className="text-[8px] font-display font-black text-slate-400 uppercase tracking-widest mt-1">
                        CO₂ GAUGE
                      </p>
                    </div>

                    {onDeleteActivity && (
                      <button
                        onClick={() => {
                          sfx.playDeleteSfx();
                          onDeleteActivity(act.id);
                          triggerToast('Dispelled historic log and adjusted XP metrics!');
                        }}
                        id={`delete-act-${act.id}`}
                        className="text-slate-400 hover:text-red-500 transition-all p-2 bg-white/85 border border-white/50 rounded-xl shrink-0 cursor-pointer shadow-xs hover:scale-105"
                        title="Discard log"
                      >
                        <Trash2 className="w-4 h-4 shrink-0" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Gamified educational quote banner */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch glass-panel rounded-2xl overflow-hidden shadow-md">
        <div className="md:col-span-8 p-5 flex flex-col justify-center space-y-1 bg-amber-50/20">
          <span className="text-[#835500] font-display text-[9px] font-black uppercase tracking-widest block">
            👑 GUILD MASTER PRO-TIP
          </span>
          <h4 className="font-display text-base font-black text-slate-700 uppercase">Opt for Electric Rail Journeys</h4>
          <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
            Deploying a short steam flight for high-voltage electricity rail travel preserves real-time budget indices up to 90%! Ensure you logs regularly to monitor dynamic progress tiers.
          </p>
        </div>
        <div className="md:col-span-4 h-32 md:h-auto bg-[#e0f1e8]/40 p-4 flex flex-col items-center justify-center border-l border-white/30 text-4xl select-none animate-pulse-soft">
          🌲🏡💨
        </div>
      </section>

    </div>
  );
}
