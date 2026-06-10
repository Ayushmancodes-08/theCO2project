import { describe, it, expect } from 'vitest';
import { createActivitySchema } from '@/lib/validations/activity';
import { loginSchema, registerSchema } from '@/lib/validations/auth';

describe('createActivitySchema', () => {
  it('accepts valid activity input', () => {
    const result = createActivitySchema.safeParse({
      category: 'transportation',
      subcategory: 'car_petrol_km',
      quantity: 25,
      unit: 'km',
      date: '2024-01-15T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const result = createActivitySchema.safeParse({
      category: 'invalid',
      subcategory: 'car_petrol_km',
      quantity: 25,
      unit: 'km',
      date: '2024-01-15T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = createActivitySchema.safeParse({
      category: 'transportation',
      subcategory: 'car_petrol_km',
      quantity: -10,
      unit: 'km',
      date: '2024-01-15T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero quantity', () => {
    const result = createActivitySchema.safeParse({
      category: 'transportation',
      subcategory: 'car_petrol_km',
      quantity: 0,
      unit: 'km',
      date: '2024-01-15T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects quantity over 100000', () => {
    const result = createActivitySchema.safeParse({
      category: 'transportation',
      subcategory: 'car_petrol_km',
      quantity: 100001,
      unit: 'km',
      date: '2024-01-15T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty subcategory', () => {
    const result = createActivitySchema.safeParse({
      category: 'transportation',
      subcategory: '',
      quantity: 25,
      unit: 'km',
      date: '2024-01-15T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing date', () => {
    const result = createActivitySchema.safeParse({
      category: 'transportation',
      subcategory: 'car_petrol_km',
      quantity: 25,
      unit: 'km',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid login input', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'notanemail',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts valid registration input', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects short name', () => {
    const result = registerSchema.safeParse({
      name: 'A',
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'invalid',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });
});
