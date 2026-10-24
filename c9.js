p.hp;
}
setTimeout(() => $('boot').classList.add('done'), 500);
function showMsg(t, ms = 1400) {
  const el = $('msg');
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => el.classList.remove('show'), ms);
}
function difficulty() {
  return 1 + time / 55 + Math.floor(time / 60) * 0.35;
}
function updateHud() {
  $('hpText').textContent = Math.max(0, player.hp | 0);
  $('hpBar').style.transform = `scaleX(${Math.max(0, player.hp / player.maxHp)})`;
  $('lvl').textContent = player.level;
  $('xpBar').style.transform = `scaleX(${Math.min(1, player.xp / player.xpNeed)})`;
  $('kills').textContent = kills;
  $('diff').textContent = difficulty().toFixed(1);
  const m = (time / 60) | 0, s = (time % 60) | 0;
  $('timer').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function clearWorld() {
  while (activeBullets.length) releaseBullet(activeBullets[0], 0);
  while (activeEnemies.length) releaseEnemy(activeEnemies[0], 0);
  while (activeXp.length) releaseXp(activeXp[0], 0);
}
function resetRun() {
  Object.assign(player, {
    x: 0, z: 0, angle: 0, faceAngle: 0,
    hp: selectedOp.hp, maxHp: selectedOp.hp,
    level: 1, xp: 0, xpNeed: 8,
    speedMul: selectedOp.speed, dmgMul: selectedOp.dmg,
    fireRate: 0.22, range: 12, projectiles: 1, regen: 0,
    magnet: 4.5, crit: 0.05, dashCd: 0, dashCdMax: 1.6, dashT: 0,
    fireCd: 0, hurtT: 0, moveAmt: 0, shootKick: 0,
    vaultT: 0, vaultX: 0, vaultZ: 0, y: 0,
  });
  clearWorld();
  time = 0; kills = 0; spawnAcc = 0; gameOver = false; paused = false;
  playerRoot.position.set(0, 0, 0);
  playerRoot.rotation.y = 0;
  camTarget.set(0, 0, 0);
  camera.position.set(camOffset.x, camOffset.y, camOffset.z);
  $('hudOp').textContent = selectedOp.name;
  $('loadout').textContent = 'AR-15 · AUTO · 3D UNIT 1337';
  updateHud();
}
function joyShow(x, y) {
  joy.active = true; joy.ox = x; joy.oy = y; joy.x = 0; joy.y = 0;
  const el = $('joy');
  el.classList.remove('hidden');
  el.style.left = x + 'px'; el.style.top = y + 'px';
  $('joyKnob').style.transform = 'translate(0,0)';
}
function joyMove(x, y) {
  if (!joy.active) return;
  let dx = x - joy.ox, dy = y - joy.oy;
  const max = 42, len = Math.hypot(dx, dy) || 1;
  if (len > max) { dx = dx / len * max; dy = dy / len * max; }
  joy.x = dx / max; joy.y = dy / max;
  $('joyKnob').style.transform = `translate(${dx}px,${dy}px)`;
}
function joyHide() {
  joy.active = false; joy.id = null; joy.x = 0; joy.y = 0;
  $('joy').classList.add('hidden');
}
canvas.addEventListener('pointerdown', (e) => {
  if (!running || paused || gameOver) return;
  if (e.pointerType === 'mouse' && e.button !== 0) return;
  joy.id = e.pointerId;
  canvas.setPointerCapture(e.pointerId);
  joyShow(e.clientX, e.clientY);
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId !== joy.id) return;
  joyMove(e.clientX, e.clientY);
});
function endJoy(e) { if (e.pointerId !== joy.id) return; joyHide(); }
canvas.addEventListener('pointerup', endJoy);
canvas.addEventListener(