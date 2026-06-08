import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardOverview from './DashboardOverview';
import { LoggedActivity } from '../types';
import '@testing-library/jest-dom';

vi.mock('../utils/audio', () => ({
  sfx: {
    playLogSfx: vi.fn(),
    playLevelUpSfx: vi.fn(),
    playDeleteSfx: vi.fn(),
  },
}));

const mockActivities: LoggedActivity[] = [
  {
    id: 'act-1',
    date: '2026-06-08',
    category: 'transport',
    description: 'Drive petrol car',
    amount: 10,
    co2Impact: 1.8,
  },
  {
    id: 'act-2',
    date: '2026-06-08',
    category: 'food',
    description: 'Quest offset: vegan meal',
    amount: 1,
    co2Impact: -2.5,
  },
];

describe('DashboardOverview Component', () => {
  it('renders stats, boss section, and levels correctly', () => {
    const handleNavigate = vi.fn();
    render(
      <DashboardOverview
        activities={mockActivities}
        baselineAnnual={8.5}
        onNavigateToTab={handleNavigate}
      />
    );

    // Verify annual baseline projection exists
    expect(screen.getByText(/Annual CO₂/i)).toBeInTheDocument();

    // Verify player level section is visible
    expect(screen.getByText(/Guardian Level/i)).toBeInTheDocument();

    // Verify boss section elements exist
    expect(screen.getAllByText(/Smog Lord/i).length).toBeGreaterThan(0);
  });

  it('triggers attack boss animation on click', () => {
    render(
      <DashboardOverview
        activities={mockActivities}
        baselineAnnual={8.5}
        onNavigateToTab={vi.fn()}
      />
    );

    const strikeBtn = screen.getByLabelText(/Attack the Smog Lord/i);
    expect(strikeBtn).toBeInTheDocument();
    fireEvent.click(strikeBtn);
  });
});
