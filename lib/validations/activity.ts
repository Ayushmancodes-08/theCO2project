import { z } from 'zod';

export const createActivitySchema = z.object({
  category: z.enum(['transportation', 'food', 'energy', 'shopping', 'waste']),
  subcategory: z.string().min(1).max(100),
  quantity: z.number().positive().max(100000),
  unit: z.string().min(1).max(20),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
});

export const updateActivitySchema = createActivitySchema.partial().extend({
  id: z.string().min(1),
});

export const activityQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  category: z.enum(['transportation', 'food', 'energy', 'shopping', 'waste']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>;
export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
