import React, { useState } from 'react';
import { ActivityCategory, LoggedActivity, QuizAnswers } from '../types';
import { EMISSION_FACTORS } from '../utils/carbonCalc';
import { Car, Plane, Utensils, Tv, Wind, ShoppingBag, Plus, Trash2, Calendar, CheckSquare, Sparkles, Swords } from 'lucide-react';
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
      title: 'Summon Freezer AC ❄️',
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
    triggerToast(`Logged ${p.title} (+${p.co2.toFixed(1)} kg CO₂e) to your active profile!`);
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
      
      {/* Toast alert system - fully retro styled popup */}
      {activeNotification && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white border-2 border-slate-900 text-xs font-display font-black uppercase tracking-wider py-4 px-6 rounded-lg shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] flex items-center gap-2 animate-bounce">
          <CheckSquare className="w-5 h-5 text-amber-300 shrink-0" />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* Header */}
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-300 rounded-full text-emerald-800 text-[10px] font-display font-black uppercase tracking-wider">
          <Swords className="w-3.5 h-3.5" /> Environmental Battle Log
        </div>
        <h2 className="font-display text-2xl font-black text-slate-800 uppercase tracking-tight">Record Daily Skirmishes</h2>
        <p className="text-xs text-slate-600 font-sans font-semibold">
          Every action alters your real-time budget. Log clean deeds or carbon expenses!
        </p>
      </header>

      {/* Quick Add Section */}
      <section className="space-y-3">
        <h3 className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
          <span>⚡</span> Rapid Selection Deck
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {presets.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                id={`quick-add-${p.id}`}
                onClick={() => handleQuickAdd(p)}
                className="group flex flex-col items-center justify-center p-4 bg-white border-2 border-brand-border hover:border-emerald-500 transition-all duration-150 cursor-pointer rounded-lg text-center game-card h-full"
              >
                <Icon className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform shrink-0" />
                <span className="font-sans text-xs font-black text-slate-800 block leading-tight">{p.title}</span>
                <span className="text-slate-400 font-mono text-[9px] mt-1 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-sm">{p.detail}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Custom Entry Section - Gaming Form Bar */}
      <section className="bg-amber-50/50 border-2 border-brand-border p-5 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] space-y-3">
        <h3 className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest block">
          🔮 Spell Custom Caster
        </h3>
        <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            id="custom-activity-input"
            required
            placeholder="Type a custom deed... (e.g. Composted organic wastes)"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="flex-grow bg-white border-2 border-brand-border px-4 py-3 text-xs font-sans font-bold rounded-lg outline-none focus:border-emerald-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="submit"
            id="custom-activity-submit-btn"
            className="bg-emerald-500 text-white border-2 border-slate-900 font-display text-[10px] font-black px-6 py-3 uppercase tracking-wider hover:brightness-105 active:translate-y-[1px] transition-all cursor-pointer rounded-lg shadow-[2px_2px_0px_0px_#1e293b]"
          >
            Register Spell ✨
          </button>
        </form>
      </section>

      {/* Recent Entries */}
      <section className="space-y-3">
        <div className="flex justify-between items-center select-none">
          <h3 className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest">
            🛡️ Past Quest History (Last 5)
          </h3>
          <span className="text-emerald-600 font-display text-[9px] font-black tracking-wider uppercase border border-emerald-200 px-2 py-1 bg-emerald-50 rounded-full">
            Realtime Budget Ledger
          </span>
        </div>

        <div className="space-y-2.5">
          {sortedActivities.length === 0 ? (
            <div className="p-8 bg-white border-2 border-brand-border rounded-lg text-center text-xs text-slate-500 font-sans font-semibold">
              Your battle history is currently vacant. Trigger an action above!
            </div>
          ) : (
            sortedActivities.map((act) => {
              let IconComponent = Car;
              if (act.category === 'food') IconComponent = Utensils;
              else if (act.category === 'energy') IconComponent = Wind;
              else if (act.category === 'purchases') IconComponent = ShoppingBag;

              // Check if saving is a green positive offset! (negative CO2 value)
              const isOffset = act.co2Impact < 0;

              return (
                <div
                  key={act.id}
                  id={`activity-row-${act.id}`}
                  className={`flex items-center justify-between p-4 bg-white border-2 border-brand-border rounded-lg shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] transition-transform duration-100 hover:translate-x-0.5 ${
                    isOffset ? 'bg-gradient-to-r from-emerald-50 to-transparent' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded border-2 border-slate-800 shrink-0 ${isOffset ? 'bg-emerald-400 text-white' : 'bg-[#fefcf6]'}`}>
                      <IconComponent className="w-5 h-5 text-slate-800" />
                    </div>
                    <div>
                      <p className="font-sans text-xs font-black text-slate-900 leading-tight">
                        {act.description}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 shrink-0" />
                        {act.date} {isOffset && <span className="bg-emerald-500 text-white text-[8px] font-display font-black px-1 py-0.5 uppercase tracking-widest rounded-sm ml-1.5">Quest Reward</span>}
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
                        className="text-slate-400 hover:text-red-500 transition-colors p-1 bg-slate-50 hover:bg-red-50 border border-slate-200 rounded shrink-0 cursor-pointer"
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

      {/* Gamified educational quote banner: beautiful background vector with solar panel theme */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch border-2 border-brand-border rounded-xl overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]">
        <div className="md:col-span-8 p-5 flex flex-col justify-center space-y-1 bg-amber-50/20">
          <span className="text-[#835500] font-display text-[9px] font-black uppercase tracking-widest block">
            👑 GUILD MASTER PRO-TIP
          </span>
          <h4 className="font-display text-base font-black text-slate-800 uppercase">Opt for Electric Rail Journeys</h4>
          <p className="text-slate-600 text-xs leading-relaxed font-sans font-medium">
            Deploying a short steam flight for high-voltage electricity rail travel preserves real-time budget indices up to 90%! Ensure you logs regularly to monitor dynamic progress tiers.
          </p>
        </div>
        <div className="md:col-span-4 h-32 md:h-auto bg-[#e0f1e8] p-4 flex flex-col items-center justify-center border-l-2 border-slate-800 text-4xl select-none animate-pulse-soft">
          🌲🏡💨
        </div>
      </section>

    </div>
  );
}
