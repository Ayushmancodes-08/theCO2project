import { describe, it, expect } from 'vitest';
import { EMISSION_FACTORS, CATEGORY_LABELS, SUBCATEGORY_LABELS } from '@/lib/constants/emissionFactors';

describe('EMISSION_FACTORS', () => {
  it('has transportation factors', () => {
    const factors = EMISSION_FACTORS.transportation;
    expect(factors.car_petrol_km).toBeGreaterThan(0);
    expect(factors.car_electric_km).toBeGreaterThan(0);
    expect(factors.bicycle_km).toBe(0);
    expect(factors.walking_km).toBe(0);
    expect(factors.bus_km).toBeGreaterThan(0);
    expect(factors.train_km).toBeGreaterThan(0);
  });

  it('has food factors', () => {
    const factors = EMISSION_FACTORS.food;
    expect(factors.beef_kg).toBeGreaterThan(factors.chicken_kg);
    expect(factors.chicken_kg).toBeGreaterThan(factors.vegetables_kg);
    expect(factors.nuts_kg).toBeLessThan(factors.vegetables_kg);
    expect(factors.coffee_cup).toBeGreaterThan(0);
  });

  it('has energy factors', () => {
    const factors = EMISSION_FACTORS.energy;
    expect(factors.solar_kwh).toBeLessThan(factors.electricity_kwh);
    expect(factors.wind_kwh).toBeLessThan(factors.electricity_kwh);
    expect(factors.heating_oil_liter).toBeGreaterThan(0);
  });

  it('has shopping factors', () => {
    const factors = EMISSION_FACTORS.shopping;
    expect(factors.electronics_item).toBeGreaterThan(factors.book_item);
    expect(factors.clothing_item).toBeGreaterThan(0);
  });

  it('has waste factors', () => {
    const factors = EMISSION_FACTORS.waste;
    expect(factors.landfill_kg).toBeGreaterThan(factors.recycled_kg);
    expect(factors.composted_kg).toBeLessThan(factors.recycled_kg);
  });

  it('all factors are non-negative', () => {
    for (const category of Object.values(EMISSION_FACTORS)) {
      for (const value of Object.values(category)) {
        expect(value).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('has all required top-level categories', () => {
    expect(EMISSION_FACTORS).toHaveProperty('transportation');
    expect(EMISSION_FACTORS).toHaveProperty('food');
    expect(EMISSION_FACTORS).toHaveProperty('energy');
    expect(EMISSION_FACTORS).toHaveProperty('shopping');
    expect(EMISSION_FACTORS).toHaveProperty('waste');
  });
});

describe('CATEGORY_LABELS', () => {
  it('has labels for all categories', () => {
    expect(CATEGORY_LABELS.transportation).toBe('Transportation');
    expect(CATEGORY_LABELS.food).toBe('Food & Diet');
    expect(CATEGORY_LABELS.energy).toBe('Energy Usage');
    expect(CATEGORY_LABELS.shopping).toBe('Shopping');
    expect(CATEGORY_LABELS.waste).toBe('Waste');
  });
});

describe('SUBCATEGORY_LABELS', () => {
  it('has labels for common subcategories', () => {
    expect(SUBCATEGORY_LABELS.car_petrol_km).toBe('Car (Petrol)');
    expect(SUBCATEGORY_LABELS.beef_kg).toBe('Beef');
    expect(SUBCATEGORY_LABELS.electricity_kwh).toBe('Electricity');
    expect(SUBCATEGORY_LABELS.clothing_item).toBe('Clothing');
    expect(SUBCATEGORY_LABELS.landfill_kg).toBe('Landfill Waste');
  });
});
