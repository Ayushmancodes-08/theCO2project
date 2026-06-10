export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: '#16a34a',
  medium: '#f59e0b',
  hard: '#ef4444',
};

export const DEFAULT_MONTHLY_GOAL_KG = 200;

export const PARIS_AGREEMENT_DAILY_TARGET_KG = 5.5;

export const GLOBAL_AVERAGE_ANNUAL_TONNES = 4.7;

export const SAFE_ANNUAL_TARGET_TONNES = 2.5;

export const REAL_WORLD_EQUIVALENTS = {
  '1': 'Half a smartphone charge',
  '5': 'Streaming 1 hour of video',
  '10': 'Burning 1 liter of petrol',
  '50': 'One cheeseburger',
  '100': '10 km car commute (petrol)',
  '250': 'Short domestic flight',
  '500': 'Monthly electricity average',
  '1000': 'One round-trip flight to Paris',
  '5000': "Average person's monthly total",
} as const;
