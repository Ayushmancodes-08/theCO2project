import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse, getErrorMessage } from '@/lib/utils/api';

describe('successResponse', () => {
  it('returns success with data', () => {
    const result = successResponse({ id: 1, name: 'test' });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 1, name: 'test' });
  });

  it('returns success with array data', () => {
    const result = successResponse([1, 2, 3]);
    expect(result.success).toBe(true);
    expect(result.data).toEqual([1, 2, 3]);
  });

  it('returns success with null data', () => {
    const result = successResponse(null);
    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });
});

describe('errorResponse', () => {
  it('returns error with message', () => {
    const result = errorResponse('Something went wrong');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Something went wrong');
  });

  it('returns error with code', () => {
    const result = errorResponse('Not found', 'NOT_FOUND');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Not found');
    expect(result.code).toBe('NOT_FOUND');
  });

  it('returns error without code', () => {
    const result = errorResponse('Error');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Error');
    expect(result.code).toBeUndefined();
  });
});

describe('getErrorMessage', () => {
  it('returns Error message for Error instances', () => {
    expect(getErrorMessage(new Error('test error'))).toBe('test error');
  });

  it('returns default message for non-Error values', () => {
    expect(getErrorMessage('string error')).toBe('An unexpected error occurred');
  });

  it('returns default message for null', () => {
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
  });

  it('returns default message for undefined', () => {
    expect(getErrorMessage(undefined)).toBe('An unexpected error occurred');
  });

  it('returns default message for objects', () => {
    expect(getErrorMessage({ custom: 'error' })).toBe('An unexpected error occurred');
  });
});
