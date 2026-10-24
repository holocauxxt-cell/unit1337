}
  let mx = joy.x, mz = joy.y;
  if (keys.has('KeyW') || keys.has('ArrowUp')) mz -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) mz += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
  const ml = Math.hypot(mx, mz);
  if (ml > 1) { mx /= ml; mz /= ml; }
  player.moveAmt = ml > 0.05 ? Math.min(1, ml) : Math.max(0, player.moveAmt - dt * 5);
  const baseSpeed = 7.5 * player.speedMul;
  if (player.vaultT > 0) {
    player.vaultT -= dt;
    player.x += player.vaultX * 6 * dt;
    player.z += player.vaultZ * 6 * dt;
    player.moveAmt = 1;
    player.y = Math.sin((1 - Math.max(0, player.vaultT) / 0.42) * Math.PI) * 0.75;
    if (player.vaultT <= 0) player.y = 0;
  } else if (player.dashT > 0) {
    player.dashT -= dt;
    let nx = player.x + player.dashDirX * 22 * dt;
    let nz = player.z + player.dashDirZ * 22 * dt;
    if (!tryVault(nx, nz, player.dashDirX, player.dashDirZ)) {
      const r = resolveCircleObs(nx, nz, player.r);
      player.x = r.x; player.z = r.z;
    }
    player.moveAmt = 1;
  } else if (ml > 0.05) {
    let nx = player.x + mx * baseSpeed * dt;
    let nz = player.z + mz * baseSpeed * dt;
    if (!tryVault(nx, nz, mx, mz)) {
      const r = resolveCircleObs(nx, nz, player.r);
      // if blocked hard, attempt vault from current toward move
      if (r.hit && r.hit.vaultable && player.moveAmt > 0.5) {
        tryVault(nx, nz, mx, mz);
      } else {
        player.x = r.x; player.z = r.z;
      }
    }
    if (!nearestEnemy()) player.angle = Math.atan2(mx, mz);
  }
  clampPlayer();
  playerRoot.position.set(player.x, player.y || 0, player.z);
  animatePlayer(dt);
  player.fireCd -= dt;
  if (player.fireCd <= 0) { shoot(); player.fireCd = player.fireRate; }
  const rate = Math.max(0.28, 1.15 - difficulty() * 0.08);
  spawnAcc += dt;
  const cap = Math.min(50, 10 + difficulty() * 6);
  while (spawnAcc >= rate && activeEnemies.length < cap) {
    spawnAcc -= rate;
    spawnEnemy();
  }
  for (let i = activeEnemies.length - 1; i >= 0; i--) {
    const e = activeEnemies[i];
    e.hitT = Math.max(0, e.hitT - dt);
    if (e.climbT == null) e.climbT = 0;
    const dx = player.x - e.mesh.position.x;
    const dz = player.z - e.mesh.position.z;
    const d = Math.hypot(dx, dz) || 1;
    if (e.climbT > 0) {
      e.climbT -= dt;
      const t = 1 - Math.max(0, e.climbT) / 0.9;
      e.mesh.position.y = Math.sin(t * Math.PI) * (e.climbH || 0.7);
      e.mesh.position.x += e.climbVX * dt;
      e.mesh.position.z += e.climbVZ * dt;
      if (e.climbT <= 0) e.mesh.position.y = 0;
    } else {
      const step = e.speed * dt;
      let nx = e.mesh.position.x + (dx / d) * step;
      let nz = e.mesh.position.z + (dz / d) * step;
      const r = resolveCircleObs(nx, nz, e.r * 0.9);
      if (r.hit && r.hit.vaultable && r.hit.h <= 1.3) {
        e.climbT = 0.9;
        e.climbH = r.hit.h * 0.85;
        const len = Math.hypot(dx, dz) || 1;
        e.climbVX = (dx / len) * e.speed * 0.45;
        e.climbVZ = (dz / len) * e.speed * 0.45;
  