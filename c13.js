in(walk) * 0.1 * sprint : 0);
  armR.rotation.y = -0.18 - player.shootKick * 0.1;
  armR.rotation.z = -0.08;
  // torso lean into movement + recoil kick
  const lean = moving ? -0.12 * sprint : 0;
  playerTorso.rotation.x = lean - player.shootKick * 0.18;
  playerTorso.rotation.z = moving ? Math.sin(walk * 0.5) * 0.04 * sprint : 0;
  // vertical bob + dash stretch
  const bob = moving ? Math.abs(Math.sin(walk)) * 0.055 * sprint : Math.sin(time * 2) * 0.008;
  playerTorso.position.y = bob;
  if (player.dashT > 0) {
    playerRoot.scale.z = 1.15;
    playerRoot.scale.x = 0.92;
    playerTorso.rotation.x = 0.15;
  } else {
    const targetS = currentKit().scale;
    playerRoot.scale.x += (targetS - playerRoot.scale.x) * Math.min(1, 12 * dt);
    playerRoot.scale.z += (targetS - playerRoot.scale.z) * Math.min(1, 12 * dt);
    playerRoot.scale.y += (targetS - playerRoot.scale.y) * Math.min(1, 12 * dt);
  }
  // smooth face turn
  const turnSpeed = moving ? 14 : 10;
  player.faceAngle = lerpAngle(player.faceAngle, player.angle, Math.min(1, turnSpeed * dt));
  playerRoot.rotation.y = player.faceAngle;
  player.shootKick = Math.max(0, player.shootKick - dt * 9);
  // ring pulse
  playerRing.material.opacity = 0.28 + 0.14 * Math.sin(time * 4);
  playerRing.rotation.z = time * 0.4;
  // hurt flash on body mat
  if (matBody) {
    matBody.emissiveIntensity = player.hurtT > 0 ? 1.1 : 0.12;
    if (player.hurtT > 0) matBody.color.setHex(0xaa4444);
    else matBody.color.setHex(currentKit().body);
  }
  // weapon recoil slide
  if (parts.rifle) {
    parts.rifle.position.z = (selectedOp.id === 'soap' ? 0.28 : selectedOp.id === 'roach' ? 0.4 : 0.36) - player.shootKick * 0.12;
  }
}
function animateZombie(e, dt) {
  const u = e.mesh.userData;
  if (!u || !u.lL) return;
  if (e.climbT > 0) {
    const t = 1 - e.climbT / 0.9;
    u.lL.rotation.x = -0.4 - t * 0.5;
    u.lR.rotation.x = 0.3 + t * 0.4;
    u.aL.rotation.x = -1.6 + Math.sin(t * 8) * 0.2;
    u.aR.rotation.x = -1.5 + Math.sin(t * 8 + 1) * 0.2;
    if (u.torso) u.torso.rotation.x = 0.5 + t * 0.3;
    return;
  }
  const phase = u.phase + time * (3.5 + e.speed * 0.4);
  const amp = 0.45 + (e.type === 'rusher' ? 0.15 : 0);
  u.lL.rotation.x = Math.sin(phase) * amp;
  u.lR.rotation.x = Math.sin(phase + Math.PI) * amp;
  u.aL.rotation.x = -1.05 + Math.sin(phase * 0.7) * 0.15;
  u.aR.rotation.x = -1.0 + Math.sin(phase * 0.7 + 1) * 0.15;
  if (u.torso) {
    u.torso.rotation.x = 0.22 + Math.sin(phase * 0.5) * 0.05;
    u.torso.position.y = Math.abs(Math.sin(phase)) * 0.03;
  }
  const pulse = 1.5 + Math.sin(time * 6 + u.phase) * 0.8;
  if (u.eyeL && u.eyeL.material) u.eyeL.material.emissiveIntensity = pulse;
  if (u.eyeR && u.eyeR.material) u.eyeR.material.emissiveIntensity = pulse;
}
function update(dt) {
  if (paused || gameOver) return;
  time += dt;
  player.dashCd = Math.max(0, player.dashCd - dt);
  player.hurtT = Math.max(0, player.hurtT - dt);
  if (player.regen > 0 && player.hp < player.maxHp) {
    player.hp = Math.min(player.maxHp, player.hp + player.regen * dt);
  