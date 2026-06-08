// Simple synthesis of playful retro/anime RPG chiptunes using Web Audio API!
// This operates client-side only without external dependencies.

class SfxEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a simple high pitch laser/chime sound for successes and logs
  playLogSfx() {
    try {
      this.init();
      const ctx = this.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('Audio synthesis disabled or blocked by browser policies', e);
    }
  }

  // Cute ascending arpeggio for leveling up or completing challenges
  playLevelUpSfx() {
    try {
      this.init();
      const ctx = this.ctx;
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      const startTime = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // High priority square wave chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);

        gain.gain.setValueAtTime(0.08, startTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime + idx * 0.08);
        osc.stop(startTime + idx * 0.08 + 0.3);
      });
    } catch (e) {
      console.warn('Audio synthesis level-up block', e);
    }
  }

  // Negative sound for resets or deletes
  playDeleteSfx() {
    try {
      this.init();
      const ctx = this.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(330, ctx.currentTime); // E4
      osc.frequency.linearRampToValueAtTime(165, ctx.currentTime + 0.3); // E3

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // ignore
    }
  }
}

export const sfx = new SfxEngine();
