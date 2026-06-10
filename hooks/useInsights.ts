import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse, AIInsight } from '@/types';

export function useInsights() {
  return useQuery<ApiResponse<AIInsight[]>>({
    queryKey: ['insights'],
    queryFn: async () => {
      const res = await fetch('/api/insights');
      if (!res.ok) throw new Error('Failed to fetch insights');
      return res.json();
    },
  });
}

export function useGenerateInsights() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/insights', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate insights');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}
