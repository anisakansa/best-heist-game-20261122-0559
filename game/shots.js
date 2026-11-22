// shots.js — deterministic screenshot poses. ?shot=cover|play|caught|win freezes the
// game at a staged moment so every screenshot is reproducible, byte for byte.
export function applyShot(game, name) {
  game.frozen = true;
  if (name === 'cover' || name === 'play') {
    // Cover: thief mid-room, guard cone sweeping across him, CCTV cone visible,
    // loot glowing nearby, alarm meter part-way up, getaway door in frame.
    game.state = 'playing';
    game.loadLevel(0);
    game.player.x = 470; game.player.y = 400; game.player.face = Math.PI / 4;
    game.guards[0].x = 420; game.guards[0].y = 300; game.guards[0].angle = Math.PI / 2.4;
    game.guards[0].state = 'suspicious';
    game.guards[1].x = 1000; game.guards[1].y = 430; game.guards[1].angle = -Math.PI / 2;
    game.cameras[0].angle = Math.PI / 2.3; game.cameras[1].angle = -Math.PI / 1.8;
    game.alarm.value = name === 'cover' ? 38 : 62;
    game.stolen = 300; game.score = 300; game.tools.coins = 120;
    game.timeLeft = 118;
    game.clock = 1.2;
    if (name === 'play') {
      game.loot[1].taken = true; // one painting already pocketed
      game.player.x = 760; game.player.y = 560;
      game.guards[0].x = 700; game.guards[0].y = 420; game.guards[0].angle = Math.PI / 1.7;
    }
  } else if (name === 'caught') {
    game.state = 'caught';
    game.loadLevel(1);
    game.alarm.value = 100;
    game.caughtReason = 'A guard caught Vesper in the open — the alarm hit 100%.';
    game.lives = 2; game.score = 640; game.stolen = 640; game.tools.coins = 40;
    game.player.x = 400; game.player.y = 330;
    game.guards[0].x = 400; game.guards[0].y = 260; game.guards[0].angle = Math.PI / 2; game.guards[0].state = 'chase';
    game.clock = 2.0;
  } else if (name === 'win') {
    game.state = 'win';
    game.loadLevel(2);
    game.loot.forEach((p) => { p.taken = true; });
    game.stolen = 2600; game.totalStolen = 2600; game.score = 3840; game.tools.coins = 210;
    game.player.x = 1150; game.player.y = 130;
    game.alarm.value = 12;
    game.clock = 3.0;
  }
}
