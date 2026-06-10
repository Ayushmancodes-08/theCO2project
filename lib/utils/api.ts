import type { ApiResponse } from '@/types';

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function errorResponse(error: string, code?: string): ApiResponse<never> {
  return { success: false, error, code };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}
