den');
  $('over').classList.add('hidden');
  $('levelup').classList.add('hidden');
  $('pause')?.classList.add('hidden');
  $('hud').classList.remove('hidden');
  $('btnPause').textContent = 'Ⅱ';
  showMsg(selectedOp.name + ' · ВХОД В ЗОНУ', 1200);
  last = performance.now();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(frame);
}
function clampPlayer() {
  const lim = HALF - player.r - 0.5;
  player.x = Math.max(-lim, Math.min(lim, player.x));
  player.z = Math.max(-lim, Math.min(lim, player.z));
}
function tryVault(nx, nz, mx, mz) {
  if (player.vaultT > 0 || player.dashT > 0) return false;
  const probe = resolveCircleObs(nx, nz, player.r + 0.08);
  if (!probe.hit || !probe.hit.vaultable) return false;
  if (player.moveAmt < 0.35 && player.dashT <= 0) return false;
  // only vault low-ish obstacles
  if (probe.hit.h > 1.35) return false;
  player.vaultT = 0.42;
  const len = Math.hypot(mx, mz) || 1;
  player.vaultX = (mx / len);
  player.vaultZ = (mz / len);
  // land past obstacle
  const land = 0.9 + probe.hit.hw;
  player.x = probe.hit.x + player.vaultX * land;
  player.z = probe.hit.z + player.vaultZ * land;
  return true;
}
function nearestEnemy() {
  let best = null, bd = player.range * player.range;
  for (const e of activeEnemies) {
    const dx = e.mesh.position.x - player.x;
    const dz = e.mesh.position.z - player.z;
    const d = dx * dx + dz * dz;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}
function shoot() {
  const t = nearestEnemy();
  if (!t) return;
  const dx = t.mesh.position.x - player.x;
  const dz = t.mesh.position.z - player.z;
  const ang = Math.atan2(dx, dz);
  player.angle = ang;
  player.shootKick = 1;
  const n = player.projectiles;
  const spread = n > 1 ? 0.14 : 0;
  const speed = 28;
  for (let i = 0; i < n; i++) {
    const a = ang + (i - (n - 1) / 2) * spread;
    let dmg = 12 * player.dmgMul;
    let crit = false;
    if (Math.random() < player.crit) { dmg *= 2.2; crit = true; }
    const b = acquireBullet(crit);
    const sx = Math.sin(a), sz = Math.cos(a);
    b.mesh.position.set(player.x + sx * 0.7, 1.05, player.z + sz * 0.7);
    b.vx = sx * speed; b.vz = sz * speed;
    b.life = player.range / speed + 0.05;
    b.dmg = dmg;
  }
}
function spawnEnemy() {
  const diff = difficulty();
  const ang = Math.random() * Math.PI * 2;
  const dist = 16 + Math.random() * 6;
  let x = player.x + Math.sin(ang) * dist;
  let z = player.z + Math.cos(ang) * dist;
  const lim = HALF - 1.2;
  x = Math.max(-lim, Math.min(lim, x));
  z = Math.max(-lim, Math.min(lim, z));
  const roll = Math.random();
  let type = 'grunt';
  if (diff > 1.8 && roll < 0.12) type = 'heavy';
  else if (roll < 0.22) type = 'rusher';
  else if (diff > 2.5 && roll < 0.28) type = 'elite';
  const base = {
    grunt: { hp: 28, speed: 3.0, r: 0.42, dmg: 8, xp: 1 },
    rusher: { hp: 18, speed: 5.2, r: 0.38, dmg: 10, xp: 1 },
    heavy: { hp: 90, speed: 1.9, r: 0.55, dmg: 16, xp: 3 },
    elite: { hp: 140, speed: 2.5, r: 0.5, dmg: 18, xp: 5 },
  }[type];
  const e = acquireEnemy(type);
  e.h