// loot.js — loot targets: four kinds, four values, four looks. Loot pays score AND coins.
export const LOOT_TYPES = {
  vase: { value: 150, color: '#7fd4ff', label: 'Moon Vase', r: 13 },
  painting: { value: 300, color: '#ffd166', label: 'Gilded Painting', r: 15 },
  gem: { value: 500, color: '#ff5d8f', label: 'Star Gem', r: 12 },
  crown: { value: 800, color: '#ffe066', label: 'Crown of Vesper', r: 17 },
};

/** Fresh loot state for a level definition: each piece uncollected. */
export function createLootState(level) {
  return level.loot.map((l, i) => ({ ...l, id: i, taken: false, bob: i * 0.9 }));
}

/** Value of one loot piece. */
export function lootValue(piece) { return LOOT_TYPES[piece.type].value; }

/** Collect any loot within reach of (x, y); returns the pieces just taken. */
export function collectLoot(loot, x, y) {
  const taken = [];
  for (const piece of loot) {
    if (piece.taken) continue;
    const dx = piece.x - x, dy = piece.y - y;
    if (dx * dx + dy * dy < (LOOT_TYPES[piece.type].r + 26) ** 2) {
      piece.taken = true;
      taken.push(piece);
    }
  }
  return taken;
}

/** Sum of values already stolen in this level. */
export function stolenValue(loot) {
  return loot.reduce((s, p) => s + (p.taken ? lootValue(p) : 0), 0);
}

/** Sum of values still on display. */
export function remainingValue(loot) {
  return loot.reduce((s, p) => s + (p.taken ? 0 : lootValue(p)), 0);
}
