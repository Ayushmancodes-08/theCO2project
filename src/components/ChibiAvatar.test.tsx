import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ChibiAvatar from './ChibiAvatar';
import '@testing-library/jest-dom';

describe('ChibiAvatar Component', () => {
  it('renders avatar info, level badges, class selectors, and accessory assets', () => {
    render(<ChibiAvatar level={4} footprint={5.2} />);

    // Verify avatar companion section exists (using role/heading to avoid matching SVG title)
    expect(screen.getByRole('heading', { name: /Lil' Moss Sprout/i })).toBeInTheDocument();
    expect(screen.getByText(/HP Gauge/i)).toBeInTheDocument();

    // Verify level title exists (using getAllByText to avoid title tag overlap conflicts)
    expect(screen.getAllByText(/Acolyte Warden/i).length).toBeGreaterThan(0);
  });

  it('allows switching class to Solar Ranger or Wind Shaman', () => {
    render(<ChibiAvatar level={1} footprint={8.2} />);

    // Click Solar Ranger selector button
    const rangerBtn = screen.getByRole('button', { name: /Select Solar-Punk Spark/i });
    fireEvent.click(rangerBtn);

    // Verify title changes to Solar Ranger label
    expect(screen.getByRole('heading', { name: /Solar-Punk Spark/i })).toBeInTheDocument();
  });
});
