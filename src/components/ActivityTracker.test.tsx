import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityTracker from './ActivityTracker';
import { LoggedActivity, QuizAnswers } from '../types';
import '@testing-library/jest-dom';

vi.mock('../utils/audio', () => ({
  sfx: {
    playLogSfx: vi.fn(),
    playLevelUpSfx: vi.fn(),
    playDeleteSfx: vi.fn(),
  },
}));

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

describe('ActivityTracker Component', () => {
  it('renders presets and interactive logged items', () => {
    render(
      <ActivityTracker
        onAddActivity={vi.fn()}
        onDeleteActivity={vi.fn()}
        activities={mockActivities}
        quizAnswers={mockQuizAnswers}
      />
    );

    // Verify presets are displayed (using regular expression to handle emoji prefix)
    expect(screen.getByText(/Drive Fossil Mount/i)).toBeInTheDocument();
    expect(screen.getByText(/Heavy Meat Meal/i)).toBeInTheDocument();

    // Verify logged activity is in the document
    expect(screen.getByText('Drive petrol car')).toBeInTheDocument();
  });

  it('allows logging custom manual activities', () => {
    const handleAdd = vi.fn();
    render(
      <ActivityTracker
        onAddActivity={handleAdd}
        onDeleteActivity={vi.fn()}
        activities={mockActivities}
        quizAnswers={mockQuizAnswers}
      />
    );

    // Fill out the custom quest input
    const input = screen.getByPlaceholderText(/Type a custom deed/i);
    fireEvent.change(input, { target: { value: 'Biked to the store' } });

    // Click submit button
    const submitBtn = screen.getByRole('button', { name: /Register Spell/i });
    fireEvent.click(submitBtn);

    expect(handleAdd).toHaveBeenCalled();
  });

  it('calls onDeleteActivity when delete button clicked', () => {
    const handleDelete = vi.fn();
    render(
      <ActivityTracker
        onAddActivity={vi.fn()}
        onDeleteActivity={handleDelete}
        activities={mockActivities}
        quizAnswers={mockQuizAnswers}
      />
    );

    const deleteBtn = screen.getByLabelText(/Delete activity: Drive petrol car/i);
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith('act-1');
  });
});
