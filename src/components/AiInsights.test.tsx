import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AiInsights from './AiInsights';
import type { QuizAnswers, LoggedActivity } from '../types';
import '@testing-library/jest-dom';

vi.mock('../utils/audio', () => ({
  sfx: {
    playLogSfx:     vi.fn(),
    playLevelUpSfx: vi.fn(),
    playDeleteSfx:  vi.fn(),
  },
}));

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

const mockQuizAnswers: QuizAnswers = {
  commuteDistance:  10,
  transportMode:    'car_ice',
  dietType:         'meat_heavy',
  homeEnergy:       'coal_gas',
  flightFrequency:  'moderate',
  purchaseHabit:    'high',
};

const mockActivities: LoggedActivity[] = [
  { id: 'a1', date: '2026-06-08', category: 'transport', description: 'Car trip',   amount: 10, co2Impact: 1.8 },
  { id: 'a2', date: '2026-06-08', category: 'food',      description: 'Meat meal',  amount: 1,  co2Impact: 7.2 },
  { id: 'a3', date: '2026-06-08', category: 'energy',    description: 'Home power', amount: 10, co2Impact: 4.2 },
];

/** Mock a successful fetch response for the AI endpoint. */
function mockFetchSuccess(insight = 'Here is your AI insight!') {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok:   true,
    json: () => Promise.resolve({ insight }),
  }));
}

/** Mock a failed fetch response for the AI endpoint. */
function mockFetchError(errorMsg = 'API key not configured.') {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok:   false,
    json: () => Promise.resolve({ error: errorMsg }),
  }));
}

/** Mock a fetch that throws a network error. */
function mockFetchNetworkError() {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network failure')));
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('AiInsights', () => {
  describe('Rendering', () => {
    it('renders the Solar-Punk Chibi Sage heading', () => {
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      expect(screen.getByRole('heading', { name: /Solar-Punk Chibi Sage/i })).toBeInTheDocument();
    });

    it('renders the initial greeting message from the AI', () => {
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      expect(screen.getByText(/Greetings, Solar-Punk Summoner/i)).toBeInTheDocument();
    });

    it('renders all four quick-question pill buttons', () => {
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      expect(screen.getByText(/What's my biggest impact\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Quick win today\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Compare to last week/i)).toBeInTheDocument();
      expect(screen.getByText(/Tips for commuting/i)).toBeInTheDocument();
    });

    it('renders the chat input field', () => {
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      expect(screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i)).toBeInTheDocument();
    });

    it('send button is initially disabled when input is empty', () => {
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      expect(screen.getByRole('button', { name: /Send message to Sage/i })).toBeDisabled();
    });

    it('send button becomes enabled when input has text', () => {
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      fireEvent.change(screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i), {
        target: { value: 'Hello' },
      });
      expect(screen.getByRole('button', { name: /Send message to Sage/i })).not.toBeDisabled();
    });

    it('renders the chat message log region', () => {
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      expect(screen.getByRole('log', { name: /Chat messages/i })).toBeInTheDocument();
    });
  });

  describe('Sending messages', () => {
    it('appends the user message to the chat immediately after sending', async () => {
      mockFetchSuccess();
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);

      fireEvent.change(screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i), {
        target: { value: 'Tell me about transport' },
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Send message to Sage/i }));
      });

      expect(screen.getByText('Tell me about transport')).toBeInTheDocument();
    });

    it('clears the input after sending', async () => {
      mockFetchSuccess();
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);

      const input = screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i);
      fireEvent.change(input, { target: { value: 'Test message' } });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Send message to Sage/i }));
      });

      expect(input).toHaveValue('');
    });

    it('shows the loading indicator while awaiting AI response', async () => {
      // Delay the fetch so we can check loading state
      vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {}))); // never resolves

      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      fireEvent.change(screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i), {
        target: { value: 'Question' },
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Send message to Sage/i }));
      });

      expect(screen.getByText(/Sage is brewing insights/i)).toBeInTheDocument();
    });

    it('appends the AI response after fetch resolves', async () => {
      mockFetchSuccess('Your carbon footprint is improving!');
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);

      fireEvent.change(screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i), {
        target: { value: 'How am I doing?' },
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Send message to Sage/i }));
      });

      await waitFor(() =>
        expect(screen.getByText('Your carbon footprint is improving!')).toBeInTheDocument()
      );
    });

    it('shows an error fallback message on failed fetch', async () => {
      mockFetchError('API key not configured.');
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);

      fireEvent.change(screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i), {
        target: { value: 'Question' },
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Send message to Sage/i }));
      });

      await waitFor(() =>
        expect(screen.getByText(/API key not configured/i)).toBeInTheDocument()
      );
    });

    it('shows network error fallback message on fetch exception', async () => {
      mockFetchNetworkError();
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);

      fireEvent.change(screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i), {
        target: { value: 'Question' },
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Send message to Sage/i }));
      });

      await waitFor(() =>
        expect(screen.getByText(/disruption in the leylines/i)).toBeInTheDocument()
      );
    });

    it('does not send message when input is whitespace only', () => {
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      const input = screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i);
      fireEvent.change(input, { target: { value: '   ' } });
      // Whitespace-only input trims to empty string → button disabled
      const sendBtn = screen.getByRole('button', { name: /Send message to Sage/i });
      expect(sendBtn).toBeDisabled();
    });
  });

  describe('Quick-question pills', () => {
    it('clicking a pill appends its text as a user message in the chat log', async () => {
      mockFetchSuccess();
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Ask: Quick win today/i }));
      });

      // The sent message appears in a user bubble (green background div with aria-label)
      const userBubbles = document.querySelectorAll('[aria-label^="You at"]');
      const texts = Array.from(userBubbles).map((el) => el.getAttribute('aria-label') ?? '');
      expect(texts.some((t) => /Quick win today/i.test(t))).toBe(true);
    });

    it('pill buttons are disabled while a message is loading', async () => {
      vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {}))); // never resolves

      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      fireEvent.change(screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i), {
        target: { value: 'Question' },
      });
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Send message to Sage/i }));
      });

      const pills = screen.getAllByRole('button', { name: /Ask:/i });
      expect(pills.every((p) => p.hasAttribute('disabled'))).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('chat input has an associated label for screen readers', () => {
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      const input = screen.getByPlaceholderText(/Ask your Solarpunk Sage anything/i);
      expect(input).toHaveAttribute('id', 'advisor-chat-input');
      // The sr-only label references this id
      const label = document.querySelector('label[for="advisor-chat-input"]');
      expect(label).toBeInTheDocument();
    });

    it('message log region has aria-live="polite"', () => {
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      const log = screen.getByRole('log');
      expect(log).toHaveAttribute('aria-live', 'polite');
    });

    it('section has aria-label for landmark navigation', () => {
      render(<AiInsights quizAnswers={mockQuizAnswers} activities={mockActivities} />);
      expect(screen.getByRole('region', { name: /AI Sage advisor chat/i })).toBeInTheDocument();
    });
  });

  describe('Empty activities', () => {
    it('renders without crashing when activities array is empty', () => {
      expect(() =>
        render(<AiInsights quizAnswers={mockQuizAnswers} activities={[]} />)
      ).not.toThrow();
    });
  });
});
