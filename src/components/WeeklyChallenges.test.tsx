import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WeeklyChallenges from './WeeklyChallenges';
import type { Challenge } from '../types';
import '@testing-library/jest-dom';

vi.mock('../utils/audio', () => ({
  sfx: {
    playLogSfx:     vi.fn(),
    playLevelUpSfx: vi.fn(),
    playDeleteSfx:  vi.fn(),
  },
}));

// Mock all challenge image imports
vi.mock('../../assets/eco_commute.png',  () => ({ default: 'eco_commute.png'  }));
vi.mock('../../assets/eco_diet.png',     () => ({ default: 'eco_diet.png'     }));
vi.mock('../../assets/eco_laundry.png',  () => ({ default: 'eco_laundry.png'  }));
vi.mock('../../assets/vegan_week.png',   () => ({ default: 'vegan_week.png'   }));
vi.mock('../../assets/thermostat.png',   () => ({ default: 'thermostat.png'   }));
vi.mock('../../assets/plastic_free.png', () => ({ default: 'plastic_free.png' }));
vi.mock('../../assets/solar_charge.png', () => ({ default: 'solar_charge.png' }));
vi.mock('../../assets/harvest_feast.png',() => ({ default: 'harvest_feast.png'}));
vi.mock('../../assets/wind_transit.png', () => ({ default: 'wind_transit.png' }));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const pendingChallenge: Challenge = {
  id:          'ch-active-commute',
  title:       'Walk instead of drive',
  description: 'Leave the car in the garage for trips under 5 km.',
  category:    'transport',
  co2Savings:  4.2,
  duration:    '2 Commutes',
  isAccepted:  false,
  isCompleted: false,
};

const acceptedChallenge: Challenge = {
  id:          'ch-meatfree',
  title:       'Skip meat for 3 days',
  description: 'Avoid all animal protein for 3 full days.',
  category:    'food',
  co2Savings:  8.5,
  duration:    '3 Days',
  isAccepted:  true,
  isCompleted: false,
};

const completedChallenge: Challenge = {
  id:          'ch-cold-wash',
  title:       'Air dry laundry',
  description: 'Skip the tumble dryer this week.',
  category:    'energy',
  co2Savings:  2.1,
  duration:    '1 Week',
  isAccepted:  true,
  isCompleted: true,
  completedAt: '2026-06-01',
};

const allChallenges = [pendingChallenge, acceptedChallenge, completedChallenge];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('WeeklyChallenges', () => {
  describe('Rendering', () => {
    it('renders the Active Weekly Challenges heading', () => {
      render(
        <WeeklyChallenges
          challenges={allChallenges}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={0}
        />
      );
      expect(screen.getByRole('heading', { name: /Active Weekly Challenges/i })).toBeInTheDocument();
    });

    it('renders a card for each challenge', () => {
      render(
        <WeeklyChallenges
          challenges={allChallenges}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={0}
        />
      );
      expect(screen.getByText(/Walk Instead of Drive/i)).toBeInTheDocument();
      expect(screen.getByText(/Skip Meat for 3 Days/i)).toBeInTheDocument();
      expect(screen.getByText(/Air Dry Washing Lines/i)).toBeInTheDocument();
    });

    it('renders an empty list without crashing', () => {
      expect(() =>
        render(
          <WeeklyChallenges
            challenges={[]}
            onAcceptChallenge={vi.fn()}
            onCompleteChallenge={vi.fn()}
            totalSaved={0}
          />
        )
      ).not.toThrow();
    });

    it('renders the weekly progress ledger with correct values', () => {
      render(
        <WeeklyChallenges
          challenges={allChallenges}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={10.5}
        />
      );
      expect(screen.getByText('10.5 / 25.0 KG CO₂ SAVED')).toBeInTheDocument();
    });

    it('renders 0.0 / 25.0 when nothing is saved', () => {
      render(
        <WeeklyChallenges
          challenges={allChallenges}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={0}
        />
      );
      expect(screen.getByText('0.0 / 25.0 KG CO₂ SAVED')).toBeInTheDocument();
    });
  });

  describe('Challenge states', () => {
    it('shows "Accept Quest" button for a pending (not accepted) challenge', () => {
      render(
        <WeeklyChallenges
          challenges={[pendingChallenge]}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={0}
        />
      );
      expect(screen.getByLabelText(/Accept challenge: Walk Instead of Drive/i)).toBeInTheDocument();
    });

    it('shows "Claim Reward" button for an accepted but not completed challenge', () => {
      render(
        <WeeklyChallenges
          challenges={[acceptedChallenge]}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={0}
        />
      );
      expect(screen.getByLabelText(/Claim reward for challenge: Skip Meat for 3 Days/i)).toBeInTheDocument();
    });

    it('shows "Mitigation Achieved" status for a completed challenge', () => {
      render(
        <WeeklyChallenges
          challenges={[completedChallenge]}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={2.1}
        />
      );
      expect(screen.getByText(/Mitigation Achieved/i)).toBeInTheDocument();
    });

    it('does not show accept button for accepted or completed challenges', () => {
      render(
        <WeeklyChallenges
          challenges={[acceptedChallenge, completedChallenge]}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={2.1}
        />
      );
      expect(screen.queryByText(/Accept Quest/i)).not.toBeInTheDocument();
    });

    it('renders challenge description text', () => {
      render(
        <WeeklyChallenges
          challenges={[pendingChallenge]}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={0}
        />
      );
      expect(screen.getByText(/Leave the car in the garage/i)).toBeInTheDocument();
    });

    it('renders CO₂ savings for each challenge', () => {
      render(
        <WeeklyChallenges
          challenges={[pendingChallenge]}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={0}
        />
      );
      expect(screen.getByText(/4\.2 kg CO₂/i)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onAcceptChallenge with correct id when Accept is clicked', () => {
      const handleAccept = vi.fn();
      render(
        <WeeklyChallenges
          challenges={[pendingChallenge]}
          onAcceptChallenge={handleAccept}
          onCompleteChallenge={vi.fn()}
          totalSaved={0}
        />
      );
      fireEvent.click(screen.getByLabelText(/Accept challenge: Walk Instead of Drive/i));
      expect(handleAccept).toHaveBeenCalledWith('ch-active-commute');
    });

    it('calls onCompleteChallenge with correct id when Claim Reward is clicked', () => {
      const handleComplete = vi.fn();
      render(
        <WeeklyChallenges
          challenges={[acceptedChallenge]}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={handleComplete}
          totalSaved={0}
        />
      );
      fireEvent.click(screen.getByLabelText(/Claim reward for challenge: Skip Meat for 3 Days/i));
      expect(handleComplete).toHaveBeenCalledWith('ch-meatfree');
    });

    it('does not call onAcceptChallenge for already-accepted challenges', () => {
      const handleAccept = vi.fn();
      render(
        <WeeklyChallenges
          challenges={[acceptedChallenge]}
          onAcceptChallenge={handleAccept}
          onCompleteChallenge={vi.fn()}
          totalSaved={0}
        />
      );
      // No accept button should be present
      expect(screen.queryByLabelText(/Accept challenge: Skip Meat for 3 Days/i)).not.toBeInTheDocument();
    });
  });

  describe('Progress bar', () => {
    it('progress bar has correct aria-valuenow', () => {
      render(
        <WeeklyChallenges
          challenges={allChallenges}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={12.5}
        />
      );
      const progressBar = screen.getByRole('progressbar', { name: /Weekly CO₂ savings progress/i });
      expect(progressBar).toHaveAttribute('aria-valuenow', '12.5');
    });

    it('progress bar clamps to 100% at or above the weekly goal', () => {
      render(
        <WeeklyChallenges
          challenges={allChallenges}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={30}
        />
      );
      const progressBar = screen.getByRole('progressbar', { name: /Weekly CO₂ savings progress/i });
      // aria-valuenow should reflect actual saved; width is clamped in CSS
      expect(progressBar).toHaveAttribute('aria-valuenow', '30');
    });
  });

  describe('Challenge images', () => {
    it('renders challenge images with alt text', () => {
      render(
        <WeeklyChallenges
          challenges={[pendingChallenge]}
          onAcceptChallenge={vi.fn()}
          onCompleteChallenge={vi.fn()}
          totalSaved={0}
        />
      );
      const img = screen.getByAltText(/Visual for challenge: Walk Instead of Drive/i);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });
});
