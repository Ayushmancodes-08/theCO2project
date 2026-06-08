import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityTracker from './ActivityTracker';
import type { LoggedActivity } from '../types';
import '@testing-library/jest-dom';

vi.mock('../utils/audio', () => ({
  sfx: {
    playLogSfx:    vi.fn(),
    playLevelUpSfx: vi.fn(),
    playDeleteSfx:  vi.fn(),
  },
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockActivities: LoggedActivity[] = [
  {
    id:          'act-1',
    date:        '2026-06-08',
    category:    'transport',
    description: 'Drive petrol car',
    amount:      10,
    co2Impact:   1.8,
  },
  {
    id:          'act-offset-1',
    date:        '2026-06-08',
    category:    'food',
    description: 'Completed Quest: Skip meat for 3 days',
    amount:      1,
    co2Impact:   -8.5,
  },
];

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ActivityTracker', () => {
  describe('Rendering', () => {
    it('renders the page heading', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          activities={[]}
        />
      );
      expect(screen.getByRole('heading', { name: /Record Daily Skirmishes/i })).toBeInTheDocument();
    });

    it('renders all six quick-add preset buttons', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          activities={[]}
        />
      );
      expect(screen.getByText(/Drive Fossil Mount/i)).toBeInTheDocument();
      expect(screen.getByText(/Short-haul Flight/i)).toBeInTheDocument();
      expect(screen.getByText(/Heavy Meat Meal/i)).toBeInTheDocument();
      expect(screen.getByText(/Video Streaming/i)).toBeInTheDocument();
      expect(screen.getByText(/Air Conditioning/i)).toBeInTheDocument();
      expect(screen.getByText(/Package Delivery/i)).toBeInTheDocument();
    });

    it('renders logged activities in the history list', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          onDeleteActivity={vi.fn()}
          activities={mockActivities}
        />
      );
      expect(screen.getByText('Drive petrol car')).toBeInTheDocument();
    });

    it('shows empty state message when activity list is empty', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          activities={[]}
        />
      );
      expect(screen.getByText(/battle history is vacant/i)).toBeInTheDocument();
    });

    it('displays the total activity count badge', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          activities={mockActivities}
        />
      );
      expect(screen.getByText(/2 total entries/i)).toBeInTheDocument();
    });

    it('marks offset activities with Quest Reward badge', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          activities={mockActivities}
        />
      );
      expect(screen.getByText(/Quest Reward/i)).toBeInTheDocument();
    });

    it('does not render delete buttons when onDeleteActivity is not provided', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          activities={mockActivities}
        />
      );
      expect(screen.queryByLabelText(/Delete activity/i)).not.toBeInTheDocument();
    });
  });

  describe('Quick-add Presets', () => {
    it('calls onAddActivity when a preset button is clicked', () => {
      const handleAdd = vi.fn();
      render(
        <ActivityTracker
          onAddActivity={handleAdd}
          activities={[]}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Log Drive Fossil Mount/i }));
      expect(handleAdd).toHaveBeenCalledOnce();
    });

    it('calls onAddActivity with correct category for transport preset', () => {
      const handleAdd = vi.fn();
      render(
        <ActivityTracker
          onAddActivity={handleAdd}
          activities={[]}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Log Drive Fossil Mount/i }));
      expect(handleAdd).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'transport' })
      );
    });

    it('calls onAddActivity with correct category for food preset', () => {
      const handleAdd = vi.fn();
      render(
        <ActivityTracker
          onAddActivity={handleAdd}
          activities={[]}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Log Heavy Meat Meal/i }));
      expect(handleAdd).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'food', co2Impact: 7.2 })
      );
    });

    it('calls onAddActivity with today\'s date', () => {
      const handleAdd = vi.fn();
      const today = new Date().toISOString().split('T')[0];
      render(
        <ActivityTracker
          onAddActivity={handleAdd}
          activities={[]}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: /Log Drive Fossil Mount/i }));
      expect(handleAdd).toHaveBeenCalledWith(
        expect.objectContaining({ date: today })
      );
    });
  });

  describe('Custom Activity Form', () => {
    it('renders the custom text input', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          activities={[]}
        />
      );
      expect(screen.getByPlaceholderText(/Type a custom deed/i)).toBeInTheDocument();
    });

    it('submit button is disabled when input is empty', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          activities={[]}
        />
      );
      expect(screen.getByRole('button', { name: /Submit custom activity/i })).toBeDisabled();
    });

    it('submit button becomes enabled when input has text', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          activities={[]}
        />
      );
      fireEvent.change(screen.getByPlaceholderText(/Type a custom deed/i), {
        target: { value: 'Biked to the store' },
      });
      expect(screen.getByRole('button', { name: /Submit custom activity/i })).not.toBeDisabled();
    });

    it('calls onAddActivity when form is submitted with text', () => {
      const handleAdd = vi.fn();
      render(
        <ActivityTracker
          onAddActivity={handleAdd}
          activities={[]}
        />
      );
      fireEvent.change(screen.getByPlaceholderText(/Type a custom deed/i), {
        target: { value: 'Biked to the store' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Submit custom activity/i }));
      expect(handleAdd).toHaveBeenCalledOnce();
    });

    it('clears input after successful submission', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          activities={[]}
        />
      );
      const input = screen.getByPlaceholderText(/Type a custom deed/i);
      fireEvent.change(input, { target: { value: 'Some activity' } });
      fireEvent.click(screen.getByRole('button', { name: /Submit custom activity/i }));
      expect(input).toHaveValue('');
    });

    it('does not call onAddActivity when input is whitespace only', () => {
      const handleAdd = vi.fn();
      render(
        <ActivityTracker
          onAddActivity={handleAdd}
          activities={[]}
        />
      );
      const input = screen.getByPlaceholderText(/Type a custom deed/i);
      fireEvent.change(input, { target: { value: '   ' } });
      // Submit button is disabled for whitespace-only, but also test form submit directly
      fireEvent.submit(input.closest('form')!);
      expect(handleAdd).not.toHaveBeenCalled();
    });

    it('categorises car-related text as transport', () => {
      const handleAdd = vi.fn();
      render(
        <ActivityTracker
          onAddActivity={handleAdd}
          activities={[]}
        />
      );
      fireEvent.change(screen.getByPlaceholderText(/Type a custom deed/i), {
        target: { value: 'drove my car' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Submit custom activity/i }));
      expect(handleAdd).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'transport' })
      );
    });
  });

  describe('Delete Activity', () => {
    it('calls onDeleteActivity with the correct id', () => {
      const handleDelete = vi.fn();
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          onDeleteActivity={handleDelete}
          activities={mockActivities}
        />
      );
      fireEvent.click(screen.getByLabelText(/Delete activity: Drive petrol car/i));
      expect(handleDelete).toHaveBeenCalledWith('act-1');
    });

    it('renders a delete button for each visible activity', () => {
      render(
        <ActivityTracker
          onAddActivity={vi.fn()}
          onDeleteActivity={vi.fn()}
          activities={mockActivities}
        />
      );
      const deleteBtns = screen.getAllByLabelText(/Delete activity:/i);
      expect(deleteBtns).toHaveLength(mockActivities.length);
    });
  });
});
