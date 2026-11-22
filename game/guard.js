// guard.js — patrol guards with a vision cone. They walk waypoints, turn at each one,
// and chase the thief when the alarm is high. Line of sight is blocked by walls.
export const GUARD_RANGE = 230;
export const GUARD_HALF_ANGLE = 0.61; // ~35 degrees each side

/** True when the segment (x1,y1)-(x2,y2) crosses any wall rectangle. */
export function segmentBlockedByWalls(x1, y1, x2, y2, walls) {
  for (const w of walls) {
    if (segmentHitsRect(x1, y1, x2, y2, w)) return true;
  }
  return false;
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  // Slab test: does the segment enter the rectangle?
  const dx = x2 - x1, dy = y2 - y1;
  let t0 = 0, t1 = 1;
  for (const [p, q, min, max] of [[dx, x1, r.x, r.x + r.w], [dy, y1, r.y, r.y + r.h]]) {
    if (Math.abs(p) < 1e-9) { if (q < min || q > max) return false; }
    else {
      let a = (min - q) / p, b = (max - q) / p;
      if (a > b) [a, b] = [b, a];
      t0 = Math.max(t0, a); t1 = Math.min(t1, b);
      if (t0 > t1) return false;
    }
  }
  return true;
}

/** Angle from (ax,ay) to (bx,by), normalised to (-PI, PI]. */
export function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

export class Guard {
  constructor(def) {
    this.path = def.path;
    this.speed = def.speed;
    this.x = def.path[0][0]; this.y = def.path[0][1];
    this.target = 1 % def.path.length;
    this.angle = angleTo(this.x, this.y, def.path[this.target][0], def.path[this.target][1]);
    this.state = 'patrol'; // patrol | suspicious | chase
    this.chaseTime = 0;
    this.pause = 0;
  }

  /** Can this guard see the thief right now? Cone + range + line of sight. */
  seesPlayer(px, py, walls) {
    const dx = px - this.x, dy = py - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > GUARD_RANGE) return false;
    if (Math.abs(angleDiff(angleTo(this.x, this.y, px, py), this.angle)) > GUARD_HALF_ANGLE) return false;
    return !segmentBlockedByWalls(this.x, this.y, px, py, walls);
  }

  update(dt, player, walls, alarmValue, ignored = false) {
    const sees = ignored ? false : this.seesPlayer(player.x, player.y, walls);
    if (sees) this.state = alarmValue > 55 ? 'chase' : 'suspicious';
    else if (this.state === 'chase') { this.chaseTime -= dt; if (this.chaseTime <= 0) this.state = 'patrol'; }
    else if (this.state === 'suspicious' && alarmValue < 20) this.state = 'patrol';

    if (this.state === 'chase') {
      this.chaseTime = 2.5;
      const a = angleTo(this.x, this.y, player.x, player.y);
      this.angle = a;
      const step = this.speed * 1.45 * dt;
      const nx = this.x + Math.cos(a) * step, ny = this.y + Math.sin(a) * step;
      if (!pointInWalls(nx, this.y, walls)) this.x = nx;
      if (!pointInWalls(this.x, ny, walls)) this.y = ny;
      return sees;
    }

    // Patrol: walk to the next waypoint, pause and look around at each one.
    if (this.pause > 0) {
      this.pause -= dt;
      this.angle += Math.sin(performance.now() / 900 + this.x) * 0.4 * dt;
      return sees;
    }
    const [tx, ty] = this.path[this.target];
    const a = angleTo(this.x, this.y, tx, ty);
    this.angle += angleDiff(a, this.angle) * Math.min(1, 8 * dt);
    const step = this.speed * dt;
    this.x += Math.cos(a) * step; this.y += Math.sin(a) * step;
    if (Math.hypot(tx - this.x, ty - this.y) < 8) {
      this.target = (this.target + 1) % this.path.length;
      this.pause = 1.1;
    }
    return sees;
  }
}

export function pointInWalls(x, y, walls) {
  return walls.some((w) => x > w.x && x < w.x + w.w && y > w.y && y < w.y + w.h);
}

/** Points of the guard's vision cone polygon (for rendering). */
export function guardConePoints(guard) {
  const pts = [{ x: guard.x, y: guard.y }];
  const steps = 14;
  for (let i = 0; i <= steps; i++) {
    const a = guard.angle - GUARD_HALF_ANGLE + (2 * GUARD_HALF_ANGLE * i) / steps;
    pts.push({ x: guard.x + Math.cos(a) * GUARD_RANGE, y: guard.y + Math.sin(a) * GUARD_RANGE });
  }
  return pts;
}
