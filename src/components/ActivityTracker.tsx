import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { ActivityCategory, LoggedActivity, QuizAnswers } from '../types';
import {
  Car, Plane, Utensils, Tv, Wind, ShoppingBag, Trash2,
  Calendar, CheckSquare, Swords,
} from 'lucide-react';
import { sfx } from '../utils/audio';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Preset {
  id:       string;
  title:    string;
  icon:     React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  detail:   string;
  category: ActivityCategory;
  qty:      number;
  co2:      number;
}

interface ActivityTrackerProps {
  onAddActivity:     (activity: Omit<LoggedActivity, 'id'>) => void;
  onDeleteActivity?: (id: string) => void;
  activities:        LoggedActivity[];
  quizAnswers:       QuizAnswers;
}

// ─── Constants (defined outside component to avoid re-creation) ───────────────

const PRESETS: Preset[] = [
  { id: 'car',       title: 'Drive Fossil Mount',  icon: Car,         detail: '2.4 kg CO₂ / 10 mi', category: 'transport', qty: 10,  co2: 2.4   },
  { id: 'flight',    title: 'Short-haul Flight',   icon: Plane,       detail: '250 kg CO₂ / flight', category: 'transport', qty: 1,   co2: 250.0 },
  { id: 'meal',      title: 'Heavy Meat Meal',      icon: Utensils,    detail: '7.2 kg CO₂ / serving',category: 'food',      qty: 1,   co2: 7.2   },
  { id: 'streaming', title: 'Video Streaming',      icon: Tv,          detail: '0.1 kg CO₂ / hr',    category: 'energy',    qty: 1,   co2: 0.1   },
  { id: 'ac',        title: 'Air Conditioning',     icon: Wind,        detail: '1.5 kg CO₂ / hr',    category: 'energy',    qty: 1,   co2: 1.5   },
  { id: 'order',     title: 'Package Delivery',     icon: ShoppingBag, detail: '0.8 kg CO₂ / courier',category: 'purchases', qty: 1,   co2: 0.8   },
] as const;

const CATEGORY_ICONS: Record<ActivityCategory, React.ComponentType<{ className?: string }>> = {
  transport: Car,
  food:      Utensils,
  energy:    Wind,
  purchases: ShoppingBag,
};

const CATEGORY_EMOJIS: Record<ActivityCategory, string> = {
  transport: '🚗',
  food:      '🍽️',
  energy:    '⚡',
  purchases: '📦',
};

/** Keyword-based CO₂ heuristic for free-text entries. */
function estimateCo2FromText(query: string): { co2: number; category: ActivityCategory } {
  const q = query.toLowerCase();
  if (/car|drive|ride|commute|petrol|diesel/.test(q))  return { co2: 3.2,  category: 'transport' };
  if (/flight|fly|plane|air/.test(q))                  return { co2: 250,  category: 'transport' };
  if (/beef|burger|meat|steak|chicken|pork/.test(q))   return { co2: 5.8,  category: 'food'      };
  if (/solar|renewable|wind energy/.test(q))            return { co2: 0.1,  category: 'energy'    };
  if (/heat|power|ac|electricity|kWh/.test(q))         return { co2: 2.1,  category: 'energy'    };
  if (/delivery|package|shopping|electronics/.test(q)) return { co2: 1.4,  category: 'purchases' };
  return { co2: 1.2, category: 'purchases' };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActivityTracker({
  onAddActivity,
  onDeleteActivity,
  activities,
}: ActivityTrackerProps) {
  const [customText,         setCustomText]         = useState('');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timer on unmount to prevent memory leaks
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const triggerToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setActiveNotification(msg);
    toastTimerRef.current = setTimeout(() => setActiveNotification(null), 4000);
  }, []);

  const handleQuickAdd = useCallback((p: Preset) => {
    sfx.playLogSfx();
    onAddActivity({
      date:        new Date().toISOString().split('T')[0],
      category:    p.category,
      description: p.title,
      amount:      p.qty,
      co2Impact:   p.co2,
    });
    triggerToast(`Logged "${p.title}" (+${p.co2.toFixed(1)} kg CO₂e)`);
  }, [onAddActivity, triggerToast]);

  const handleCustomSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = customText.trim();
    if (!text) return;

    sfx.playLogSfx();
    const { co2, category } = estimateCo2FromText(text);

    onAddActivity({
      date:        new Date().toISOString().split('T')[0],
      category,
      description: text,
      amount:      1,
      co2Impact:   co2,
    });

    triggerToast(`Logged "${text}" (+${co2.toFixed(1)} kg CO₂e)`);
    setCustomText('');
  }, [customText, onAddActivity, triggerToast]);

  const handleDelete = useCallback((id: string, description: string) => {
    sfx.playDeleteSfx();
    onDeleteActivity?.(id);
    triggerToast(`Removed "${description}" from your log.`);
  }, [onDeleteActivity, triggerToast]);

  // Memoised sorted recent history (5 most recent)
  const recentActivities = useMemo(() =>
    [...activities]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5),
    [activities]
  );

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">

      {/* Accessible live-region for toast announcements (WCAG 4.1.3) */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {activeNotification ?? ''}
      </div>

      {/* Visual toast */}
      {activeNotification && (
        <div
          className="fixed top-6 right-6 z-50 bg-emerald-500 text-white border border-white/30 text-xs font-display font-black uppercase tracking-wider py-4 px-6 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce"
          aria-hidden="true"
        >
          <CheckSquare className="w-5 h-5 text-amber-300 shrink-0" aria-hidden="true" />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* Header */}
      <header className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 border border-emerald-200 rounded-full text-emerald-800 text-[10px] font-display font-black uppercase tracking-wider">
          <Swords className="w-3.5 h-3.5" aria-hidden="true" />
          Environmental Battle Log
        </div>
        <h2 className="font-display text-2xl font-black text-slate-800 uppercase tracking-tight">
          Record Daily Skirmishes
        </h2>
        <p className="text-xs text-slate-600 font-sans font-semibold">
          Every action alters your real-time carbon budget. Log clean deeds or carbon expenses!
        </p>
      </header>

      {/* Quick-add presets */}
      <section aria-labelledby="quick-add-heading">
        <h3
          id="quick-add-heading"
          className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-3"
        >
          <span aria-hidden="true">⚡</span> Rapid Selection Deck
        </h3>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4 list-none p-0 m-0" role="list">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            return (
              <li key={p.id}>
                <button
                  id={`quick-add-${p.id}`}
                  onClick={() => handleQuickAdd(p)}
                  aria-label={`Log ${p.title}: ${p.detail}`}
                  className="group flex flex-col items-center justify-center p-5 rounded-2xl text-center neumorph-button h-full w-full cursor-pointer"
                >
                  <Icon className="w-6 h-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform shrink-0" aria-hidden="true" />
                  <span className="font-sans text-xs font-black text-slate-700 block leading-tight">
                    {CATEGORY_EMOJIS[p.category]} {p.title}
                  </span>
                  <span className="text-slate-400 font-mono text-[9px] mt-1.5 bg-white border border-slate-100 px-2 py-0.5 rounded-full">
                    {p.detail}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Custom activity form */}
      <section aria-labelledby="custom-activity-heading" className="glass-panel p-5 rounded-2xl shadow-md space-y-3">
        <h3
          id="custom-activity-heading"
          className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest block"
        >
          <span aria-hidden="true">🔮</span> Spell Custom Caster
        </h3>
        <form onSubmit={handleCustomSubmit} noValidate className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="custom-activity-input" className="sr-only">
            Describe your custom activity (e.g. Composted organic wastes)
          </label>
          <input
            type="text"
            id="custom-activity-input"
            name="custom-activity"
            required
            placeholder="Type a custom deed… (e.g. Composted organic wastes)"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            autoComplete="off"
            className="flex-grow neumorph-inset px-4 py-3.5 text-xs font-sans font-bold rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800 placeholder:text-slate-400 border-none"
            aria-describedby="custom-activity-hint"
          />
          <p id="custom-activity-hint" className="sr-only">
            Describe your activity in plain text. CO₂ impact will be estimated automatically.
          </p>
          <button
            type="submit"
            id="custom-activity-submit-btn"
            className="bg-emerald-500 text-white font-display text-[10px] font-black px-6 py-3.5 uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer rounded-xl border border-white/20 shadow-md"
          >
            Register Spell <span aria-hidden="true">✨</span>
          </button>
        </form>
      </section>

      {/* Recent entries */}
      <section aria-labelledby="history-heading" className="space-y-3">
        <div className="flex justify-between items-center">
          <h3
            id="history-heading"
            className="font-display text-[10px] font-black text-slate-500 uppercase tracking-widest"
          >
            <span aria-hidden="true">🛡️</span> Recent Quest History
          </h3>
          <span className="text-emerald-600 font-display text-[9px] font-black tracking-wider uppercase border border-emerald-200 px-2.5 py-1 bg-emerald-50 rounded-full">
            {activities.length} total entries
          </span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="p-8 glass-panel rounded-2xl text-center text-xs text-slate-400 font-sans font-bold" role="status">
            Your battle history is vacant — trigger an action above!
          </div>
        ) : (
          <ul className="space-y-3 list-none p-0 m-0" role="list" aria-label="Recent activity log">
            {recentActivities.map((act) => {
              const IconComponent = CATEGORY_ICONS[act.category] ?? Car;
              const isOffset = act.co2Impact < 0;
              const co2Label = isOffset
                ? `Saved ${Math.abs(act.co2Impact).toFixed(1)} kg CO₂`
                : `Added ${act.co2Impact.toFixed(1)} kg CO₂`;

              return (
                <li
                  key={act.id}
                  id={`activity-row-${act.id}`}
                  className={`flex items-center justify-between p-4 glass-panel rounded-2xl shadow-xs transition-transform duration-100 hover:translate-x-0.5 ${
                    isOffset ? 'bg-gradient-to-r from-emerald-50/50 to-white/60 border-emerald-200' : ''
                  }`}
                  aria-label={`${act.description} — ${co2Label} on ${act.date}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl border border-white/40 shrink-0 ${isOffset ? 'bg-emerald-500 text-white' : 'bg-white/80'}`}
                      aria-hidden="true"
                    >
                      <IconComponent className={`w-5 h-5 ${isOffset ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <div>
                      <p className="font-sans text-xs font-black text-slate-700 leading-tight">
                        {act.description}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 shrink-0" aria-hidden="true" />
                        <time dateTime={act.date}>{act.date}</time>
                        {isOffset && (
                          <span className="bg-emerald-500 text-white text-[8px] font-display font-black px-1.5 py-0.5 uppercase tracking-widest rounded-full ml-1.5 shadow-sm">
                            Quest Reward
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right" aria-hidden="true">
                      <p className={`font-display text-lg font-black leading-none ${isOffset ? 'text-emerald-500' : 'text-slate-800'}`}>
                        {isOffset ? `${act.co2Impact.toFixed(1)}` : `+${act.co2Impact.toFixed(1)}`}
                        <span className="text-[10px] font-mono ml-0.5">kg</span>
                      </p>
                      <p className="text-[8px] font-display font-black text-slate-400 uppercase tracking-widest mt-1">CO₂e</p>
                    </div>

                    {onDeleteActivity && (
                      <button
                        onClick={() => handleDelete(act.id, act.description)}
                        id={`delete-act-${act.id}`}
                        aria-label={`Delete activity: ${act.description}`}
                        className="text-slate-400 hover:text-red-500 transition-all p-2 bg-white/85 border border-white/50 rounded-xl shrink-0 cursor-pointer shadow-xs hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Educational tip */}
      <section
        aria-labelledby="tip-heading"
        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch glass-panel rounded-2xl overflow-hidden shadow-md"
      >
        <div className="md:col-span-8 p-5 flex flex-col justify-center space-y-1 bg-amber-50/20">
          <span id="tip-heading" className="text-[#835500] font-display text-[9px] font-black uppercase tracking-widest block">
            <span aria-hidden="true">👑</span> Guild Master Pro-Tip
          </span>
          <h4 className="font-display text-base font-black text-slate-700 uppercase">Opt for Electric Rail Journeys</h4>
          <p className="text-slate-500 text-xs leading-relaxed font-sans font-medium">
            Swapping a short flight for high-speed electric rail preserves your carbon budget by up to 90%!
            Log activities regularly to monitor your dynamic progress.
          </p>
        </div>
        <div
          className="md:col-span-4 h-32 md:h-auto bg-[#e0f1e8]/40 p-4 flex flex-col items-center justify-center border-l border-white/30 text-4xl select-none animate-pulse-soft"
          aria-hidden="true"
        >
          🌲🏡💨
        </div>
      </section>
    </div>
  );
}
