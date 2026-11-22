// render.js — everything the eye sees: the night gallery, cones of danger,
// glowing loot, the thief, and the HUD with its alarm meter. Canvas 2D only.
import { LOOT_TYPES } from './loot.js';
import { guardConePoints } from './guard.js';
import { cameraConePoints } from './camera.js';

const W = 1280, H = 720;

function label(ctx, text, x, y, color = '#fff', size = 13) {
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color; ctx.fillText(text, x, y);
}

function cone(ctx, pts, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke();
}

function drawFloor(ctx, game) {
  ctx.fillStyle = '#141a2e'; ctx.fillRect(0, 64, W, H - 64);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)'; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 64) { ctx.beginPath(); ctx.moveTo(x, 64); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 64; y <= H; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  // Crimson carpet runner down the middle of the hall.
  ctx.fillStyle = 'rgba(150,30,45,0.35)'; ctx.fillRect(560, 64, 160, H - 64);
  ctx.strokeStyle = 'rgba(255,209,102,0.5)'; ctx.lineWidth = 2;
  ctx.strokeRect(560, 64, 160, H - 64);
}

function drawWalls(ctx, level) {
  for (const w of level.walls) {
    ctx.fillStyle = '#2c3554'; ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#3d4a70'; ctx.fillRect(w.x, w.y, w.w, 5);
    ctx.strokeStyle = '#0b0e1a'; ctx.lineWidth = 2; ctx.strokeRect(w.x, w.y, w.w, w.h);
  }
}

function drawExit(ctx, game) {
  const e = game.level.exit;
  const open = game.exitOpen;
  ctx.fillStyle = open ? '#1f7a3a' : '#3a3f55';
  ctx.fillRect(e.x, e.y, e.w, e.h);
  ctx.strokeStyle = open ? '#34c759' : '#8a8f9e'; ctx.lineWidth = 3;
  ctx.strokeRect(e.x, e.y, e.w, e.h);
  ctx.fillStyle = '#0a0c16';
  ctx.beginPath(); ctx.arc(e.x + e.w / 2, e.y + e.h / 2 + 12, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(e.x + e.w / 2 - 3, e.y + e.h / 2 + 12, 6, 18);
  label(ctx, open ? 'GETAWAY — GO!' : 'GETAWAY (LOCKED)', e.x + e.w / 2, e.y - 14, open ? '#34c759' : '#c7cad6', 13);
}

function drawLootPiece(ctx, piece, clock) {
  const t = LOOT_TYPES[piece.type];
  const bob = Math.sin(clock * 2 + piece.bob) * 3;
  const x = piece.x, y = piece.y + bob;
  const glow = 0.5 + 0.3 * Math.sin(clock * 3 + piece.bob);
  ctx.beginPath(); ctx.arc(x, y, t.r + 10, 0, Math.PI * 2);
  ctx.fillStyle = t.color; ctx.globalAlpha = 0.14 + glow * 0.12; ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = t.color; ctx.strokeStyle = '#0a0c16'; ctx.lineWidth = 2;
  if (piece.type === 'vase') {
    ctx.beginPath(); ctx.ellipse(x, y, 9, 13, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillRect(x - 4, y - 18, 8, 7);
  } else if (piece.type === 'painting') {
    ctx.fillRect(x - 13, y - 10, 26, 20); ctx.strokeRect(x - 13, y - 10, 26, 20);
    ctx.fillStyle = '#7a5c2e'; ctx.fillRect(x - 8, y - 5, 16, 10);
  } else if (piece.type === 'gem') {
    ctx.beginPath(); ctx.moveTo(x, y - 13); ctx.lineTo(x + 11, y); ctx.lineTo(x, y + 13); ctx.lineTo(x - 11, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else { // crown
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 10); ctx.lineTo(x - 14, y - 6); ctx.lineTo(x - 7, y + 2);
    ctx.lineTo(x, y - 12); ctx.lineTo(x + 7, y + 2); ctx.lineTo(x + 14, y - 6); ctx.lineTo(x + 14, y + 10);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  }
  label(ctx, `$${t.value} ${t.label.toUpperCase()}`, x, y - 26, t.color, 11);
}

function drawGuard(ctx, guard, clock) {
  const pts = guardConePoints(guard);
  const hot = guard.state !== 'patrol';
  cone(ctx, pts, hot ? 'rgba(255,59,48,0.20)' : 'rgba(255,149,0,0.14)', hot ? 'rgba(255,59,48,0.55)' : 'rgba(255,149,0,0.4)');
  // Body: navy uniform, cap, facing wedge.
  ctx.fillStyle = '#2f4b8f'; ctx.strokeStyle = '#0a0c16'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(guard.x, guard.y, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1c2f5e';
  ctx.beginPath(); ctx.arc(guard.x, guard.y - 4, 11, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.moveTo(guard.x, guard.y);
  ctx.lineTo(guard.x + Math.cos(guard.angle - 0.5) * 15, guard.y + Math.sin(guard.angle - 0.5) * 15);
  ctx.lineTo(guard.x + Math.cos(guard.angle + 0.5) * 15, guard.y + Math.sin(guard.angle + 0.5) * 15);
  ctx.closePath(); ctx.fillStyle = '#d7dce8'; ctx.fill();
  if (hot) label(ctx, guard.state === 'chase' ? '!' : '?', guard.x, guard.y - 30, '#ff3b30', 22);
  label(ctx, 'GUARD', guard.x, guard.y + 28, '#c7cad6', 11);
}

function drawCamera(ctx, cam) {
  const disabled = cam.disabled;
  if (!disabled) {
    cone(ctx, cameraConePoints(cam), 'rgba(255,209,102,0.13)', 'rgba(255,209,102,0.45)');
  }
  ctx.fillStyle = disabled ? '#555a6e' : '#8a6d1f'; ctx.strokeStyle = '#0a0c16'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cam.x, cam.y, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = disabled ? '#888' : '#ff3b30';
  ctx.beginPath(); ctx.arc(cam.x + Math.cos(cam.angle) * 6, cam.y + Math.sin(cam.angle) * 6, 3.5, 0, Math.PI * 2); ctx.fill();
  label(ctx, disabled ? 'CCTV — EMP OFF' : 'CCTV', cam.x, cam.y + 26, disabled ? '#9aa0b5' : '#ffd60a', 11);
}

function drawPlayer(ctx, player, tools) {
  for (const p of player.trail) {
    ctx.globalAlpha = Math.max(0, 0.25 - p.t * 0.25);
    ctx.fillStyle = '#8a8f9e';
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (tools.smokeActive) {
    ctx.fillStyle = 'rgba(180,185,200,0.55)';
    ctx.beginPath(); ctx.arc(player.x, player.y, 34, 0, Math.PI * 2); ctx.fill();
    label(ctx, 'SMOKE', player.x, player.y - 40, '#e8eaf0', 11);
  }
  // Hooded thief: charcoal cloak, gold mask slit, facing wedge.
  ctx.fillStyle = tools.disguiseActive ? '#5e6b7a' : '#1f2433';
  ctx.strokeStyle = '#ffd60a'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(player.x, player.y, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x + Math.cos(player.face - 0.45) * 15, player.y + Math.sin(player.face - 0.45) * 15);
  ctx.lineTo(player.x + Math.cos(player.face + 0.45) * 15, player.y + Math.sin(player.face + 0.45) * 15);
  ctx.closePath(); ctx.fillStyle = '#ffd60a'; ctx.fill();
  label(ctx, tools.disguiseActive ? 'VESPER (DISGUISED)' : 'VESPER — THE THIEF', player.x, player.y + 30, '#ffd60a', 11);
}

function drawHud(ctx, game) {
  ctx.fillStyle = '#0d1020'; ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = '#ffd60a'; ctx.font = 'bold 17px system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('MIDNIGHT GALLERY HEIST', 14, 20);
  ctx.fillStyle = '#c7cad6'; ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(game.level.name, 14, 44);
  // Alarm meter — the big one, centre top.
  const ax = 430, ay = 14, aw = 300, ah = 22;
  ctx.fillStyle = '#000'; ctx.fillRect(ax - 2, ay - 2, aw + 4, ah + 4);
  ctx.fillStyle = '#22263a'; ctx.fillRect(ax, ay, aw, ah);
  ctx.fillStyle = game.alarm.color; ctx.fillRect(ax, ay, aw * (game.alarm.value / 100), ah);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.strokeRect(ax, ay, aw, ah);
  label(ctx, `ALARM ${Math.round(game.alarm.value)}% — ${game.alarm.level}`, ax + aw / 2, ay + ah / 2 + 0, '#fff', 12);
  ctx.fillStyle = '#c7cad6'; ctx.font = '13px system-ui, sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(`LOOT $${game.stolen} / $${game.level.quota}  •  SCORE ${game.score}  •  COINS ${game.tools.coins}`, 760, 20);
  ctx.fillText(`TIME ${Math.max(0, Math.ceil(game.timeLeft))}s  •  LIVES ${'♥'.repeat(game.lives)}${'♡'.repeat(Math.max(0, 3 - game.lives))}`, 760, 44);
  // Tool slots.
  const tools = [
    ['E', 'EMP', 100, game.tools.left('emp')],
    ['Q', 'SMOKE', 75, game.tools.left('smoke')],
    ['F', 'DISGUISE', 150, game.tools.left('disguise')],
  ];
  let tx = 1064;
  for (const [key, name, cost, left] of tools) {
    const afford = game.tools.coins >= cost;
    ctx.fillStyle = left > 0 ? '#1f7a3a' : afford ? '#2c3554' : '#1a1d2c';
    ctx.fillRect(tx, 10, 64, 44); ctx.strokeStyle = '#555a6e'; ctx.strokeRect(tx, 10, 64, 44);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(`${key} ${name}`, tx + 32, 26);
    ctx.fillStyle = left > 0 ? '#7dffa8' : '#ffd60a'; ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(left > 0 ? `${left.toFixed(0)}s` : `${cost}c`, tx + 32, 44);
    tx += 70;
  }
}

function overlay(ctx, title, lines, color = '#ffd60a') {
  ctx.fillStyle = 'rgba(5,7,15,0.82)'; ctx.fillRect(0, 64, W, H - 64);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = color; ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.fillText(title, W / 2, 250);
  ctx.fillStyle = '#e8eaf0'; ctx.font = '17px system-ui, sans-serif';
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 310 + i * 30));
}

/** Draw one frame of the whole game. */
export function drawGame(ctx, game) {
  ctx.clearRect(0, 0, W, H);
  drawFloor(ctx, game);
  drawWalls(ctx, game.level);
  drawExit(ctx, game);
  for (const piece of game.loot) if (!piece.taken) drawLootPiece(ctx, piece, game.clock);
  for (const cam of game.cameras) drawCamera(ctx, cam);
  for (const guard of game.guards) drawGuard(ctx, guard, game.clock);
  drawPlayer(ctx, game.player, game.tools);
  drawHud(ctx, game);
  if (game.state === 'menu') {
    overlay(ctx, 'MIDNIGHT GALLERY HEIST', [
      "Vesper steals the Crown of Vesper from a guarded night gallery.",
      'WASD / arrows to sneak — click to walk there — SHIFT to sprint.',
      'Stay out of guard cones (orange) and CCTV cones (gold). Seen = alarm rises.',
      'Grab loot to fill the quota, then slip out the GETAWAY door.',
      'Tools cost coins:  [E] EMP blinds cameras 6s  •  [Q] Smoke hides you 4s  •  [F] Disguise fools guards 5s',
      '3 rooms, 3 lives. Press ENTER or click to begin the heist.',
    ]);
  } else if (game.state === 'caught') {
    overlay(ctx, 'CAUGHT!', [
      game.caughtReason || 'The alarm hit 100%.',
      `Lives left: ${game.lives} — Score: ${game.score}`,
      'Press R to retry this room, or ENTER to restart the whole heist.',
    ], '#ff3b30');
  } else if (game.state === 'gameover') {
    overlay(ctx, 'THE HEIST FAILED', [
      `Final score: ${game.score} — the gallery keeps its gold tonight.`,
      'Press ENTER to try again.',
    ], '#ff3b30');
  } else if (game.state === 'levelclear') {
    overlay(ctx, 'ROOM CLEARED!', [
      `${game.level.name} — loot secured, no alarm raised past the point of no return.`,
      `Time bonus banked. Score: ${game.score}`,
      'Press ENTER for the next room.',
    ], '#34c759');
  } else if (game.state === 'win') {
    overlay(ctx, 'THE PERFECT HEIST', [
      'Every room emptied. The Crown of Vesper is yours.',
      `Final score: ${game.score}  •  Loot stolen: $${game.totalStolen}`,
      'Press ENTER to run it again, bolder and faster.',
    ], '#ffd60a');
  }
  if (game.flash) {
    ctx.fillStyle = game.flash; ctx.fillRect(0, 64, W, H - 64);
  }
}
