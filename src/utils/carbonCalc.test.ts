import { describe, it, expect } from 'vitest';
import {
  calculateAnnualBaseline,
  generate30DayHistory,
  getTransportLabel,
  getDietLabel,
  getEnergyLabel,
  getPurchaseLabel,
} from './carbonCalc';
import { QuizAnswers } from '../types';

describe('Carbon Calculation Utilities', () => {
  const mockAnswers: QuizAnswers = {
    commuteDistance: 15,
    transportMode: 'car_ice',
    dietType: 'meat_heavy',
    homeEnergy: 'coal_gas',
    purchaseHabit: 'high',
  };

  describe('calculateAnnualBaseline', () => {
    it('calculates baseline correctly based on emission factors', () => {
      // Transport: 15 * 0.18 = 2.7
      // Diet: 7.2
      // Energy: 10 * 0.85 = 8.5
      // Purchases: 15.0
      // Total Daily = 2.7 + 7.2 + 8.5 + 15.0 = 33.4 kg
      // Annual = (33.4 * 365) / 1000 = 12.191 tonnes
      const baseline = calculateAnnualBaseline(mockAnswers);
      expect(baseline).toBeCloseTo(12.191, 3);
    });

    it('handles alternative inputs correctly', () => {
      const altAnswers: QuizAnswers = {
        commuteDistance: 0,
        transportMode: 'bike_walk',
        dietType: 'vegan',
        homeEnergy: 'renewable',
        purchaseHabit: 'low',
      };
      // Transport: 0 * 0 = 0
      // Diet: 1.5
      // Energy: 10 * 0.02 = 0.2
      // Purchases: 2.5
      // Total Daily = 0 + 1.5 + 0.2 + 2.5 = 4.2 kg
      // Annual = (4.2 * 365) / 1000 = 1.533 tonnes
      const baseline = calculateAnnualBaseline(altAnswers);
      expect(baseline).toBeCloseTo(1.533, 3);
    });
  });

  describe('generate30DayHistory', () => {
    it('generates exactly 30 days of activities with correct categories', () => {
      const history = generate30DayHistory(mockAnswers);
      // Since transport distance is > 0, it generates logs for food, energy, purchases, and transport for each of the 30 days.
      // So 30 * 4 = 120 activities.
      expect(history.length).toBe(120);

      const categories = history.map((act) => act.category);
      expect(categories).toContain('transport');
      expect(categories).toContain('food');
      expect(categories).toContain('energy');
      expect(categories).toContain('purchases');
    });

    it('omits transport logs if commute distance is 0', () => {
      const zeroCommuteAnswers = { ...mockAnswers, commuteDistance: 0 };
      const history = generate30DayHistory(zeroCommuteAnswers);
      // Food, energy, purchases only. So 30 * 3 = 90 activities.
      expect(history.length).toBe(90);

      const categories = history.map((act) => act.category);
      expect(categories).not.toContain('transport');
    });
  });

  describe('Label Helpers', () => {
    it('returns correct label for transport modes', () => {
      expect(getTransportLabel('car_ice')).toBe('Gas/Diesel Car');
      expect(getTransportLabel('car_ev')).toBe('Electric Vehicle');
      expect(getTransportLabel('transit')).toBe('Public Transit');
      expect(getTransportLabel('bike_walk')).toBe('Biking / Walking');
      expect(getTransportLabel('unknown')).toBe('Transport');
    });

    it('returns correct label for diet types', () => {
      expect(getDietLabel('meat_heavy')).toBe('Heavy Meat Eater');
      expect(getDietLabel('meat_light')).toBe('Low Meat / Omnivore');
      expect(getDietLabel('vegetarian')).toBe('Vegetarian');
      expect(getDietLabel('vegan')).toBe('Vegan');
      expect(getDietLabel('unknown')).toBe('Diet');
    });

    it('returns correct label for home energy sources', () => {
      expect(getEnergyLabel('coal_gas')).toBe('Fossil Fuel Heavily Centered');
      expect(getEnergyLabel('mix')).toBe('Standard Grid Mix');
      expect(getEnergyLabel('renewable')).toBe('100% Renewable source');
      expect(getEnergyLabel('unknown')).toBe('Grid Mix');
    });

    it('returns correct label for purchase habits', () => {
      expect(getPurchaseLabel('high')).toBe('High Consumer Purchases');
      expect(getPurchaseLabel('moderate')).toBe('Moderate / Thoughtful Consumer');
      expect(getPurchaseLabel('low')).toBe('Minimalist/Low-Impact style');
      expect(getPurchaseLabel('unknown')).toBe('Consumer');
    });
  });
});
