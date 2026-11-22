// main.js — Midnight Gallery Heist: game state, loop, input and the rules that
// tie guards, cameras, alarm, loot, tools and the getaway together.
import { LEVELS, levelLootTotal } from './level.js';
import { Player } from './player.js';
import { Guard } from './guard.js';
import { Camera } from './camera.js';
import { AlarmMeter } from './alarm.js';
import { ToolBelt } from './tools.js';
import { createLootState, collectLoot, lootValue, stolenValue } from './loot.js';
import { SoundBank } from './audio.js';
import { drawGame } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

export const game = {
  state: 'menu', levelIndex: 0, level: LEVELS[0],
  loot: [], guards: [], cameras: [],
  player: new Player(90, 620),
  alarm: new AlarmMeter(), tools: new ToolBelt(), sound: new SoundBank(),
  score: 0, stolen: 0, totalStolen: 0, lives: 3, timeLeft: 150,
  clock: 0, frozen: false, flash: null, caughtReason: '',
  keys: {},

  get exitOpen() { return this.stolen >= this.level.quota; },

  loadLevel(i) {
    this.levelIndex = i;
    this.level = LEVELS[i];
    this.loot = createLootState(this.level);
    this.guards = this.level.guards.map((g) => new Guard(g));
    this.cameras = this.level.cameras.map((c) => new Camera(c));
    this.player.reset(this.level.playerStart.x, this.level.playerStart.y);
    this.alarm.reset();
    this.stolen = 0;
    this.timeLeft = this.level.time;
    this.flash = null;
  },

  startGame() {
    this.score = 0; this.totalStolen = 0; this.lives = 3;
    this.tools.reset();
    this.loadLevel(0);
    this.state = 'playing';
    this.sound.ensure(); this.sound.startHum();
    announce('Heist started. Stay out of the cones.');
  },

  caught(reason) {
    this.state = 'caught';
    this.caughtReason = reason;
    this.lives -= 1;
    this.score = Math.max(0, this.score - 100);
    this.sound.caughtSting();
    this.flash = 'rgba(255,59,48,0.35)';
    setTimeout(() => { this.flash = null; }, 450);
    announce(`Caught. ${reason} Lives left: ${this.lives}`);
  },
};

function announce(text) { if (statusEl) statusEl.textContent = text; }

function tryTool(name) {
  if (game.state !== 'playing') return;
  if (game.tools.use(name)) {
    game.sound.toolPop();
    if (name === 'emp') for (const cam of game.cameras) cam.disabledUntil = Camera.now + 6;
    announce(`${name.toUpperCase()} used.`);
  } else game.sound.denied();
}

function update(dt) {
  game.clock += dt;
  Camera.now = game.clock;
  ToolBelt.now = game.clock;
  if (game.state !== 'playing' || game.frozen) return;

  game.timeLeft -= dt;
  if (game.timeLeft <= 0) { game.caught('Out of time — the gallery locked down at dawn.'); return; }

  const hidden = game.tools.smokeActive || game.tools.disguiseActive;
  game.player.update(dt, game.keys, game.level.walls);
  if (game.player.moving) game.sound.step();

  let seen = null;
  for (const guard of game.guards) {
    const ignored = game.tools.smokeActive || game.tools.disguiseActive;
    const sees = guard.update(dt, game.player, game.level.walls, game.alarm.value, ignored);
    if (sees) seen = 'guard';
    if (guard.state === 'chase' && Math.hypot(guard.x - game.player.x, guard.y - game.player.y) < 30
      && !game.tools.smokeActive && !game.tools.disguiseActive) {
      game.caught('A guard grabbed Vesper in the open.'); return;
    }
  }
  for (const cam of game.cameras) {
    cam.update(dt);
    if (cam.seesPlayer(game.player.x, game.player.y, game.level.walls) && !game.tools.smokeActive) seen = 'camera';
  }
  const before = game.alarm.value;
  if (seen) game.alarm.rise(dt, seen);
  else game.alarm.decay(dt);
  if (Math.floor(game.alarm.value / 25) > Math.floor(before / 25)) game.sound.alarmBeep(game.alarm.value);
  if (game.alarm.full) { game.caught('Spotted too long — the alarm hit 100%.'); return; }

  const taken = collectLoot(game.loot, game.player.x, game.player.y);
  for (const piece of taken) {
    const v = lootValue(piece);
    game.score += v; game.tools.coins += v; game.stolen += v; game.totalStolen += v;
    game.sound.lootChime(v);
    announce(`${piece.type} stolen: $${v}. Loot $${game.stolen} of $${game.level.quota}.`);
  }

  const e = game.level.exit;
  if (game.exitOpen && game.player.x > e.x - 10 && game.player.x < e.x + e.w + 10
    && game.player.y > e.y - 10 && game.player.y < e.y + e.h + 10) {
    const bonus = Math.ceil(game.timeLeft) * 10;
    game.score += bonus;
    game.sound.levelClear();
    if (game.levelIndex + 1 >= LEVELS.length) {
      game.state = 'win'; game.sound.winFanfare();
      announce(`Perfect heist! Final score ${game.score}.`);
    } else {
      game.state = 'levelclear';
      announce(`Room cleared. Time bonus ${bonus}.`);
    }
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  drawGame(ctx, game);
  requestAnimationFrame(frame);
}

function canvasPoint(ev) {
  const r = canvas.getBoundingClientRect();
  return { x: (ev.clientX - r.left) * (canvas.width / r.width), y: (ev.clientY - r.top) * (canvas.height / r.height) };
}

window.addEventListener('keydown', (ev) => {
  const k = ev.key.toLowerCase();
  game.keys[k] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) ev.preventDefault();
  if (k === 'm') { game.sound.muted = !game.sound.muted; return; }
  if (game.state === 'menu' && (k === 'enter' || k === ' ')) { game.startGame(); return; }
  if (game.state === 'caught' && k === 'r') { game.loadLevel(game.levelIndex); game.state = 'playing'; return; }
  if (game.state === 'caught' && k === 'enter') { game.startGame(); return; }
  if (game.state === 'levelclear' && k === 'enter') { game.loadLevel(game.levelIndex + 1); game.state = 'playing'; return; }
  if ((game.state === 'win' || game.state === 'gameover') && k === 'enter') { game.startGame(); return; }
  if (game.state === 'playing') {
    if (k === 'e') tryTool('emp');
    if (k === 'q') tryTool('smoke');
    if (k === 'f') tryTool('disguise');
  }
});
window.addEventListener('keyup', (ev) => { game.keys[ev.key.toLowerCase()] = false; });
canvas.addEventListener('pointerdown', (ev) => {
  game.sound.ensure();
  if (game.state === 'menu') { game.startGame(); return; }
  if (game.state === 'levelclear') { game.loadLevel(game.levelIndex + 1); game.state = 'playing'; return; }
  if (game.state === 'win' || game.state === 'gameover') { game.startGame(); return; }
  if (game.state === 'playing') game.player.moveTarget = canvasPoint(ev);
});

// Boot: menu behind the title, or a frozen staged shot for screenshots.
game.loadLevel(0);
const shot = new URLSearchParams(location.search).get('shot');
if (shot) applyShot(game, shot);
requestAnimationFrame(frame);
