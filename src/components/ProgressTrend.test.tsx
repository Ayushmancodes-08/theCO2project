import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressTrend from './ProgressTrend';
import { LoggedActivity } from '../types';
import '@testing-library/jest-dom';

const mockActivities: LoggedActivity[] = [
  {
    id: 'act-1',
    date: '2026-06-08',
    category: 'transport',
    description: 'Drive petrol car',
    amount: 10,
    co2Impact: 1.8,
  },
];

describe('ProgressTrend Component', () => {
  it('renders progress trends, chart container, and breakdown elements', () => {
    render(
      <ProgressTrend
        activities={mockActivities}
        onDeleteActivity={vi.fn()}
      />
    );

    // Verify header title
    expect(screen.getByText(/30-Day Emission Trend/i)).toBeInTheDocument();

    // Verify SVG trend plot summary description exists in sr-only element
    const desc = screen.getByText(/Line chart showing daily CO₂ emissions/i);
    expect(desc).toBeInTheDocument();

    // Verify Category Shares header exists
    expect(screen.getByText(/Category Shares/i)).toBeInTheDocument();

    // Verify World Comparison header exists
    expect(screen.getByText(/World Comparison/i)).toBeInTheDocument();
  });
});
