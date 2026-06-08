import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

vi.mock('./utils/audio', () => ({
  sfx: {
    playLogSfx: vi.fn(),
    playLevelUpSfx: vi.fn(),
    playDeleteSfx: vi.fn(),
  },
}));

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

describe('App Component Integration Flow', () => {
  it('renders onboarding and transitions to dashboard after complete', async () => {
    render(<App />);

    // Check that OnboardingQuiz is initially rendered (since localStorage is empty)
    expect(screen.getByText(/REALTIME CARBON PORTAL/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Select Commute Mode/i)).toBeInTheDocument();

    // Select transit
    fireEvent.click(screen.getByText(/Magical Transit/i));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Diet step
    expect(screen.getByText(/2. Diet Alignment/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Ethereal Vegan/i));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Home Energy step
    expect(screen.getByText(/3. Home Energy Source/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/100% Solarpunk Solar/i));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Flights step
    expect(screen.getByText(/4. Annual Flight Frequency/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Earthy Groundward Habit/i));
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i }));

    // Purchases step
    expect(screen.getByText(/5. Online Shopping Habits/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Zen Minimalist/i));
    fireEvent.click(screen.getByRole('button', { name: /Calculate my carbon footprint/i }));

    // Calculation splash screen
    expect(screen.getByText(/Calculating Your Footprint/i)).toBeInTheDocument();

    // Simulate completion click (finding button by its correct aria-label)
    const finishBtn = await screen.findByRole('button', { name: /Enter EcoQuest RPG Dashboard/i }, { timeout: 3000 });
    expect(finishBtn).toBeInTheDocument();
    fireEvent.click(finishBtn);

    // Dashboard overview should render now
    expect(screen.getByText(/Annual CO₂/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Scoreboard/i).length).toBeGreaterThan(0);
  });
});
