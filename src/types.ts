export interface QuizAnswers {
  transportMode: string; // car_ice, car_ev, transit, bike_walk
  commuteDistance: number; // km per day
  dietType: string; // meat_heavy, meat_light, vegetarian, vegan
  homeEnergy: string; // coal_gas, mix, renewable
  purchaseHabit: string; // high, moderate, low
}

export type ActivityCategory = 'transport' | 'food' | 'energy' | 'purchases';

export interface LoggedActivity {
  id: string;
  date: string; // YYYY-MM-DD
  category: ActivityCategory;
  description: string;
  amount: number; // e.g., km, meals, kWh, count
  co2Impact: number; // calculated kg CO2
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ActivityCategory;
  co2Savings: number; // kg CO2 saved per completion
  duration: string;
  isAccepted: boolean;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Co2Stats {
  dailyAverage: number; // kg CO2
  baselineAnnual: number; // tonnes CO2 per year
  categoryBreakdown: {
    transport: number;
    food: number;
    energy: number;
    purchases: number;
  };
}
