/**
 * Tổng hợp âm thanh Arcade & Giai điệu lễ hội 20/11 bằng Web Audio API.
 * Không phụ thuộc file MP3 bên ngoài nên không bao giờ lỗi thiếu asset.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private isFestive = false;
  private bgmTimer: number | null = null;
  private noteIndex = 0;

  // Giai điệu arcade nhẹ nhàng
  private readonly normalMelody = [261.63, 329.63, 392.0, 329.63, 293.66, 349.23, 440.0, 392.0];
  // Giai điệu lễ hội vui tươi khi bật Easter Egg 20/11
  private readonly festiveMelody = [523.25, 587.33, 659.25, 783.99, 659.25, 783.99, 880.0, 1046.5];

  private ensureContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public setFestiveMode(festive: boolean): void {
    this.isFestive = festive;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBgm();
    }
    return this.isMuted;
  }

  public startBgm(): void {
    if (this.bgmTimer !== null || this.isMuted) return;
    this.bgmTimer = window.setInterval(() => {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const melody = this.isFestive ? this.festiveMelody : this.normalMelody;
      const freq = melody[this.noteIndex % melody.length];
      this.noteIndex++;
      this.playTone(freq, 0.14, this.isFestive ? 'triangle' : 'sine', 0.035);
    }, 320);
  }

  public stopBgm(): void {
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  public playShoot(): void {
    this.playTone(this.isFestive ? 760 : 620, 0.07, 'triangle', 0.04, 920);
  }

  public playBugExplode(): void {
    this.playTone(220, 0.12, 'sawtooth', 0.05, 85);
  }

  public playPlayerHit(): void {
    this.playTone(150, 0.22, 'square', 0.07, 60);
  }

  public playBossWarning(): void {
    this.playTone(180, 0.28, 'sawtooth', 0.06, 120);
  }

  public playVictory(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      window.setTimeout(() => {
        this.playTone(n, 0.22, 'triangle', 0.07);
      }, idx * 120);
    });
  }

  public playPickup(isLife = false): void {
    this.playTone(isLife ? 880 : 680, 0.1, 'sine', 0.06, isLife ? 1180 : 880);
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    endFreq?: number
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }
}

