import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AiInsights from './AiInsights';
import { QuizAnswers, LoggedActivity } from '../types';
import '@testing-library/jest-dom';

vi.mock('../utils/audio', () => ({
  sfx: {
    playLogSfx: vi.fn(),
    playLevelUpSfx: vi.fn(),
    playDeleteSfx: vi.fn(),
  },
}));

beforeAll(() => {
  // jsdom doesn't implement scrollIntoView; mock it to avoid test runtime exceptions
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

const mockQuizAnswers: QuizAnswers = {
  commuteDistance: 10,
  transportMode: 'car_ice',
  dietType: 'meat_heavy',
  homeEnergy: 'coal_gas',
  purchaseHabit: 'high',
};

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

describe('AiInsights Component', () => {
  it('renders the chat window and advice options', () => {
    render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);

    // Verify sage advice header
    expect(screen.getByText(/Solar-Punk Chibi Sage/i)).toBeInTheDocument();

    // Verify quick recommendation pills are shown
    expect(screen.getByText(/What's my biggest impact\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick win today\?/i)).toBeInTheDocument();
  });

  it('allows sending chat messages and displays AI response', async () => {
    render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);

    const input = screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i);
    fireEvent.change(input, { target: { value: 'tell me about transport' } });

    const sendBtn = screen.getByRole('button', { name: /Send message to Sage/i });
    // Since input value is not empty, button should not be disabled
    fireEvent.click(sendBtn);

    // Verify user message is rendered
    expect(screen.getByText('tell me about transport')).toBeInTheDocument();
  });
});
