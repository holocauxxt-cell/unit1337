p = base.hp * (0.85 + diff * 0.25);
  e.maxHp = e.hp;
  e.speed = base.speed * (0.95 + diff * 0.04);
  e.r = base.r; e.dmg = base.dmg; e.xp = base.xp; e.hitT = 0;
  e.mesh.position.set(x, 0, z);
  e.mesh.scale.setScalar(type === 'heavy' ? 1.35 : type === 'elite' ? 1.2 : type === 'rusher' ? 0.9 : 1);
}
function killEnemy(e, idx) {
  kills++;
  const n = e.xp + (Math.random() < 0.2 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    const o = acquireXp();
    o.mesh.position.set(
      e.mesh.position.x + (Math.random() - 0.5) * 0.6,
      0.4,
      e.mesh.position.z + (Math.random() - 0.5) * 0.6
    );
  }
  releaseEnemy(e, idx);
}
function levelUp() {
  paused = true;
  const pool = ITEM_POOL.slice().sort(() => Math.random() - 0.5).slice(0, 3);
  const box = $('choices');
  box.innerHTML = '';
  pool.forEach((item) => {
    const b = document.createElement('button');
    b.className = 'choice';
    b.innerHTML = `<strong>${item.name}</strong><span>${item.desc}</span>`;
    b.onclick = () => {
      item.apply(player);
      player.xp -= player.xpNeed;
      player.level++;
      player.xpNeed = Math.floor(player.xpNeed * 1.35 + 3);
      $('levelup').classList.add('hidden');
      paused = false;
      showMsg(item.name.toUpperCase());
      updateHud();
      if (player.xp >= player.xpNeed) levelUp();
    };
    box.appendChild(b);
  });
  $('levelup').classList.remove('hidden');
}
function endGame() {
  gameOver = true; running = false; joyHide();
  $('overStats').textContent =
    `Время ${$('timer').textContent} · Убийства ${kills} · Уровень ${player.level} · Сложность ${difficulty().toFixed(1)}x`;
  $('over').classList.remove('hidden');
}
function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}
function animatePlayer(dt) {
  if (player.vaultT > 0) {
    const t = 1 - player.vaultT / 0.42;
    // roll / vault
    playerTorso.rotation.x = -t * Math.PI * 1.6;
    playerTorso.rotation.z = Math.sin(t * Math.PI) * 0.3;
    legL.rotation.x = -0.8; legR.rotation.x = 0.6;
    armL.rotation.x = -1.2; armR.rotation.x = -0.8;
    playerRoot.rotation.y = player.faceAngle;
    playerRing.material.opacity = 0.15;
    return;
  }
  const moving = player.moveAmt > 0.08;
  const sprint = Math.min(1, player.moveAmt);
  // Monster Survivors-like: faster cycle, stronger bob, lean
  const cadence = moving ? (9 + sprint * 4) : 2.2;
  const walk = time * cadence;
  const legAmp = moving ? 0.7 * sprint : 0.05;
  const armAmp = moving ? 0.55 * sprint : 0.06;
  legL.rotation.x = Math.sin(walk) * legAmp;
  legR.rotation.x = Math.sin(walk + Math.PI) * legAmp;
  legL.rotation.z = moving ? Math.sin(walk) * 0.06 : 0;
  legR.rotation.z = moving ? -Math.sin(walk) * 0.06 : 0;
  // free arm swing, gun arm steadier with micro sway
  armL.rotation.x = Math.sin(walk + Math.PI) * armAmp - 0.35;
  armL.rotation.z = 0.15 + (moving ? Math.sin(walk * 0.5) * 0.08 : 0);
  const aimPitch = -0.62 - player.shootKick * 0.35;
  armR.rotation.x = aimPitch + (moving ? Math.s