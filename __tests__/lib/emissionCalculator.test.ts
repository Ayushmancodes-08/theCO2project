import { describe, it, expect } from 'vitest';
import {
  calculateCO2,
  computeWeeklyTotals,
  computeCategoryBreakdown,
  computeCarbonScore,
  getRealWorldEquivalent,
} from '@/lib/utils/emissionCalculator';
import type { CarbonActivity, CategoryBreakdown } from '@/types';

function makeActivity(
  overrides: Partial<CarbonActivity> = {}
): CarbonActivity {
  return {
    id: 'test-id',
    userId: 'user-1',
    category: 'transportation',
    subcategory: 'car_petrol_km',
    quantity: 10,
    unit: 'km',
    co2Equivalent: 1.92,
    date: new Date('2024-01-15'),
    createdAt: new Date(),
    ...overrides,
  };
}

describe('calculateCO2', () => {
  it('correctly calculates car petrol emissions', () => {
    expect(calculateCO2('transportation', 'car_petrol_km', 100)).toBe(19.2);
  });

  it('correctly calculates beef emissions', () => {
    expect(calculateCO2('food', 'beef_kg', 0.5)).toBe(13.5);
  });

  it('correctly calculates electricity emissions', () => {
    expect(calculateCO2('energy', 'electricity_kwh', 10)).toBe(4.75);
  });

  it('returns 0 for unknown category', () => {
    expect(calculateCO2('unknown', 'unknown', 100)).toBe(0);
  });

  it('returns 0 for unknown subcategory', () => {
    expect(calculateCO2('transportation', 'unknown', 100)).toBe(0);
  });

  it('handles zero quantity', () => {
    expect(calculateCO2('transportation', 'car_petrol_km', 0)).toBe(0);
  });

  it('handles negative quantity', () => {
    expect(() => calculateCO2('transportation', 'car_petrol_km', -10)).not.toThrow();
  });

  it('returns a finite number for all valid inputs', () => {
    const categories = ['transportation', 'food', 'energy', 'shopping', 'waste'] as const;
    const subcategories: Record<string, string> = {
      transportation: 'car_petrol_km',
      food: 'beef_kg',
      energy: 'electricity_kwh',
      shopping: 'clothing_item',
      waste: 'landfill_kg',
    };
    for (const cat of categories) {
      const result = calculateCO2(cat, subcategories[cat], 1);
      expect(Number.isFinite(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('computeWeeklyTotals', () => {
  it('returns empty array for no activities', () => {
    expect(computeWeeklyTotals([])).toEqual([]);
  });

  it('groups activities by date correctly', () => {
    const activities = [
      makeActivity({ date: new Date('2024-01-15'), co2Equivalent: 10, category: 'transportation' }),
      makeActivity({ date: new Date('2024-01-15'), co2Equivalent: 5, category: 'food' }),
      makeActivity({ date: new Date('2024-01-16'), co2Equivalent: 3, category: 'energy' }),
    ];
    const result = computeWeeklyTotals(activities);
    expect(result).toHaveLength(2);
    expect(result[0].total).toBe(15);
    expect(result[1].total).toBe(3);
  });

  it('sorts dates in ascending order', () => {
    const activities = [
      makeActivity({ date: new Date('2024-01-16'), co2Equivalent: 3 }),
      makeActivity({ date: new Date('2024-01-15'), co2Equivalent: 10 }),
    ];
    const result = computeWeeklyTotals(activities);
    expect(result[0].date).toBe('2024-01-15');
    expect(result[1].date).toBe('2024-01-16');
  });

  it('handles single activity', () => {
    const activities = [makeActivity({ co2Equivalent: 5 })];
    const result = computeWeeklyTotals(activities);
    expect(result).toHaveLength(1);
    expect(result[0].total).toBe(5);
  });
});

describe('computeCategoryBreakdown', () => {
  it('returns zero breakdown for no activities', () => {
    const result = computeCategoryBreakdown([]);
    expect(result.transportation).toBe(0);
    expect(result.food).toBe(0);
    expect(result.energy).toBe(0);
    expect(result.shopping).toBe(0);
    expect(result.waste).toBe(0);
  });

  it('correctly sums activities by category', () => {
    const activities = [
      makeActivity({ category: 'transportation', co2Equivalent: 10 }),
      makeActivity({ category: 'transportation', co2Equivalent: 5 }),
      makeActivity({ category: 'food', co2Equivalent: 8 }),
      makeActivity({ category: 'energy', co2Equivalent: 3 }),
    ];
    const result = computeCategoryBreakdown(activities);
    expect(result.transportation).toBe(15);
    expect(result.food).toBe(8);
    expect(result.energy).toBe(3);
    expect(result.shopping).toBe(0);
    expect(result.waste).toBe(0);
  });

  it('handles all five categories', () => {
    const categories: Array<keyof CategoryBreakdown> = [
      'transportation', 'food', 'energy', 'shopping', 'waste',
    ];
    const activities = categories.map((cat) =>
      makeActivity({ category: cat, co2Equivalent: 10 })
    );
    const result = computeCategoryBreakdown(activities);
    for (const cat of categories) {
      expect(result[cat]).toBe(10);
    }
  });
});

describe('computeCarbonScore', () => {
  it('returns zero scores when no activities', () => {
    const score = computeCarbonScore([], 200);
    expect(score.daily).toBe(0);
    expect(score.weekly).toBe(0);
    expect(score.monthly).toBe(0);
    expect(score.annual).toBe(0);
    expect(score.percentage).toBe(100);
  });

  it('calculates percentage correctly', () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const activities = [
      makeActivity({
        date: new Date(startOfMonth.getTime() + 86400000),
        co2Equivalent: 50,
      }),
    ];
    const score = computeCarbonScore(activities, 200);
    expect(score.monthly).toBe(50);
    expect(score.percentage).toBe(75);
  });
});

describe('getRealWorldEquivalent', () => {
  it('returns correct equivalency for various values', () => {
    expect(getRealWorldEquivalent(0.5)).toContain('smartphone');
    expect(getRealWorldEquivalent(3)).toContain('streaming');
    expect(getRealWorldEquivalent(7)).toContain('petrol');
    expect(getRealWorldEquivalent(25)).toContain('cheeseburger');
    expect(getRealWorldEquivalent(75)).toContain('commute');
    expect(getRealWorldEquivalent(150)).toContain('flight');
    expect(getRealWorldEquivalent(400)).toContain('electricity');
    expect(getRealWorldEquivalent(750)).toContain('Paris');
    expect(getRealWorldEquivalent(2000)).toContain("person's monthly");
  });

  it('handles zero', () => {
    expect(getRealWorldEquivalent(0)).toContain('smartphone');
  });

  it('handles very large values', () => {
    expect(getRealWorldEquivalent(10000)).toContain("person's monthly");
  });
});
