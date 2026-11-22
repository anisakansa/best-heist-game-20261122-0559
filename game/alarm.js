// alarm.js — the alarm meter: rises while any eye is on the thief, falls in shadow.
// Full meter (100) means caught. The meter is the game's heartbeat.
export class AlarmMeter {
  constructor() { this.value = 0; this.spottedBy = null; }
  reset() { this.value = 0; this.spottedBy = null; }
  /** dt seconds of being seen by `source` ('guard' | 'camera'). */
  rise(dt, source) {
    const rate = source === 'guard' ? 46 : 34;
    this.value = Math.min(100, this.value + rate * dt);
    this.spottedBy = source;
  }
  /** dt seconds hidden: the meter cools down. */
  decay(dt) {
    this.value = Math.max(0, this.value - 13 * dt);
    if (this.value === 0) this.spottedBy = null;
  }
  get full() { return this.value >= 100; }
  /** Human-readable tension level for the HUD. */
  get level() {
    if (this.value >= 75) return 'CAUGHT SOON — HIDE!';
    if (this.value >= 50) return 'SPOTTED — BREAK LINE OF SIGHT';
    if (this.value >= 25) return 'SUSPICIOUS';
    return 'UNSEEN';
  }
  /** Bar colour: calm green, amber, then flashing red. */
  get color() {
    if (this.value >= 75) return '#ff3b30';
    if (this.value >= 50) return '#ff9500';
    if (this.value >= 25) return '#ffd60a';
    return '#34c759';
  }
}
