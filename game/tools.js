// tools.js — the thief's paid tools. Loot earns coins; tools spend them.
// EMP freezes every camera, smoke hides the thief, disguise makes guards look away.
export const TOOLS = {
  emp: { key: 'E', cost: 100, name: 'EMP Burst', desc: 'Cameras blind 6s' },
  smoke: { key: 'Q', cost: 75, name: 'Smoke Bomb', desc: 'Unseen 4s' },
  disguise: { key: 'F', cost: 150, name: 'Cleaner Disguise', desc: 'Guards ignore you 5s' },
};

export class ToolBelt {
  constructor() {
    this.coins = 0;
    this.empUntil = 0; this.smokeUntil = 0; this.disguiseUntil = 0;
  }
  reset() { this.coins = 0; this.empUntil = 0; this.smokeUntil = 0; this.disguiseUntil = 0; }
  get empActive() { return ToolBelt.now < this.empUntil; }
  get smokeActive() { return ToolBelt.now < this.smokeUntil; }
  get disguiseActive() { return ToolBelt.now < this.disguiseUntil; }
  static now = 0;

  /** Try to buy and trigger a tool. Returns true on success, false when broke. */
  use(name) {
    const tool = TOOLS[name];
    if (!tool || this.coins < tool.cost) return false;
    this.coins -= tool.cost;
    if (name === 'emp') this.empUntil = ToolBelt.now + 6;
    if (name === 'smoke') this.smokeUntil = ToolBelt.now + 4;
    if (name === 'disguise') this.disguiseUntil = ToolBelt.now + 5;
    return true;
  }

  /** Seconds left on a tool, for the HUD. */
  left(name) {
    const until = name === 'emp' ? this.empUntil : name === 'smoke' ? this.smokeUntil : this.disguiseUntil;
    return Math.max(0, until - ToolBelt.now);
  }
}
