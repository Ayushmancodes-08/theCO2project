import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingQuiz from './OnboardingQuiz.tsx';
import '@testing-library/jest-dom';

vi.mock('../utils/audio', () => ({
  sfx: {
    playLogSfx: vi.fn(),
    playLevelUpSfx: vi.fn(),
    playDeleteSfx: vi.fn(),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Navigate the quiz from step 1 through the results screen by making the
 * minimum required selections and clicking Next at each step.
 */
async function completeQuiz(onComplete = vi.fn()) {
  render(<OnboardingQuiz onComplete={onComplete} />);

  // Step 1 — Transport
  fireEvent.click(screen.getByText(/Magical Transit/i));
  fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

  // Step 2 — Diet
  await screen.findByText(/2\. Diet Alignment/i);
  fireEvent.click(screen.getByText(/Ethereal Vegan/i));
  fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

  // Step 3 — Home Energy
  await screen.findByText(/3\. Home Energy Source/i);
  fireEvent.click(screen.getByText(/100% Solarpunk Solar/i));
  fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

  // Step 4 — Flights
  await screen.findByText(/4\. Annual Flight Frequency/i);
  fireEvent.click(screen.getByText(/Earthy Groundward Habit/i));
  fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

  // Step 5 — Purchases
  await screen.findByText(/5\. Online Shopping Habits/i);
  fireEvent.click(screen.getByText(/Zen Minimalist/i));
  fireEvent.click(screen.getByRole('button', { name: /Calculate my carbon footprint/i }));
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('OnboardingQuiz', () => {
  describe('Step 1 — Transport mode', () => {
    it('renders the step 1 heading on mount', () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      expect(screen.getByText(/1\. Select Commute Mode/i)).toBeInTheDocument();
    });

    it('renders all four transport options', () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      expect(screen.getByText(/Bike or Foot/i)).toBeInTheDocument();
      expect(screen.getByText(/Magical Transit/i)).toBeInTheDocument();
      expect(screen.getByText(/Vortex EV/i)).toBeInTheDocument();
      expect(screen.getByText(/Smoke Generator/i)).toBeInTheDocument();
    });

    it('marks the selected transport option as aria-checked', () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      const transitBtn = screen.getByRole('radio', { name: /Magical Transit/i });
      fireEvent.click(transitBtn);
      expect(transitBtn).toHaveAttribute('aria-checked', 'true');
    });

    it('shows the progress bar with correct step value', () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    });
  });

  describe('Step navigation', () => {
    it('advances to step 2 when Next is clicked on step 1', () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      expect(screen.getByText(/2\. Diet Alignment/i)).toBeInTheDocument();
    });

    it('advances to step 3 from step 2', () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i })); // → 2
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i })); // → 3
      expect(screen.getByText(/3\. Home Energy Source/i)).toBeInTheDocument();
    });

    it('goes back to step 1 from step 2 via the Back button', () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i })); // → 2
      fireEvent.click(screen.getByRole('button', { name: /Go back to previous step/i }));
      expect(screen.getByText(/1\. Select Commute Mode/i)).toBeInTheDocument();
    });

    it('step 1 does not show a Back button', () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      expect(screen.queryByRole('button', { name: /Go back to previous step/i })).not.toBeInTheDocument();
    });

    it('advances to calculation screen (step 6) after completing step 5', async () => {
      await completeQuiz();
      expect(screen.getByText(/Calculating Your Footprint/i)).toBeInTheDocument();
    });
  });

  describe('Step 2 — Diet', () => {
    it('renders all four diet options', async () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      await screen.findByText(/2\. Diet Alignment/i);

      expect(screen.getByText(/Ethereal Vegan/i)).toBeInTheDocument();
      expect(screen.getByText(/Forest Druid Vegetarian/i)).toBeInTheDocument();
      expect(screen.getByText(/Low Meat Omnivore/i)).toBeInTheDocument();
      expect(screen.getByText(/High Meat Behemoth/i)).toBeInTheDocument();
    });

    it('marks selected diet as aria-checked', async () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      await screen.findByText(/2\. Diet Alignment/i);

      const veganBtn = screen.getByRole('radio', { name: /Ethereal Vegan/i });
      fireEvent.click(veganBtn);
      expect(veganBtn).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Step 3 — Home Energy', () => {
    it('renders all three energy options', async () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      await screen.findByText(/3\. Home Energy Source/i);

      expect(screen.getByText(/Solarpunk Solar/i)).toBeInTheDocument();
      expect(screen.getByText(/Leyline Grid Mix/i)).toBeInTheDocument();
      expect(screen.getByText(/Fossil Smoke Combustion/i)).toBeInTheDocument();
    });
  });

  describe('Step 4 — Flights', () => {
    it('renders all three flight frequency options', async () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      for (let i = 0; i < 3; i++) {
        fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      }
      await screen.findByText(/4\. Annual Flight Frequency/i);

      expect(screen.getByText(/Earthy Groundward Habit/i)).toBeInTheDocument();
      expect(screen.getByText(/Periodic Sky Voyager/i)).toBeInTheDocument();
      expect(screen.getByText(/Frequent Air Teleporter/i)).toBeInTheDocument();
    });
  });

  describe('Step 5 — Purchases', () => {
    it('renders all three purchase habit options', async () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      }
      await screen.findByText(/5\. Online Shopping Habits/i);

      expect(screen.getByText(/Zen Minimalist/i)).toBeInTheDocument();
      expect(screen.getByText(/Balanced Consumer/i)).toBeInTheDocument();
      expect(screen.getByText(/Shopaholic Hoarder/i)).toBeInTheDocument();
    });

    it('shows the Calculate Footprint button on step 5', async () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      for (let i = 0; i < 4; i++) {
        fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));
      }
      await screen.findByText(/5\. Online Shopping Habits/i);
      expect(screen.getByRole('button', { name: /Calculate my carbon footprint/i })).toBeInTheDocument();
    });
  });

  describe('Step 6 — Results', () => {
    it('shows the calculating heading immediately on entering step 6', async () => {
      await completeQuiz();
      expect(screen.getByText(/Calculating Your Footprint/i)).toBeInTheDocument();
    });

    it('eventually shows the Enter Dashboard button', async () => {
      await completeQuiz();
      const btn = await screen.findByRole('button', { name: /Enter EcoQuest RPG Dashboard/i }, { timeout: 3000 });
      expect(btn).toBeInTheDocument();
    });

    it('calls onComplete with correct answer shape when Enter Dashboard is clicked', async () => {
      const handleComplete = vi.fn();
      await completeQuiz(handleComplete);
      const btn = await screen.findByRole('button', { name: /Enter EcoQuest RPG Dashboard/i }, { timeout: 3000 });
      fireEvent.click(btn);
      expect(handleComplete).toHaveBeenCalledOnce();
      expect(handleComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          transportMode: 'transit',
          dietType: 'vegan',
          homeEnergy: 'renewable',
          flightFrequency: 'low',
          purchaseHabit: 'low',
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('has a progressbar with correct aria-valuemax', () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '5');
    });

    it('each step fieldset has a sr-only legend', () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      const legend = document.querySelector('fieldset legend');
      expect(legend).toBeInTheDocument();
    });

    it('the form container has an aria-label', () => {
      render(<OnboardingQuiz onComplete={vi.fn()} />);
      expect(screen.getByRole('form', { name: /Onboarding quiz/i })).toBeInTheDocument();
    });
  });
});
