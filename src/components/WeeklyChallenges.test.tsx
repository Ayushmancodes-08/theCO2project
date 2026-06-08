import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeeklyChallenges from './WeeklyChallenges';
import { Challenge } from '../types';
import '@testing-library/jest-dom';

// Mock audio utilities to avoid Web Audio API issues
vi.mock('../utils/audio', () => ({
  sfx: {
    playLogSfx: vi.fn(),
    playLevelUpSfx: vi.fn(),
    playDeleteSfx: vi.fn(),
  },
}));

// Mock image imports
vi.mock('../../assets/eco_commute.png', () => ({ default: 'mock-commute.png' }));
vi.mock('../../assets/eco_diet.png', () => ({ default: 'mock-diet.png' }));
vi.mock('../../assets/eco_laundry.png', () => ({ default: 'mock-laundry.png' }));

const mockChallenges: Challenge[] = [
  {
    id: 'ch-active-commute',
    title: 'Walk instead of drive',
    description: 'Leave the car in the garage for trips under 5 km.',
    category: 'transport',
    co2Savings: 4.2,
    duration: '2 Commutes',
    isAccepted: false,
    isCompleted: false,
  },
  {
    id: 'ch-meatfree',
    title: 'Skip meat for 3 days',
    description: 'Avoid all animal protein for 3 full days.',
    category: 'food',
    co2Savings: 8.5,
    duration: '3 Days',
    isAccepted: true,
    isCompleted: false,
  },
];

describe('WeeklyChallenges Component', () => {
  it('renders active weekly challenges list', () => {
    render(
      <WeeklyChallenges
        challenges={mockChallenges}
        onAcceptChallenge={vi.fn()}
        onCompleteChallenge={vi.fn()}
        totalSaved={10.0}
      />
    );

    // Verify header exists
    expect(screen.getByText('Active Weekly Challenges')).toBeInTheDocument();

    // Verify progress ledger displays total saved CO2
    expect(screen.getByText('10.0 / 25.0 KG CO₂ SAVED')).toBeInTheDocument();
  });

  it('calls onAcceptChallenge when Accept button is clicked', () => {
    const handleAccept = vi.fn();
    render(
      <WeeklyChallenges
        challenges={mockChallenges}
        onAcceptChallenge={handleAccept}
        onCompleteChallenge={vi.fn()}
        totalSaved={0.0}
      />
    );

    const acceptBtn = screen.getByLabelText(/Accept challenge: Walk Instead of Drive/i);
    fireEvent.click(acceptBtn);

    expect(handleAccept).toHaveBeenCalledWith('ch-active-commute');
  });

  it('calls onCompleteChallenge when Claim Reward button is clicked', () => {
    const handleComplete = vi.fn();
    render(
      <WeeklyChallenges
        challenges={mockChallenges}
        onAcceptChallenge={vi.fn()}
        onCompleteChallenge={handleComplete}
        totalSaved={0.0}
      />
    );

    const claimBtn = screen.getByLabelText(/Claim reward for challenge: Skip Meat for 3 Days/i);
    fireEvent.click(claimBtn);

    expect(handleComplete).toHaveBeenCalledWith('ch-meatfree');
  });
});
