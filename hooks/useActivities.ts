import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiResponse, CarbonActivity } from '@/types';

export function useActivities(page = 1, pageSize = 20) {
  return useQuery<ApiResponse<CarbonActivity[]> & { total: number; page: number; pageSize: number; hasMore: boolean }>({
    queryKey: ['activities', page, pageSize],
    queryFn: async () => {
      const res = await fetch(`/api/activities?page=${page}&pageSize=${pageSize}`);
      if (!res.ok) throw new Error('Failed to fetch activities');
      return res.json();
    },
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      category: string;
      subcategory: string;
      quantity: number;
      unit: string;
      date: string;
    }) => {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create activity');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['footprint'] });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete activity');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['footprint'] });
    },
  });
}
