export type ActivityCategory = 'transportation' | 'food' | 'energy' | 'shopping' | 'waste';

export interface CarbonActivity {
  id: string;
  userId: string;
  category: ActivityCategory;
  subcategory: string;
  quantity: number;
  unit: string;
  co2Equivalent: number;
  date: Date;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  monthlyGoalKg: number;
  onboardingCompleted: boolean;
  onboardingData: OnboardingData | null;
  createdAt: Date;
}

export interface OnboardingData {
  transportMode: string;
  dietType: string;
  homeSize: string;
  energySource: string;
  baselineKg: number;
}

export interface AIInsight {
  id: string;
  action: string;
  reasoning: string;
  estimatedSavingKg: number;
  difficulty: 'easy' | 'medium' | 'hard';
  committed: boolean;
  completedAt: Date | null;
  generatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface CarbonScore {
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
  percentage: number;
}

export interface CategoryBreakdown {
  transportation: number;
  food: number;
  energy: number;
  shopping: number;
  waste: number;
}

export interface WeeklyDataPoint {
  date: string;
  total: number;
  transportation: number;
  food: number;
  energy: number;
  shopping: number;
  waste: number;
}
