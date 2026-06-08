import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChibiAvatar from './ChibiAvatar';
import '@testing-library/jest-dom';

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ChibiAvatar', () => {
  describe('Rendering', () => {
    it('renders the avatar heading with the default class name', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      expect(screen.getByRole('heading', { name: /Lil' Moss Sprout/i })).toBeInTheDocument();
    });

    it('renders the HP gauge label', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      expect(screen.getByText(/HP Gauge/i)).toBeInTheDocument();
    });

    it('renders the Novice Sower badge for level 1', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      expect(screen.getAllByText(/Novice Sower/i).length).toBeGreaterThan(0);
    });

    it('renders the Acolyte Warden badge for level 3', () => {
      render(<ChibiAvatar level={3} footprint={5.0} />);
      expect(screen.getAllByText(/Acolyte Warden/i).length).toBeGreaterThan(0);
    });

    it('renders the Arch-Druid Solar Guardian badge for level 5+', () => {
      render(<ChibiAvatar level={5} footprint={5.0} />);
      expect(screen.getAllByText(/Arch-Druid Solar Guardian/i).length).toBeGreaterThan(0);
    });

    it('renders the class selector group', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      expect(screen.getByRole('group', { name: /Select avatar class/i })).toBeInTheDocument();
    });

    it('renders three class selector buttons', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      const classButtons = screen.getAllByRole('button', { name: /Select .* class/i });
      expect(classButtons).toHaveLength(3);
    });

    it('renders the speech bubble with a motivational quote', () => {
      render(<ChibiAvatar level={1} footprint={3.5} />);
      // Low footprint (< 4.0) → positive quote; use getAllByText to avoid multi-match error
      expect(screen.getAllByText(/nature spirits are dancing/i).length).toBeGreaterThan(0);
    });

    it('renders the avatar SVG image element', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      const svgImg = document.querySelector('svg[role="img"]');
      expect(svgImg).toBeInTheDocument();
    });
  });

  describe('Quotes', () => {
    it('shows positive quote for footprint below 4.0', () => {
      render(<ChibiAvatar level={1} footprint={2.0} />);
      // The quote appears in both the speech bubble <p> and the SVG <title>.
      // Query the visible <p> element directly.
      const speechParagraph = document.querySelector('.glass-panel p.font-sans');
      expect(speechParagraph?.textContent).toMatch(/nature spirits are dancing/i);
    });

    it('shows neutral quote for footprint between 4.0 and 7.5', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      const speechParagraph = document.querySelector('.glass-panel p.font-sans');
      expect(speechParagraph?.textContent).toMatch(/air smells clean today/i);
    });

    it('shows warning quote for footprint above 7.5', () => {
      render(<ChibiAvatar level={1} footprint={9.0} />);
      const speechParagraph = document.querySelector('.glass-panel p.font-sans');
      expect(speechParagraph?.textContent).toMatch(/air is dusty/i);
    });
  });

  describe('HP meter', () => {
    it('HP meter has role="meter" with correct aria attributes', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      // Use querySelector since aria-label uses a dynamic useId value
      const meter = document.querySelector('[role="meter"]');
      expect(meter).toBeInTheDocument();
      expect(meter).toHaveAttribute('aria-valuemin', '0');
      expect(meter).toHaveAttribute('aria-valuemax', '100');
    });

    it('HP is higher for lower footprint', () => {
      const { rerender } = render(<ChibiAvatar level={1} footprint={2.0} />);
      const lowFpHp = Number(document.querySelector('[role="meter"]')?.getAttribute('aria-valuenow'));

      rerender(<ChibiAvatar level={1} footprint={10.0} />);
      const highFpHp = Number(document.querySelector('[role="meter"]')?.getAttribute('aria-valuenow'));

      expect(lowFpHp).toBeGreaterThan(highFpHp);
    });

    it('HP is clamped to minimum of 10', () => {
      render(<ChibiAvatar level={1} footprint={100} />);
      const meter = document.querySelector('[role="meter"]');
      expect(Number(meter?.getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(10);
    });

    it('HP is clamped to maximum of 100', () => {
      render(<ChibiAvatar level={1} footprint={0} />);
      const meter = document.querySelector('[role="meter"]');
      expect(Number(meter?.getAttribute('aria-valuenow'))).toBeLessThanOrEqual(100);
    });
  });

  describe('Class switching', () => {
    it('switches to Solar Ranger on button click', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      fireEvent.click(screen.getByRole('button', { name: /Select Solar-Punk Spark/i }));
      expect(screen.getByRole('heading', { name: /Solar-Punk Spark/i })).toBeInTheDocument();
    });

    it('switches to Wind Shaman on button click', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      fireEvent.click(screen.getByRole('button', { name: /Select Wind Whispering Breeze/i }));
      expect(screen.getByRole('heading', { name: /Wind Whispering Breeze/i })).toBeInTheDocument();
    });

    it('can switch back to Forest Sage from another class', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      fireEvent.click(screen.getByRole('button', { name: /Select Solar-Punk Spark/i }));
      fireEvent.click(screen.getByRole('button', { name: /Select Lil' Moss Sprout/i }));
      expect(screen.getByRole('heading', { name: /Lil' Moss Sprout/i })).toBeInTheDocument();
    });

    it('the active class button has aria-pressed="true"', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      fireEvent.click(screen.getByRole('button', { name: /Select Solar-Punk Spark/i }));
      expect(
        screen.getByRole('button', { name: /Select Solar-Punk Spark/i })
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('non-active class buttons have aria-pressed="false"', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      // Forest sage is active by default
      expect(
        screen.getByRole('button', { name: /Select Solar-Punk Spark/i })
      ).toHaveAttribute('aria-pressed', 'false');
    });

    it('persists the selected class to localStorage', () => {
      render(<ChibiAvatar level={1} footprint={5.0} />);
      fireEvent.click(screen.getByRole('button', { name: /Select Solar-Punk Spark/i }));
      expect(localStorage.getItem('ecoquest_avatar_class')).toBe('solar_ranger');
    });

    it('reads saved class from localStorage on mount', () => {
      localStorage.setItem('ecoquest_avatar_class', 'wind_shaman');
      render(<ChibiAvatar level={1} footprint={5.0} />);
      expect(screen.getByRole('heading', { name: /Wind Whispering Breeze/i })).toBeInTheDocument();
    });
  });
});
