import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sfx } from './audio';

describe('Audio Sfx Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('runs playLogSfx without throwing when AudioContext is missing/mocked', () => {
    expect(() => sfx.playLogSfx()).not.toThrow();
  });

  it('runs playLevelUpSfx without throwing', () => {
    expect(() => sfx.playLevelUpSfx()).not.toThrow();
  });

  it('runs playDeleteSfx without throwing', () => {
    expect(() => sfx.playDeleteSfx()).not.toThrow();
  });
});
