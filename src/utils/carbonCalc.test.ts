import { describe, it, expect, vi } from 'vitest';
import {
  calculateAnnualBaseline,
  generate30DayHistory,
  estimateCo2FromText,
  getTransportLabel,
  getDietLabel,
  getEnergyLabel,
  getPurchaseLabel,
  EMISSION_FACTORS,
} from './carbonCalc';
import type { QuizAnswers } from '../types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const highImpactAnswers: QuizAnswers = {
  commuteDistance:  15,
  transportMode:    'car_ice',
  dietType:         'meat_heavy',
  homeEnergy:       'coal_gas',
  flightFrequency:  'moderate',
  purchaseHabit:    'high',
};

const lowImpactAnswers: QuizAnswers = {
  commuteDistance:  0,
  transportMode:    'bike_walk',
  dietType:         'vegan',
  homeEnergy:       'renewable',
  flightFrequency:  'low',
  purchaseHabit:    'low',
};

// ─── calculateAnnualBaseline ─────────────────────────────────────────────────

describe('calculateAnnualBaseline', () => {
  it('returns a positive number for high-impact answers', () => {
    const result = calculateAnnualBaseline(highImpactAnswers);
    expect(result).toBeGreaterThan(0);
  });

  it('correctly sums all four categories plus flights for high-impact profile', () => {
    // Transport: 15 * 0.18 = 2.7  | Diet: 7.2  | Energy: 10*0.85=8.5  | Purchases: 15.0
    // Daily total = 33.4 kg  → annual from daily = 33.4*365/1000 = 12.191 t
    // Flights (moderate): 2000 kg → 2.0 t
    // Grand total ≈ 14.191 t
    const result = calculateAnnualBaseline(highImpactAnswers);
    expect(result).toBeCloseTo(14.191, 2);
  });

  it('correctly sums all four categories plus flights for low-impact profile', () => {
    // Transport: 0  | Diet: 1.5  | Energy: 10*0.02=0.2  | Purchases: 2.5
    // Daily total = 4.2 kg  → annual = 4.2*365/1000 = 1.533 t
    // Flights (low): 500 kg → 0.5 t
    // Grand total ≈ 2.033 t
    const result = calculateAnnualBaseline(lowImpactAnswers);
    expect(result).toBeCloseTo(2.033, 2);
  });

  it('returns a higher value for high-impact than low-impact answers', () => {
    expect(calculateAnnualBaseline(highImpactAnswers)).toBeGreaterThan(
      calculateAnnualBaseline(lowImpactAnswers)
    );
  });

  it('returns a non-negative result for all valid transport modes', () => {
    const modes = ['car_ice', 'car_ev', 'transit', 'bike_walk'] as const;
    for (const mode of modes) {
      const result = calculateAnnualBaseline({ ...lowImpactAnswers, transportMode: mode, commuteDistance: 10 });
      expect(result).toBeGreaterThanOrEqual(0);
    }
  });

  it('returns a non-negative result for all valid diet types', () => {
    const diets = ['meat_heavy', 'meat_light', 'vegetarian', 'vegan'] as const;
    for (const diet of diets) {
      const result = calculateAnnualBaseline({ ...lowImpactAnswers, dietType: diet });
      expect(result).toBeGreaterThanOrEqual(0);
    }
  });

  it('returns a non-negative result for all valid energy types', () => {
    const energies = ['coal_gas', 'mix', 'renewable'] as const;
    for (const energy of energies) {
      const result = calculateAnnualBaseline({ ...lowImpactAnswers, homeEnergy: energy });
      expect(result).toBeGreaterThanOrEqual(0);
    }
  });

  it('returns a non-negative result for all valid flight frequencies', () => {
    const freqs = ['low', 'moderate', 'high'] as const;
    for (const freq of freqs) {
      const result = calculateAnnualBaseline({ ...lowImpactAnswers, flightFrequency: freq });
      expect(result).toBeGreaterThanOrEqual(0);
    }
  });

  it('returns a number rounded to 3 decimal places', () => {
    const result = calculateAnnualBaseline(highImpactAnswers);
    // toFixed(3) then parseFloat should equal itself
    expect(result).toBe(parseFloat(result.toFixed(3)));
  });

  it('ev car produces less transport emissions than ice car', () => {
    const evResult  = calculateAnnualBaseline({ ...highImpactAnswers, transportMode: 'car_ev' });
    const iceResult = calculateAnnualBaseline({ ...highImpactAnswers, transportMode: 'car_ice' });
    expect(evResult).toBeLessThan(iceResult);
  });

  it('vegan diet produces lower footprint than meat_heavy diet', () => {
    const veganResult = calculateAnnualBaseline({ ...highImpactAnswers, dietType: 'vegan' });
    const meatResult  = calculateAnnualBaseline({ ...highImpactAnswers, dietType: 'meat_heavy' });
    expect(veganResult).toBeLessThan(meatResult);
  });

  it('renewable energy produces lower footprint than coal_gas energy', () => {
    const renewableResult = calculateAnnualBaseline({ ...highImpactAnswers, homeEnergy: 'renewable' });
    const coalResult      = calculateAnnualBaseline({ ...highImpactAnswers, homeEnergy: 'coal_gas' });
    expect(renewableResult).toBeLessThan(coalResult);
  });
});

// ─── generate30DayHistory ─────────────────────────────────────────────────────

describe('generate30DayHistory', () => {
  it('generates exactly 120 activities for a full commute profile (4 per day × 30)', () => {
    const history = generate30DayHistory(highImpactAnswers);
    expect(history).toHaveLength(120);
  });

  it('generates exactly 90 activities when commute distance is zero (3 per day × 30)', () => {
    const history = generate30DayHistory({ ...highImpactAnswers, commuteDistance: 0 });
    expect(history).toHaveLength(90);
    expect(history.every((a) => a.category !== 'transport')).toBe(true);
  });

  it('generates activities covering all four categories when commute > 0', () => {
    const history = generate30DayHistory(highImpactAnswers);
    const cats = new Set(history.map((a) => a.category));
    expect(cats).toContain('transport');
    expect(cats).toContain('food');
    expect(cats).toContain('energy');
    expect(cats).toContain('purchases');
  });

  it('every activity has a valid YYYY-MM-DD date string', () => {
    const history = generate30DayHistory(lowImpactAnswers);
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    expect(history.every((a) => ISO_DATE.test(a.date))).toBe(true);
  });

  it('every activity has a unique id', () => {
    const history = generate30DayHistory(highImpactAnswers);
    const ids = history.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all co2Impact values are finite numbers', () => {
    const history = generate30DayHistory(highImpactAnswers);
    expect(history.every((a) => Number.isFinite(a.co2Impact))).toBe(true);
  });

  it('all co2Impact values are non-negative (generated history has no offsets)', () => {
    const history = generate30DayHistory(highImpactAnswers);
    expect(history.every((a) => a.co2Impact >= 0)).toBe(true);
  });

  it('bike_walk generates zero transport co2Impact', () => {
    const history = generate30DayHistory({ ...highImpactAnswers, transportMode: 'bike_walk', commuteDistance: 10 });
    const transportActs = history.filter((a) => a.category === 'transport');
    expect(transportActs.every((a) => a.co2Impact === 0)).toBe(true);
  });
});

// ─── estimateCo2FromText ──────────────────────────────────────────────────────

describe('estimateCo2FromText', () => {
  it('returns transport category for car-related text', () => {
    expect(estimateCo2FromText('drove my car to work').category).toBe('transport');
    expect(estimateCo2FromText('commute by diesel bus').category).toBe('transport');
  });

  it('returns transport category with high co2 for flight text', () => {
    const result = estimateCo2FromText('took a flight to London');
    expect(result.category).toBe('transport');
    expect(result.co2).toBe(250);
  });

  it('returns food category for meat-related text', () => {
    expect(estimateCo2FromText('had a beef burger').category).toBe('food');
    expect(estimateCo2FromText('steak dinner tonight').category).toBe('food');
  });

  it('returns energy category for AC or electricity text', () => {
    expect(estimateCo2FromText('air conditioning on all day').category).toBe('energy');
    expect(estimateCo2FromText('home electricity usage').category).toBe('energy');
  });

  it('returns energy category with low co2 for renewable text', () => {
    const result = estimateCo2FromText('charged via solar panel');
    expect(result.category).toBe('energy');
    expect(result.co2).toBe(0.1);
  });

  it('returns purchases category for delivery text', () => {
    expect(estimateCo2FromText('ordered a package delivery').category).toBe('purchases');
    expect(estimateCo2FromText('online shopping order arrived').category).toBe('purchases');
  });

  it('returns a default estimate for unrecognised text', () => {
    const result = estimateCo2FromText('went for a walk in the park');
    expect(result.co2).toBe(1.2);
    expect(result.category).toBe('purchases');
  });

  it('returns zero co2 and explanation for empty string', () => {
    const result = estimateCo2FromText('');
    expect(result.co2).toBe(0);
    expect(result.explanation).toBeTruthy();
  });

  it('is case-insensitive', () => {
    const lower = estimateCo2FromText('drove car');
    const upper = estimateCo2FromText('DROVE CAR');
    expect(lower.category).toBe(upper.category);
    expect(lower.co2).toBe(upper.co2);
  });

  it('returns positive co2 for all recognised categories', () => {
    const cases = ['car trip', 'flight to paris', 'beef meal', 'air conditioning', 'solar energy', 'package delivery'];
    for (const c of cases) {
      expect(estimateCo2FromText(c).co2).toBeGreaterThan(0);
    }
  });
});

// ─── Label Helpers ────────────────────────────────────────────────────────────

describe('getTransportLabel', () => {
  it('returns correct label for each known transport mode', () => {
    expect(getTransportLabel('car_ice')).toBe('Gas/Diesel Car');
    expect(getTransportLabel('car_ev')).toBe('Electric Vehicle');
    expect(getTransportLabel('transit')).toBe('Public Transit');
    expect(getTransportLabel('bike_walk')).toBe('Biking / Walking');
  });

  it('returns fallback label for unknown mode', () => {
    expect(getTransportLabel('hoverboard')).toBe('Transport');
    expect(getTransportLabel('')).toBe('Transport');
  });
});

describe('getDietLabel', () => {
  it('returns correct label for each known diet type', () => {
    expect(getDietLabel('meat_heavy')).toBe('Heavy Meat Eater');
    expect(getDietLabel('meat_light')).toBe('Low Meat / Omnivore');
    expect(getDietLabel('vegetarian')).toBe('Vegetarian');
    expect(getDietLabel('vegan')).toBe('Vegan');
  });

  it('returns fallback label for unknown diet', () => {
    expect(getDietLabel('fruitarian')).toBe('Diet');
    expect(getDietLabel('')).toBe('Diet');
  });
});

describe('getEnergyLabel', () => {
  it('returns correct label for each known energy type', () => {
    expect(getEnergyLabel('coal_gas')).toBe('Fossil Fuel Heavily Centered');
    expect(getEnergyLabel('mix')).toBe('Standard Grid Mix');
    expect(getEnergyLabel('renewable')).toBe('100% Renewable source');
  });

  it('returns fallback label for unknown energy type', () => {
    expect(getEnergyLabel('nuclear')).toBe('Grid Mix');
    expect(getEnergyLabel('')).toBe('Grid Mix');
  });
});

describe('getPurchaseLabel', () => {
  it('returns correct label for each known purchase habit', () => {
    expect(getPurchaseLabel('high')).toBe('High Consumer Purchases');
    expect(getPurchaseLabel('moderate')).toBe('Moderate / Thoughtful Consumer');
    expect(getPurchaseLabel('low')).toBe('Minimalist/Low-Impact style');
  });

  it('returns fallback label for unknown habit', () => {
    expect(getPurchaseLabel('extreme')).toBe('Consumer');
    expect(getPurchaseLabel('')).toBe('Consumer');
  });
});

// ─── EMISSION_FACTORS structure ───────────────────────────────────────────────

describe('EMISSION_FACTORS', () => {
  it('has transport factors for all four modes', () => {
    expect(EMISSION_FACTORS.transport.car_ice).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.transport.car_ev).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.transport.transit).toBeGreaterThan(0);
    expect(EMISSION_FACTORS.transport.bike_walk).toBe(0);
  });

  it('has diet factors in ascending order (vegan < vegetarian < meat_light < meat_heavy)', () => {
    const { vegan, vegetarian, meat_light, meat_heavy } = EMISSION_FACTORS.diet;
    expect(vegan).toBeLessThan(vegetarian);
    expect(vegetarian).toBeLessThan(meat_light);
    expect(meat_light).toBeLessThan(meat_heavy);
  });

  it('has energy factors in ascending order (renewable < mix < coal_gas)', () => {
    const { renewable, mix, coal_gas } = EMISSION_FACTORS.energy;
    expect(renewable).toBeLessThan(mix);
    expect(mix).toBeLessThan(coal_gas);
  });

  it('has purchase factors in ascending order (low < moderate < high)', () => {
    const { low, moderate, high } = EMISSION_FACTORS.purchases;
    expect(low).toBeLessThan(moderate);
    expect(moderate).toBeLessThan(high);
  });

  it('has flight factors in ascending order (low < moderate < high)', () => {
    const { low, moderate, high } = EMISSION_FACTORS.flights;
    expect(low).toBeLessThan(moderate);
    expect(moderate).toBeLessThan(high);
  });
});
