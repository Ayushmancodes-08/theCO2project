'use client';

import { useState, useCallback } from 'react';
import { useCreateActivity, useActivities } from '@/hooks/useActivities';
import { CATEGORY_LABELS, SUBCATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/constants/emissionFactors';
import { EMISSION_FACTORS } from '@/lib/constants/emissionFactors';
import type { ActivityCategory } from '@/types';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar } from 'lucide-react';
import type { CarbonActivity } from '@prisma/client';
import type { ApiResponse } from '@/types';

const CATEGORIES: ActivityCategory[] = ['transportation', 'food', 'energy', 'shopping', 'waste'];

export default function TrackPage() {
  const [category, setCategory] = useState<ActivityCategory>('transportation');
  const [subcategory, setSubcategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const createActivity = useCreateActivity();
  const { data: activitiesData } = useActivities(1, 20);

  const subcategories = Object.keys(
    (EMISSION_FACTORS as Record<string, Record<string, number>>)[category] ?? {}
  );

  const updateUnit = useCallback((sub: string) => {
    const parts = sub.split('_');
    const last = parts[parts.length - 1];
    if (last === 'km' || last === 'liter' || last === 'cup') setUnit(last);
    else if (last === 'kwh') setUnit('kWh');
    else setUnit('kg');
  }, []);

  const handleCategoryChange = useCallback((cat: ActivityCategory) => {
    setCategory(cat);
    setSubcategory('');
    setQuantity('');
    setUnit('');
  }, []);

  const handleSubcategoryChange = useCallback(
    (sub: string) => {
      setSubcategory(sub);
      updateUnit(sub);
    },
    [updateUnit]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!subcategory || !quantity) return;

      const qty = parseFloat(quantity);
      if (isNaN(qty) || qty <= 0) return;

      createActivity.mutate(
        {
          category,
          subcategory,
          quantity: qty,
          unit,
          date: new Date().toISOString(),
        },
        {
          onSuccess: () => {
            setQuantity('');
            setNotification(`Logged ${qty} ${unit} of ${SUBCATEGORY_LABELS[subcategory] ?? subcategory}`);
            setTimeout(() => setNotification(null), 3000);
          },
          onError: () => {
            setNotification('Failed to log activity. Please try again.');
            setTimeout(() => setNotification(null), 3000);
          },
        }
      );
    },
    [category, subcategory, quantity, unit, createActivity]
  );

  const getQuantityPlaceholder = () => {
    if (unit === 'km') return 'e.g. 25';
    if (unit === 'kWh') return 'e.g. 10';
    if (unit === 'liter') return 'e.g. 2';
    if (unit === 'cup') return 'e.g. 3';
    return 'e.g. 1';
  };

  const activities = (activitiesData as ApiResponse<CarbonActivity[]> & { total?: number })?.data ?? [];

  return (
    <div className="space-y-6 pb-10">
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 right-6 z-50 bg-emerald-500 text-white border border-white/30 text-xs font-display font-black uppercase tracking-wider py-4 px-6 rounded-2xl shadow-xl flex items-center gap-2"
          role="status"
          aria-live="polite"
        >
          <CheckCircle className="w-5 h-5 text-amber-300" aria-hidden="true" />
          <span>{notification}</span>
        </motion.div>
      )}

      <header className="space-y-1">
        <h1 className="font-display text-2xl font-black text-slate-800 uppercase tracking-tight">
          Log Activity
        </h1>
        <p className="text-xs text-slate-600 font-sans font-semibold">
          Track your daily activities and see their CO₂ impact in real time.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-2xl p-6 shadow-md space-y-6"
        noValidate
      >
        <div role="group" aria-label="Activity category">
          <label className="text-xs font-bold text-slate-700 block mb-3">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                aria-pressed={category === cat}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  category === cat
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                    : 'bg-white/60 text-slate-600 border-white/50 hover:bg-white'
                }`}
              >
                {CATEGORY_ICONS[cat] ?? '📋'} {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-label="Activity type">
          <label htmlFor="subcategory" className="text-xs font-bold text-slate-700 block mb-3">
            Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => handleSubcategoryChange(sub)}
                aria-pressed={subcategory === sub}
                className={`px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all border ${
                  subcategory === sub
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                    : 'bg-white/60 text-slate-600 border-white/50 hover:bg-white'
                }`}
              >
                {SUBCATEGORY_LABELS[sub] ?? sub}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="quantity" className="text-xs font-bold text-slate-700 block mb-2">
            Quantity ({unit || 'units'})
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              id="quantity"
              name="quantity"
              required
              min="0.01"
              max="100000"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={getQuantityPlaceholder()}
              className="flex-grow neumorph-inset px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-400 text-slate-800"
              aria-describedby="quantity-hint"
            />
            <span id="quantity-hint" className="sr-only">
              Enter a positive number
            </span>
            <button
              type="submit"
              disabled={!subcategory || !quantity || createActivity.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {createActivity.isPending ? 'Logging...' : 'Log Activity'}
            </button>
          </div>
          {subcategory && quantity && (
            <p className="mt-2 text-xs text-emerald-600 font-semibold" aria-live="polite">
              Estimated CO₂:{' '}
              {(
                ((EMISSION_FACTORS as Record<string, Record<string, number>>)[category]?.[subcategory] ?? 0) *
                parseFloat(quantity || '0'))
                .toFixed(2)}{' '}
              kg —{' '}
              {parseFloat(quantity || '0') > 0
                ? getRealWorldEquivalent(
                    ((EMISSION_FACTORS as Record<string, Record<string, number>>)[category]?.[subcategory] ?? 0) *
                      parseFloat(quantity || '0')
                  )
                : ''}
            </p>
          )}
        </div>
      </form>

      <div className="glass-panel rounded-2xl p-6 shadow-md">
        <h2 className="font-display text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
          Recent Activities
        </h2>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm font-semibold">
            No activities logged yet. Start tracking above!
          </div>
        ) : (
          <ul className="space-y-3 list-none p-0 m-0" role="list" aria-label="Recent activity log">
            {activities.slice(0, 10).map((act: CarbonActivity) => (
              <li
                key={act.id}
                className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg" aria-hidden="true">
                    {CATEGORY_ICONS[act.category] ?? '📋'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      {SUBCATEGORY_LABELS[act.subcategory] ?? act.subcategory}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" aria-hidden="true" />
                      {new Date(act.date).toLocaleDateString()} · {act.quantity} {act.unit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {act.co2Kg.toFixed(2)}
                    <span className="text-[10px] font-mono text-slate-500 ml-1">kg</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function getRealWorldEquivalent(kg: number): string {
  if (kg < 1) return 'Less than half a smartphone charge';
  if (kg < 5) return 'About 1 hour of video streaming';
  if (kg < 10) return 'Burning 1 liter of petrol';
  if (kg < 50) return 'One cheeseburger';
  if (kg < 100) return '10 km car commute (petrol)';
  if (kg < 250) return 'Short domestic flight';
  if (kg < 500) return 'Monthly electricity average';
  if (kg < 1000) return 'One round-trip flight to Paris';
  return "Average person's monthly total";
}
