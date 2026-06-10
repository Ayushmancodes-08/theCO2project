import { useQuery } from '@tanstack/react-query';
import type { ApiResponse, CategoryBreakdown, CarbonScore } from '@/types';

interface FootprintResponse {
  breakdown: CategoryBreakdown;
  score: CarbonScore;
  goalKg: number;
  onboardingCompleted: boolean;
}

export function useFootprintData() {
  return useQuery<ApiResponse<FootprintResponse>>({
    queryKey: ['footprint'],
    queryFn: async () => {
      const res = await fetch('/api/footprint');
      if (!res.ok) throw new Error('Failed to fetch footprint data');
      return res.json();
    },
  });
}
