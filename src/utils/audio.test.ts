/**
 * Audio SFX Engine tests.
 * The Web Audio API is unavailable in jsdom, so we verify the engine
 * handles the missing API gracefully without throwing.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sfx } from './audio';

describe('SfxEngine', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('playLogSfx', () => {
    it('does not throw when AudioContext is unavailable', () => {
      expect(() => sfx.playLogSfx()).not.toThrow();
    });

    it('does not throw when called multiple times in succession', () => {
      expect(() => {
        sfx.playLogSfx();
        sfx.playLogSfx();
        sfx.playLogSfx();
      }).not.toThrow();
    });
  });

  describe('playLevelUpSfx', () => {
    it('does not throw when AudioContext is unavailable', () => {
      expect(() => sfx.playLevelUpSfx()).not.toThrow();
    });

    it('does not throw when called multiple times in succession', () => {
      expect(() => {
        sfx.playLevelUpSfx();
        sfx.playLevelUpSfx();
      }).not.toThrow();
    });
  });

  describe('playDeleteSfx', () => {
    it('does not throw when AudioContext is unavailable', () => {
      expect(() => sfx.playDeleteSfx()).not.toThrow();
    });

    it('does not throw when called multiple times in succession', () => {
      expect(() => {
        sfx.playDeleteSfx();
        sfx.playDeleteSfx();
      }).not.toThrow();
    });
  });

  describe('mixed usage', () => {
    it('can interleave all three sfx methods without error', () => {
      expect(() => {
        sfx.playLogSfx();
        sfx.playLevelUpSfx();
        sfx.playDeleteSfx();
        sfx.playLogSfx();
      }).not.toThrow();
    });
  });
});
