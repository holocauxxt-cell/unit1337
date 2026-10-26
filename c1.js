
  door.position.set(0, Math.min(2.1, h * 0.65) / 2, d / 2 + 0.04); g.add(door);
  g.position.set(x, 0, z); scene.add(g); return g;
}
for (const [x, z, w, h, d, c] of [[-18, -14, 6, 4.5, 5, 0x4a5850], [16, -18, 5, 3.8, 4.5, 0x3d4a42], [-22, 10, 7, 5.2, 5.5, 0x455248], [20, 12, 5.5, 4.2, 5, 0x3a4640], [0, -22, 8, 3.5, 4, 0x4e5c54], [-12, 20, 5, 4, 5, 0x425048], [14, 22, 6, 4.8, 4.5, 0x3f4c44]]) makeBuilding(x, z, w, h, d, c);

const OPS = [
  { id: 'ghost', name: 'GHOST', color: 0x5a7a62, desc: 'сбалансированный' },
  { id: 'roach', name: 'ROACH', color: 0x8a6a3a, desc: 'тяжёлый · танк' },
  { id: 'soap', name: 'SOAP', color: 0x4a7a9a, desc: 'лёгкий · манёвр' }
];
let selectedOp = 0, selectedSkin = 0;
let running = false, paused = false, dead = false, last = 0, elapsed = 0;
let fireClock = 0, spawnClock = 0, wave = 1, waveKills = 0, kills = 0, level = 1, xp = 0, xpNeed = 5;
let armor = 0, weaponLevel = 1, ches