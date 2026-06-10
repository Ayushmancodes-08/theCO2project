import { EMISSION_FACTORS } from '@/lib/constants/emissionFactors';
import type { CarbonActivity, CategoryBreakdown, WeeklyDataPoint, CarbonScore } from '@/types';

export function calculateCO2(category: string, subcategory: string, quantity: number): number {
  const factor =
    (EMISSION_FACTORS as Record<string, Record<string, number>>)[category]?.[subcategory] ?? 0;
  return parseFloat((factor * quantity).toFixed(3));
}

export function computeWeeklyTotals(activities: CarbonActivity[]): WeeklyDataPoint[] {
  if (activities.length === 0) return [];

  const sorted = [...activities].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const grouped: Record<string, WeeklyDataPoint> = {};

  for (const act of sorted) {
    const dateKey = new Date(act.date).toISOString().split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        total: 0,
        transportation: 0,
        food: 0,
        energy: 0,
        shopping: 0,
        waste: 0,
      };
    }

    const point = grouped[dateKey];
    point.total += act.co2Equivalent;
    const category = act.category as keyof CategoryBreakdown;
    point[category] = (point[category] ?? 0) + act.co2Equivalent;
  }

  return Object.values(grouped);
}

export function computeCategoryBreakdown(activities: CarbonActivity[]): CategoryBreakdown {
  const breakdown: CategoryBreakdown = {
    transportation: 0,
    food: 0,
    energy: 0,
    shopping: 0,
    waste: 0,
  };

  for (const act of activities) {
    const category = act.category as keyof CategoryBreakdown;
    breakdown[category] = (breakdown[category] ?? 0) + act.co2Equivalent;
  }

  return breakdown;
}

export function computeCarbonScore(activities: CarbonActivity[], goalKg: number): CarbonScore {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let daily = 0;
  let weekly = 0;
  let monthly = 0;
  let annual = 0;

  for (const act of activities) {
    const actDate = new Date(act.date);
    const co2 = act.co2Equivalent;

    if (actDate.toDateString() === now.toDateString()) {
      daily += co2;
    }
    if (actDate >= startOfWeek) {
      weekly += co2;
    }
    if (actDate >= startOfMonth) {
      monthly += co2;
    }
    if (actDate >= startOfYear) {
      annual += co2;
    }
  }

  const percentage = Math.min(100, Math.max(0, (1 - monthly / goalKg) * 100));

  return {
    daily: parseFloat(daily.toFixed(2)),
    weekly: parseFloat(weekly.toFixed(2)),
    monthly: parseFloat(monthly.toFixed(2)),
    annual: parseFloat(annual.toFixed(2)),
    percentage: Math.round(percentage),
  };
}

export function getRealWorldEquivalent(kg: number): string {
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
