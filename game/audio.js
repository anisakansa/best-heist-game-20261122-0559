// audio.js — every sound is synthesized with WebAudio: no audio files, no network.
// Footsteps, loot chimes, the rising alarm, the caught sting and a low night hum.
export class SoundBank {
  constructor() {
    this.ctx = null; this.muted = false; this.humNodes = null; this.stepAt = 0;
  }

  ensure() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  tone(freq, dur, type, vol, slideTo) {
    if (this.muted) return;
    const ctx = this.ensure(); if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t); osc.stop(t + dur);
  }

  step() {
    const now = performance.now();
    if (now - this.stepAt < 260) return;
    this.stepAt = now;
    this.tone(95, 0.07, 'triangle', 0.05, 70);
  }
  lootChime(value) {
    this.tone(660, 0.12, 'sine', 0.16);
    setTimeout(() => this.tone(value >= 500 ? 990 : 880, 0.18, 'sine', 0.16), 90);
  }
  alarmBeep(level) { this.tone(level >= 75 ? 880 : 620, 0.14, 'square', 0.07, level >= 75 ? 660 : 520); }
  caughtSting() { this.tone(220, 0.7, 'sawtooth', 0.18, 55); this.tone(110, 0.9, 'square', 0.1, 40); }
  levelClear() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.22, 'sine', 0.15), i * 110)); }
  winFanfare() { [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => this.tone(f, 0.3, 'triangle', 0.16), i * 130)); }
  denied() { this.tone(160, 0.15, 'square', 0.08, 120); }
  toolPop() { this.tone(440, 0.1, 'sine', 0.14, 880); }

  /** Low ambient hum while playing; call once. */
  startHum() {
    const ctx = this.ensure(); if (!ctx || this.humNodes) return;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = 48;
    gain.gain.value = 0.025;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    this.humNodes = { osc, gain };
  }
}
