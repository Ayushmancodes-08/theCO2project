import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardOverview from './DashboardOverview';
import type { LoggedActivity } from '../types';
import '@testing-library/jest-dom';

vi.mock('../utils/audio', () => ({
  sfx: {
    playLogSfx:     vi.fn(),
    playLevelUpSfx: vi.fn(),
    playDeleteSfx:  vi.fn(),
  },
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const emptyActivities: LoggedActivity[] = [];

const mixedActivities: LoggedActivity[] = [
  { id: 'a1', date: '2026-06-08', category: 'transport', description: 'Car trip',      amount: 10, co2Impact: 1.8  },
  { id: 'a2', date: '2026-06-08', category: 'food',      description: 'Meat meal',      amount: 1,  co2Impact: 7.2  },
  { id: 'a3', date: '2026-06-08', category: 'energy',    description: 'Home energy',    amount: 10, co2Impact: 4.2  },
  { id: 'a4', date: '2026-06-08', category: 'purchases', description: 'Online order',   amount: 1,  co2Impact: 0.8  },
  { id: 'a5', date: '2026-06-08', category: 'food',      description: 'Quest: vegan',   amount: 1,  co2Impact: -8.5 },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('DashboardOverview', () => {
  describe('Rendering', () => {
    it('renders the Player Scoreboard heading', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getByText(/Player Scoreboard/i)).toBeInTheDocument();
    });

    it('renders the Guardian Level indicator', () => {
      render(
        <DashboardOverview
          activities={mixedActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getByText(/Guardian Level/i)).toBeInTheDocument();
    });

    it('renders the Annual CO₂ metric card', () => {
      render(
        <DashboardOverview
          activities={mixedActivities}
          baselineAnnual={8.5}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getByText(/Annual CO₂/i)).toBeInTheDocument();
    });

    it('falls back to baselineAnnual when activities produce no positive co2', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={6.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getByText(/6\.0/)).toBeInTheDocument();
    });

    it('renders the Smog Lord Boss Battle section', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getAllByText(/Smog Lord/i).length).toBeGreaterThan(0);
    });

    it('renders the Solarpunk Sanctuary Garden section', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getByText(/Solarpunk Sanctuary Garden/i)).toBeInTheDocument();
    });

    it('renders the global emission gauge section', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getByText(/Global Safe Emission Boundary/i)).toBeInTheDocument();
    });

    it('renders the emissions distribution donut chart section', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getByText(/Emissions Distribution/i)).toBeInTheDocument();
    });

    it('renders the streak badge with the streakDays prop', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
          streakDays={7}
        />
      );
      expect(screen.getByLabelText(/7 day login streak/i)).toBeInTheDocument();
    });

    it('renders the default streak of 12 when prop is omitted', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getByLabelText(/12 day login streak/i)).toBeInTheDocument();
    });
  });

  describe('XP and Level calculation', () => {
    it('shows higher level when there are many completed challenge offsets', () => {
      // 45 + 10*85 = 895 XP → floor(895/100)+1 = 9
      const manyOffsets: LoggedActivity[] = Array.from({ length: 10 }, (_, i) => ({
        id:          `offset-${i}`,
        date:        '2026-06-08',
        category:    'food' as const,
        description: 'Quest reward',
        amount:      1,
        co2Impact:   -10,
      }));

      render(
        <DashboardOverview
          activities={manyOffsets}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getByText(/Guardian Level 9/i)).toBeInTheDocument();
    });

    it('starts at level 1 with no activities', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      // 45 XP → level = floor(45/100)+1 = 1
      expect(screen.getByText(/Guardian Level 1/i)).toBeInTheDocument();
    });
  });

  describe('Boss Battle', () => {
    it('renders the attack button with an accessible label', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getByLabelText(/Attack the Smog Lord/i)).toBeInTheDocument();
    });

    it('does not throw when attack button is clicked', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(() => fireEvent.click(screen.getByLabelText(/Attack the Smog Lord/i))).not.toThrow();
    });

    it('shows defeated state when bossHp reaches 0 (many offsets)', () => {
      // 300 offsets × 15 each = 4500 reduction → boss at max(0, 300 + 0 - 4500) = 0
      const massiveOffsets: LoggedActivity[] = Array.from({ length: 300 }, (_, i) => ({
        id:          `big-offset-${i}`,
        date:        '2026-06-08',
        category:    'transport' as const,
        description: 'Big offset',
        amount:      1,
        co2Impact:   -10,
      }));

      render(
        <DashboardOverview
          activities={massiveOffsets}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getAllByText(/DEFEATED/i).length).toBeGreaterThan(0);
    });
  });

  describe('Navigation', () => {
    it('calls onNavigateToTab with "trend" when Logs Trend button is clicked', () => {
      const handleNavigate = vi.fn();
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={handleNavigate}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /View 30-day emission trend/i }));
      expect(handleNavigate).toHaveBeenCalledWith('trend');
    });

    it('calls onNavigateToTab with "tracker" when activity shortcut is clicked', () => {
      const handleNavigate = vi.fn();
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={handleNavigate}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Go to Quest Logger to track commute/i }));
      expect(handleNavigate).toHaveBeenCalledWith('tracker');
    });

    it('calls onNavigateToTab with "challenges" when weekly quest shortcut is clicked', () => {
      const handleNavigate = vi.fn();
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={handleNavigate}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Go to Guild Quests/i }));
      expect(handleNavigate).toHaveBeenCalledWith('challenges');
    });
  });

  describe('Accessibility', () => {
    it('XP progress bar has correct aria attributes', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      const xpBar = screen.getByRole('progressbar', { name: /XP progress to next level/i });
      expect(xpBar).toHaveAttribute('aria-valuemin', '0');
      expect(xpBar).toHaveAttribute('aria-valuemax', '100');
    });

    it('boss HP meter has correct aria attributes', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      const meters = screen.getAllByRole('meter');
      expect(meters.length).toBeGreaterThan(0);
    });

    it('garden list has an accessible label', () => {
      render(
        <DashboardOverview
          activities={emptyActivities}
          baselineAnnual={5.0}
          onNavigateToTab={vi.fn()}
        />
      );
      expect(screen.getByRole('list', { name: /Unlocked garden items/i })).toBeInTheDocument();
    });
  });
});
