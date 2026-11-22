// player.js — Vesper, the thief. Keyboard (WASD / arrows) or click-to-move with the mouse.
// Slides along walls; leaves a faint trail of footsteps when sprinting.
import { pointInWalls } from './guard.js';

export class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.r = 15;
    this.speed = 205;
    this.moveTarget = null; // {x, y} from a mouse click, or null
    this.face = -Math.PI / 2;
    this.moving = false;
    this.trail = [];
  }

  reset(x, y) {
    this.x = x; this.y = y;
    this.moveTarget = null; this.trail = [];
  }

  update(dt, keys, walls) {
    let dx = 0, dy = 0;
    if (keys['arrowup'] || keys['w']) dy -= 1;
    if (keys['arrowdown'] || keys['s']) dy += 1;
    if (keys['arrowleft'] || keys['a']) dx -= 1;
    if (keys['arrowright'] || keys['d']) dx += 1;
    if (dx !== 0 || dy !== 0) this.moveTarget = null;
    else if (this.moveTarget) {
      dx = this.moveTarget.x - this.x; dy = this.moveTarget.y - this.y;
      const d = Math.hypot(dx, dy);
      if (d < 6) { this.moveTarget = null; dx = 0; dy = 0; }
      else { dx /= d; dy /= d; }
    }
    const len = Math.hypot(dx, dy);
    this.moving = len > 0;
    if (!this.moving) return;
    dx /= len; dy /= len;
    const sprint = keys['shift'] ? 1.35 : 1;
    const step = this.speed * sprint * dt;
    const nx = this.x + dx * step, ny = this.y + dy * step;
    if (!pointInWalls(nx, this.y + 0, walls) && !circleHitsWall(nx, this.y, this.r, walls)) this.x = nx;
    if (!circleHitsWall(this.x, ny, this.r, walls)) this.y = ny;
    this.face = Math.atan2(dy, dx);
    this.trail.push({ x: this.x, y: this.y, t: 0 });
    if (this.trail.length > 26) this.trail.shift();
    for (const p of this.trail) p.t += dt;
    this.trail = this.trail.filter((p) => p.t < 0.9);
  }
}

export function circleHitsWall(x, y, r, walls) {
  for (const w of walls) {
    const cx = Math.max(w.x, Math.min(x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(y, w.y + w.h));
    if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) return true;
  }
  return false;
}
