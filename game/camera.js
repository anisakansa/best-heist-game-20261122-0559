// camera.js — CCTV cameras: fixed to the wall, sweeping a cone back and forth.
// An EMP tool freezes them for a few seconds; otherwise they raise the alarm.
import { angleDiff, angleTo, segmentBlockedByWalls } from './guard.js';

export const CAMERA_RANGE = 270;
export const CAMERA_HALF_ANGLE = 0.5;

export class Camera {
  constructor(def) {
    this.x = def.x; this.y = def.y;
    this.base = def.base; this.sweep = def.sweep; this.speed = def.speed;
    this.angle = def.base;
    this.phase = 0;
    this.disabledUntil = 0; // game clock seconds
  }

  get disabled() { return this.disabledUntil > Camera.now; }
  static now = 0;

  update(dt) {
    this.phase += dt * this.speed;
    this.angle = this.base + Math.sin(this.phase) * this.sweep;
  }

  /** Can this camera see the thief right now? */
  seesPlayer(px, py, walls) {
    if (this.disabled) return false;
    const dist = Math.hypot(px - this.x, py - this.y);
    if (dist > CAMERA_RANGE) return false;
    if (Math.abs(angleDiff(angleTo(this.x, this.y, px, py), this.angle)) > CAMERA_HALF_ANGLE) return false;
    return !segmentBlockedByWalls(this.x, this.y, px, py, walls);
  }
}

/** Points of the camera's vision cone polygon (for rendering). */
export function cameraConePoints(cam) {
  const pts = [{ x: cam.x, y: cam.y }];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const a = cam.angle - CAMERA_HALF_ANGLE + (2 * CAMERA_HALF_ANGLE * i) / steps;
    pts.push({ x: cam.x + Math.cos(a) * CAMERA_RANGE, y: cam.y + Math.sin(a) * CAMERA_RANGE });
  }
  return pts;
}
