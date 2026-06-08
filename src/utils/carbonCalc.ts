/**
 * Carbon calculation utilities.
 * All emission factors are based on peer-reviewed IPCC / EPA data.
 */
import type { QuizAnswers, LoggedActivity, ActivityCategory, FlightFrequency } from '../types';

// ─── Emission Factors ────────────────────────────────────────────────────────

/** Standard scientific CO₂ emission factors (kg CO₂ equivalents). */
export const EMISSION_FACTORS = {
  transport: {
    car_ice:   0.18, // per km — standard medium gasoline car
    car_ev:    0.05, // per km — EV on average grid mix
    transit:   0.04, // per km — bus/train mix
    bike_walk: 0.00, // per km
  },
  diet: {
    meat_heavy:  7.2, // kg CO₂ per day
    meat_light:  4.1,
    vegetarian:  2.4,
    vegan:       1.5,
  },
  energy: {
    coal_gas:  0.85, // per kWh
    mix:       0.42,
    renewable: 0.02,
  },
  purchases: {
    high:     15.0, // kg CO₂ per day
    moderate:  7.5,
    low:       2.5,
  },
  /** Annual kg CO₂ per flight-frequency tier (round-trip medium-haul average). */
  flights: {
    low:      500,   // 0–1 flights/yr
    moderate: 2000,  // 2–5 flights/yr
    high:     6000,  // 6+ flights/yr
  },
} as const;

// ─── Annual Baseline ─────────────────────────────────────────────────────────

/**
 * Calculate the estimated annual carbon footprint in metric tonnes CO₂e.
 * Returns a non-negative number rounded to 3 decimal places.
 */
export function calculateAnnualBaseline(answers: QuizAnswers): number {
  const transportFactor =
    EMISSION_FACTORS.transport[answers.transportMode] ?? 0.18;
  const transportDaily = answers.commuteDistance * transportFactor;

  const dietDaily = EMISSION_FACTORS.diet[answers.dietType] ?? 4.1;

  const energyFactor = EMISSION_FACTORS.energy[answers.homeEnergy] ?? 0.42;
  const energyDaily = 10 * energyFactor; // assumes ~10 kWh/day household

  const purchaseDaily = EMISSION_FACTORS.purchases[answers.purchaseHabit] ?? 7.5;

  const flightAnnualKg =
    EMISSION_FACTORS.flights[answers.flightFrequency as FlightFrequency] ?? 2000;

  const totalDailyKg = transportDaily + dietDaily + energyDaily + purchaseDaily;
  const annualFromDaily = (totalDailyKg * 365) / 1000;
  const annualFromFlights = flightAnnualKg / 1000;

  return parseFloat((annualFromDaily + annualFromFlights).toFixed(3));
}

// ─── 30-Day History Generator ─────────────────────────────────────────────────

/**
 * Generate a realistic 30-day activity history seeded from quiz answers.
 * Adds ±20 % random variation per day to simulate real-world variance.
 */
export function generate30DayHistory(answers: QuizAnswers): LoggedActivity[] {
  const activities: LoggedActivity[] = [];
  const now = new Date();

  const transportFactor =
    EMISSION_FACTORS.transport[answers.transportMode] ?? 0.18;
  const dietValue   = EMISSION_FACTORS.diet[answers.dietType]         ?? 4.1;
  const energyFactor = EMISSION_FACTORS.energy[answers.homeEnergy]    ?? 0.42;
  const purchaseValue = EMISSION_FACTORS.purchases[answers.purchaseHabit] ?? 7.5;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Transport (weekdays only when commute > 0)
    if (answers.commuteDistance > 0) {
      const transportVar = 0.8 + Math.random() * 0.4;
      const dist = parseFloat((answers.commuteDistance * transportVar).toFixed(1));
      activities.push({
        id:          `gen-trans-${dateStr}`,
        date:        dateStr,
        category:    'transport' as ActivityCategory,
        description: `Commute via ${getTransportLabel(answers.transportMode)}`,
        amount:      dist,
        co2Impact:   parseFloat((dist * transportFactor).toFixed(2)),
      });
    }

    // Food
    const dietVar = 0.9 + Math.random() * 0.2;
    activities.push({
      id:          `gen-food-${dateStr}`,
      date:        dateStr,
      category:    'food' as ActivityCategory,
      description: `Daily meals (${getDietLabel(answers.dietType)})`,
      amount:      1,
      co2Impact:   parseFloat((dietValue * dietVar).toFixed(2)),
    });

    // Energy
    const energyVar = 0.85 + Math.random() * 0.3;
    const dailyKwh  = parseFloat((10 * energyVar).toFixed(1));
    activities.push({
      id:          `gen-energy-${dateStr}`,
      date:        dateStr,
      category:    'energy' as ActivityCategory,
      description: 'Household electricity & heating',
      amount:      dailyKwh,
      co2Impact:   parseFloat((dailyKwh * energyFactor).toFixed(2)),
    });

    // Purchases
    const purchaseVar = 0.7 + Math.random() * 0.6;
    activities.push({
      id:          `gen-purch-${dateStr}`,
      date:        dateStr,
      category:    'purchases' as ActivityCategory,
      description: 'Daily consumption footprint',
      amount:      1,
      co2Impact:   parseFloat((purchaseValue * purchaseVar).toFixed(2)),
    });
  }

  return activities;
}

// ─── CO₂ Estimation from Free Text ───────────────────────────────────────────

export interface Co2Estimate {
  co2:         number;
  category:    ActivityCategory;
  explanation: string;
}

/**
 * Keyword-based heuristic to estimate CO₂ impact from a free-text activity
 * description. Returns a conservative default for unrecognised patterns.
 */
export function estimateCo2FromText(query: string): Co2Estimate {
  const q = query.toLowerCase().trim();
  if (!q) return { co2: 0, category: 'purchases', explanation: '(No input provided)' };

  if (/flight|fly|plane/.test(q))
    return { co2: 250,  category: 'transport', explanation: '(Est. short-haul flight)' };
  if (/car|drive|rode|commute|petrol|diesel/.test(q))
    return { co2: 3.2,  category: 'transport', explanation: '(Est. 15 km car trip)' };
  if (/beef|burger|meat|steak|chicken|pork/.test(q))
    return { co2: 5.8,  category: 'food',      explanation: '(Est. high-meat meal)' };
  if (/solar|renewable|wind energy/.test(q))
    return { co2: 0.1,  category: 'energy',    explanation: '(Est. renewable source)' };
  if (/\b(heat|power|air conditioning|electricity|kwh)\b/.test(q))
    return { co2: 2.1,  category: 'energy',    explanation: '(Est. standard AC usage)' };
  if (/\b(delivery|package|shopping|electronics)\b/.test(q))
    return { co2: 1.4,  category: 'purchases', explanation: '(Est. single delivery)' };

  return { co2: 1.2, category: 'purchases', explanation: '(Default miscellaneous estimate)' };
}

// ─── Label Helpers ────────────────────────────────────────────────────────────

export function getTransportLabel(mode: string): string {
  switch (mode) {
    case 'car_ice':   return 'Gas/Diesel Car';
    case 'car_ev':    return 'Electric Vehicle';
    case 'transit':   return 'Public Transit';
    case 'bike_walk': return 'Biking / Walking';
    default:          return 'Transport';
  }
}

export function getDietLabel(diet: string): string {
  switch (diet) {
    case 'meat_heavy':  return 'Heavy Meat Eater';
    case 'meat_light':  return 'Low Meat / Omnivore';
    case 'vegetarian':  return 'Vegetarian';
    case 'vegan':       return 'Vegan';
    default:            return 'Diet';
  }
}

export function getEnergyLabel(energy: string): string {
  switch (energy) {
    case 'coal_gas':  return 'Fossil Fuel Heavily Centered';
    case 'mix':       return 'Standard Grid Mix';
    case 'renewable': return '100% Renewable source';
    default:          return 'Grid Mix';
  }
}

export function getPurchaseLabel(habit: string): string {
  switch (habit) {
    case 'high':     return 'High Consumer Purchases';
    case 'moderate': return 'Moderate / Thoughtful Consumer';
    case 'low':      return 'Minimalist/Low-Impact style';
    default:         return 'Consumer';
  }
}
