/**
 * Strict literal union types for all user-facing enum values.
 * Using branded string literals eliminates accidental `string` misuse.
 */

export type TransportMode = 'car_ice' | 'car_ev' | 'transit' | 'bike_walk';
export type DietType = 'meat_heavy' | 'meat_light' | 'vegetarian' | 'vegan';
export type HomeEnergy = 'coal_gas' | 'mix' | 'renewable';
export type PurchaseHabit = 'high' | 'moderate' | 'low';
export type ActivityCategory = 'transport' | 'food' | 'energy' | 'purchases';
export type TabId = 'dashboard' | 'tracker' | 'challenges' | 'insights' | 'trend';

export interface QuizAnswers {
  /** Primary commute transport mode */
  transportMode: TransportMode;
  /** One-way commute distance in km per weekday */
  commuteDistance: number;
  /** Daily dietary pattern */
  dietType: DietType;
  /** Home electricity / heating grid source */
  homeEnergy: HomeEnergy;
  /** Discretionary consumer purchasing frequency */
  purchaseHabit: PurchaseHabit;
}

export interface LoggedActivity {
  /** Unique activity identifier (format: `act-{timestamp}-{rand}`) */
  id: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  category: ActivityCategory;
  /** Human-readable description */
  description: string;
  /** Quantity in category units (km, meals, kWh, count) */
  amount: number;
  /** Calculated kg CO₂ equivalent; negative values = offset savings */
  co2Impact: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  /** kg CO₂ saved upon completion */
  co2Savings: number;
  duration: string;
  isAccepted: boolean;
  isCompleted: boolean;
  /** ISO date string of completion, if completed */
  completedAt?: string;
}

export interface Co2Stats {
  /** Daily average kg CO₂ */
  dailyAverage: number;
  /** Annual baseline tonnes CO₂ */
  baselineAnnual: number;
  categoryBreakdown: {
    transport: number;
    food: number;
    energy: number;
    purchases: number;
  };
}
