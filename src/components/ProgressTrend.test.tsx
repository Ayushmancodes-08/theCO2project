import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProgressTrend from './ProgressTrend';
import type { LoggedActivity } from '../types';
import '@testing-library/jest-dom';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const singleActivity: LoggedActivity[] = [
  {
    id:          'act-1',
    date:        '2026-06-08',
    category:    'transport',
    description: 'Drive petrol car',
    amount:      10,
    co2Impact:   1.8,
  },
];

const multiCategoryActivities: LoggedActivity[] = [
  { id: 'a1', date: '2026-06-08', category: 'transport', description: 'Car trip',         amount: 10, co2Impact: 1.8  },
  { id: 'a2', date: '2026-06-08', category: 'food',      description: 'Meat meal',         amount: 1,  co2Impact: 7.2  },
  { id: 'a3', date: '2026-06-08', category: 'energy',    description: 'Home energy',       amount: 10, co2Impact: 4.2  },
  { id: 'a4', date: '2026-06-08', category: 'purchases', description: 'Online order',      amount: 1,  co2Impact: 0.8  },
  { id: 'a5', date: '2026-06-07', category: 'transport', description: 'Car trip yesterday', amount: 10, co2Impact: 1.8 },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ProgressTrend', () => {
  describe('Rendering', () => {
    it('renders the 30-Day Emission Trend heading', () => {
      render(<ProgressTrend activities={singleActivity} />);
      expect(screen.getByRole('heading', { name: /30-Day Emission Trend/i })).toBeInTheDocument();
    });

    it('renders the accessible chart description for screen readers', () => {
      render(<ProgressTrend activities={singleActivity} />);
      expect(screen.getByText(/Line chart showing daily CO₂ emissions/i)).toBeInTheDocument();
    });

    it('renders the Category Shares section heading', () => {
      render(<ProgressTrend activities={singleActivity} />);
      expect(screen.getByRole('heading', { name: /Category Shares/i })).toBeInTheDocument();
    });

    it('renders the World Comparison section', () => {
      render(<ProgressTrend activities={singleActivity} />);
      expect(screen.getByText(/World Comparison/i)).toBeInTheDocument();
    });

    it('renders all four category labels in the legend', () => {
      render(<ProgressTrend activities={singleActivity} />);
      expect(screen.getAllByText(/Commute & Travel/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Dietary Consumption/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Home Energy/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Material Purchases/i).length).toBeGreaterThan(0);
    });

    it('renders with an empty activities array without crashing', () => {
      expect(() => render(<ProgressTrend activities={[]} />)).not.toThrow();
    });

    it('renders Paris Accord target reference', () => {
      render(<ProgressTrend activities={singleActivity} />);
      expect(screen.getByText(/Paris Accord/i)).toBeInTheDocument();
    });

    it('renders the global average comparison for US and EU', () => {
      render(<ProgressTrend activities={singleActivity} />);
      expect(screen.getByText(/United States avg/i)).toBeInTheDocument();
      expect(screen.getByText(/European Union avg/i)).toBeInTheDocument();
    });

    it('renders the user\'s current score section', () => {
      render(<ProgressTrend activities={multiCategoryActivities} />);
      expect(screen.getByText(/Your current score/i)).toBeInTheDocument();
    });

    it('renders grand total in breakdown description', () => {
      render(<ProgressTrend activities={multiCategoryActivities} />);
      // Total positive co2Impact = 1.8+7.2+4.2+0.8+1.8 = 15.8 kg
      expect(screen.getByText(/15\.8 kg CO₂ logged/i)).toBeInTheDocument();
    });
  });

  describe('Interactive chart data points', () => {
    it('renders 30 interactive data point groups in the SVG chart', () => {
      render(<ProgressTrend activities={singleActivity} />);
      // SVG <g role="button"> elements — query by aria-label attribute directly
      const dataPoints = document.querySelectorAll('[role="button"][aria-label]');
      expect(dataPoints.length).toBe(30);
    });

    it('data point elements have accessible labels with date and kg value', () => {
      render(<ProgressTrend activities={singleActivity} />);
      const dataPoints = document.querySelectorAll('[role="button"][aria-label]');
      // Each should have a label like "Jun 1: 0.0 kg CO₂"
      const firstLabel = dataPoints[0].getAttribute('aria-label') ?? '';
      expect(firstLabel).toMatch(/\d+\.\d+ kg CO₂/);
    });

    it('shows tooltip container when a data point is focused', () => {
      render(<ProgressTrend activities={multiCategoryActivities} />);
      const dataPoints = document.querySelectorAll('[role="button"][aria-label]');
      fireEvent.mouseEnter(dataPoints[dataPoints.length - 1]); // last point has data
      const tooltip = document.querySelector('.pointer-events-none.shadow-xl');
      expect(tooltip).toBeTruthy();
    });

    it('hides tooltip when mouse leaves a data point', () => {
      render(<ProgressTrend activities={singleActivity} />);
      const dataPoints = document.querySelectorAll('[role="button"][aria-label]');
      fireEvent.mouseEnter(dataPoints[0]);
      fireEvent.mouseLeave(dataPoints[0]);
      const tooltip = document.querySelector('.pointer-events-none.shadow-xl');
      expect(tooltip).toBeNull();
    });

    it('activates tooltip on keyboard Enter key', () => {
      render(<ProgressTrend activities={singleActivity} />);
      const dataPoints = document.querySelectorAll('[role="button"][aria-label]');
      fireEvent.keyDown(dataPoints[0], { key: 'Enter' });
      const tooltip = document.querySelector('.pointer-events-none');
      expect(tooltip).toBeTruthy();
    });

    it('activates tooltip on keyboard Space key', () => {
      render(<ProgressTrend activities={singleActivity} />);
      const dataPoints = document.querySelectorAll('[role="button"][aria-label]');
      fireEvent.keyDown(dataPoints[0], { key: ' ' });
      const tooltip = document.querySelector('.pointer-events-none');
      expect(tooltip).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has progressbar roles for category meter bars', () => {
      render(<ProgressTrend activities={multiCategoryActivities} />);
      const meters = screen.getAllByRole('meter');
      expect(meters.length).toBeGreaterThan(0);
    });

    it('chart container has aria-labelledby pointing to sr-only description', () => {
      render(<ProgressTrend activities={singleActivity} />);
      const chartContainer = document.querySelector('[role="img"]');
      expect(chartContainer).toHaveAttribute('aria-labelledby');
    });
  });
});
