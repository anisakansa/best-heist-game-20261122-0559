// level.js — the three rooms of the heist: walls, patrols, cameras, loot and the exit.
// Each level offers at least two routes to the loot: a lit main hall and a shadowed side passage.
export const PLAY = { x: 0, y: 64, w: 1280, h: 656 };

export const LEVELS = [
  {
    name: 'LEVEL 1 — GALLERY HALL',
    hint: 'Two routes: the lit hall past the guard, or the shadow passage behind the pillars.',
    time: 150, quota: 500,
    playerStart: { x: 90, y: 620 },
    exit: { x: 1180, y: 90, w: 64, h: 90 },
    walls: [
      { x: 0, y: 64, w: 1280, h: 14 }, { x: 0, y: 706, w: 1280, h: 14 },
      { x: 0, y: 64, w: 14, h: 656 }, { x: 1266, y: 64, w: 14, h: 656 },
      { x: 300, y: 200, w: 26, h: 320 }, { x: 620, y: 64, w: 26, h: 240 },
      { x: 620, y: 470, w: 26, h: 250 }, { x: 900, y: 300, w: 26, h: 260 },
    ],
    loot: [
      { type: 'vase', x: 200, y: 150 }, { type: 'painting', x: 470, y: 140 },
      { type: 'gem', x: 780, y: 620 }, { type: 'vase', x: 1080, y: 620 },
      { type: 'painting', x: 1080, y: 180 },
    ],
    guards: [
      { path: [[420, 560], [420, 180], [760, 180], [760, 560]], speed: 62 },
      { path: [[1000, 560], [1000, 200]], speed: 55 },
    ],
    cameras: [
      { x: 640, y: 90, base: Math.PI / 2, sweep: 1.1, speed: 0.55 },
      { x: 1120, y: 690, base: -Math.PI / 2, sweep: 0.9, speed: 0.7 },
    ],
  },
  {
    name: 'LEVEL 2 — VAULT CORRIDOR',
    hint: 'Cameras sweep the corridor — time your crossing, or spend coins on EMP.',
    time: 150, quota: 900,
    playerStart: { x: 90, y: 120 },
    exit: { x: 1180, y: 560, w: 64, h: 90 },
    walls: [
      { x: 0, y: 64, w: 1280, h: 14 }, { x: 0, y: 706, w: 1280, h: 14 },
      { x: 0, y: 64, w: 14, h: 656 }, { x: 1266, y: 64, w: 14, h: 656 },
      { x: 240, y: 64, w: 26, h: 300 }, { x: 240, y: 480, w: 26, h: 240 },
      { x: 560, y: 300, w: 26, h: 420 }, { x: 560, y: 64, w: 26, h: 140 },
      { x: 880, y: 64, w: 26, h: 300 }, { x: 880, y: 480, w: 26, h: 240 },
    ],
    loot: [
      { type: 'vase', x: 140, y: 620 }, { type: 'painting', x: 400, y: 620 },
      { type: 'gem', x: 720, y: 140 }, { type: 'painting', x: 720, y: 620 },
      { type: 'gem', x: 1040, y: 140 }, { type: 'vase', x: 1160, y: 330 },
    ],
    guards: [
      { path: [[400, 200], [400, 620], [720, 620], [720, 200]], speed: 70 },
      { path: [[1040, 620], [1040, 200]], speed: 66 },
      { path: [[140, 330], [1040, 330]], speed: 58 },
    ],
    cameras: [
      { x: 560, y: 90, base: Math.PI / 2, sweep: 1.2, speed: 0.8 },
      { x: 880, y: 690, base: -Math.PI / 2, sweep: 1.2, speed: 0.8 },
      { x: 1240, y: 330, base: Math.PI, sweep: 0.8, speed: 0.6 },
    ],
  },
  {
    name: 'LEVEL 3 — THE GILDED VAULT',
    hint: 'The Crown of Vesper is here. Four guards, four cameras — plan every step.',
    time: 180, quota: 1500,
    playerStart: { x: 90, y: 620 },
    exit: { x: 1180, y: 90, w: 64, h: 90 },
    walls: [
      { x: 0, y: 64, w: 1280, h: 14 }, { x: 0, y: 706, w: 1280, h: 14 },
      { x: 0, y: 64, w: 14, h: 656 }, { x: 1266, y: 64, w: 14, h: 656 },
      { x: 320, y: 200, w: 200, h: 26 }, { x: 320, y: 520, w: 200, h: 26 },
      { x: 760, y: 200, w: 200, h: 26 }, { x: 760, y: 520, w: 200, h: 26 },
      { x: 620, y: 64, w: 26, h: 180 }, { x: 620, y: 540, w: 26, h: 180 },
    ],
    loot: [
      { type: 'vase', x: 180, y: 150 }, { type: 'painting', x: 420, y: 620 },
      { type: 'gem', x: 640, y: 480 }, { type: 'painting', x: 860, y: 620 },
      { type: 'gem', x: 1080, y: 150 }, { type: 'vase', x: 1160, y: 620 },
      { type: 'crown', x: 640, y: 360 }, // crown sits on the vault plinth, centre room
    ],
    guards: [
      { path: [[200, 380], [1080, 380]], speed: 78 },
      { path: [[420, 620], [420, 150], [860, 150], [860, 620]], speed: 74 },
      { path: [[1080, 620], [1080, 150]], speed: 70 },
      { path: [[200, 150], [200, 620]], speed: 66 },
    ],
    cameras: [
      { x: 640, y: 90, base: Math.PI / 2, sweep: 1.3, speed: 0.9 },
      { x: 90, y: 380, base: 0, sweep: 1.0, speed: 0.7 },
      { x: 1190, y: 380, base: Math.PI, sweep: 1.0, speed: 0.7 },
      { x: 640, y: 690, base: -Math.PI / 2, sweep: 1.3, speed: 0.9 },
    ],
  },
];

/** Total loot value of a level, for the HUD quota display. */
export function levelLootTotal(level) {
  return level.loot.reduce((s, l) => s + ({ vase: 150, painting: 300, gem: 500, crown: 800 }[l.type] || 0), 0);
}
