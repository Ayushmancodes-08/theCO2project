import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OnboardingQuiz from './OnboardingQuiz';
import '@testing-library/jest-dom';

vi.mock('../utils/audio', () => ({
  sfx: {
    playLogSfx: vi.fn(),
    playLevelUpSfx: vi.fn(),
    playDeleteSfx: vi.fn(),
  },
}));

describe('OnboardingQuiz Component', () => {
  it('renders onboarding stepper questions and navigates correctly', () => {
    const handleComplete = vi.fn();
    render(<OnboardingQuiz onComplete={handleComplete} />);

    // Step 1: Transport Mode selection
    expect(screen.getByText(/1. Select Commute Mode/i)).toBeInTheDocument();
    
    // Choose public transit option
    const option = screen.getByText(/Magical Transit/i);
    fireEvent.click(option);

    // Click Next
    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn);

    // Step 2: Diet
    expect(screen.getByText(/2. Diet Alignment/i)).toBeInTheDocument();
    const veganOption = screen.getByText(/Ethereal Vegan/i);
    fireEvent.click(veganOption);
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 3: Home Energy
    expect(screen.getByText(/3. Home Energy Source/i)).toBeInTheDocument();
    const solarOption = screen.getByText(/100% Solarpunk Solar/i);
    fireEvent.click(solarOption);
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 4: Flights
    expect(screen.getByText(/4. Annual Flight Frequency/i)).toBeInTheDocument();
    const flightOption = screen.getByText(/Earthy Groundward Habit/i);
    fireEvent.click(flightOption);
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Step 5: Purchases
    expect(screen.getByText(/5. Online Shopping Habits/i)).toBeInTheDocument();
    const minimalistOption = screen.getByText(/Zen Minimalist/i);
    fireEvent.click(minimalistOption);
    fireEvent.click(screen.getByRole('button', { name: /Calculate my carbon footprint/i }));

    // Step 6: Summary / Analysis (Wait for calculation state rendering)
    expect(screen.getByText(/Calculating Your Footprint/i)).toBeInTheDocument();
  });
});
