
function poseArmToTarget(arm, targetWorld, shoulderWorld) {
  const dx = targetWorld.x - shoulderWorld.x, dy = targetWorld.y - shoulderWorld.y, dz = targetWorld.z - shoulderWorld.z;
  const dist = Math.hypot(dx, dy, dz);
  const pitch = Math.atan2(-dy, Math.hypot(dx, dz));
  const yaw = Math.atan2(dx, dz);
  arm.shoulder.rotation.x = THREE.MathUtils.clamp(pitch * 0.9 + 0.2, -1.2, 0.3);
  arm.shoulder.rotation.y = THREE.MathUtils.clamp(yaw * 0.2 * arm.side, -0.5, 0.5);
  arm.shoulder.rotation.z = THREE.MathUtils.clamp(-arm.side * 0.35 + yaw * 0.15 * arm.side, -0.8, 0.8);
  arm.elbow.rotation.x = -THREE.MathUtils.clamp(0.9 + (0.5 - dist) * 1.5, 0.5, 1.4);
}

function setTacticalArms(arms, state, fireKick, dt) {
  const L = arms[0], R = arms[1];
  let lSx = -0.72, lSy = 0.42, lSz = 0.55, lEx = -1.05;
  let rSx = -0.95, rSy = -0.12, rSz = -0.35, rEx = -1.15;
  if (state === 'reload') {
    lSx = -1.05; lSy = 0.65; lSz = 0.4; lEx = -1.4;
    rSx = -0.55; rSy = 0.1; rSz = -0.2; rEx = -0.9;
  } else if (state === 'roll' || state === 'vault') {
    lSx = -1.0; lSy = 0.2; lSz = 0.3; lEx = -0.7;
    rSx = -0.9; rSy = -0.1; rSz = -0.25; rEx = -0.65;
  } else if (state === 'fire') {
    rSx -= fireKick * 0.25;
    lSx -= fireKick * 0.12;
  }
  L.shoulder.rotation.x = damp(L.shoulder.rotation.x, lSx, 14, dt);
  L.shoulder.rotation.y = damp(L.shoulder.rotation.y, lSy, 14, dt);
  L.shoulder.rotation.z = damp(L.shoulder.rotation.z, lSz, 14, dt);
  L.elbow.rotation.x = damp(L.elbow.rotation.x, lEx, 14, dt);
  R.shoulder.rotation.x = damp(R.shoulder.rotation.x, rSx, 14, dt);
  R.shoulder.rotation.y = damp(R.shoulder.rotation.y, rSy, 14, dt);
  R.shoulder.rotation.z = damp(R.shoulder.rotation.z, rSz, 14, dt);
  R.elbow.rotation.x = damp(R.elbow.rotation.x, rEx, 14, dt);
}

function animateOperator(mesh, dt, time, opts) {
  const ud = mesh.userData;
  const { moving = false, sprint = 0, aiming = true, firing = false, rolling = false, vaulting = false, vaultProgress = 0, rollProgress = 0, rollSide = 1, hit = false, reloading = false, faceAngle = 0, vaultHeight = 0.8 } = opts;
  ud.animTime += dt;
  ud.fireKick = Math.max(0, ud.fireKick - dt * 5.5);
  ud.hitFlash = Math.max(0, ud.hitFlash - dt * 5);
  let fy = mesh.rotation.y;
  let diff = faceAngle - fy;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  mesh.rotation.y = fy + diff * Math.min(1, dt * 10);
  let state = 'idle';
  if (vaulting) state = 'vault'; else if (rolling) state = 'roll'; else if (reloading) state = 'reload';
  else if (hit) state = 'hit'; else if (firing) state = 'fire'; else if (moving && sprint > 0.55) state = 'run';
  else if (moving) state = 'walk'; else if (aiming) state = 'aim';
  ud.animState = state;
  const legs = ud.legs, arms = ud.arms, torso = ud.torso, pelvis = ud.pelvis, head = ud.head, rifle = ud.rifleGroup;
  const isRun = state === 'run', isWalk = state === 'walk' || isRun;
  const cadence = isRun ? 9.5 : isWalk ? 6.2 : 1.0;
  const walkCycle = time * cadence;
  const amp = isRun ? 0.72 : isWalk ? 0.42 : 0.03;
  const breath = Math.sin(time * 1.6) * 0.012;
  if (state === 'roll') {
    const t = rollProgress, s = Math.sin(t * Math.PI);
    legs[0].hip.rotation.x = damp(legs[0].hip.rotation.x, -0.95 + s * 0.35, 14, dt);
    legs[1].hip.rotation.x = damp(legs[1].hip.rotation.x, 0.55 - s * 0.25, 14, dt);
    legs[0].knee.rotation.x = damp(legs[0].knee.rotation.x, 1.15, 14, dt);
    legs[1].knee.rotation.x = damp(legs[1].knee.rotation.x, 0.95, 14, dt);
    pelvis.rotation.x = damp(pelvis.rotation.x, s * 0.55, 12, dt);
    pelvis.rotation.z = damp(pelvis.rotation.z, rollSide * s * 0.95, 12, dt);
    torso.rotation.x = damp(torso.rotation.x, s * 0.75, 12, dt);
    torso.rotation.z = damp(torso.rotation.z, rollSide * s * 0.45, 12, dt);
    mesh.position.y = s * 0.32;
  } else if (state === 'vault') {
    const t = vaultProgress, s = Math.sin(t * Math.PI);
    legs[0].hip.rotation.x = damp(legs[0].hip.rotation.x, -0.35 - s * 0.95, 12, dt);
    legs[1].hip.rotation.x = damp(legs[1].hip.rotation.x, -0.15 - s * 0.75, 12, dt);
    legs[0].knee.rotation.x = damp(legs[0].knee.rotation.x, 0.45 + s * 0.95, 12, dt);
    legs[1].knee.rotation.x = damp(legs[1].knee.rotation.x, 0.35 + s * 0.85, 12, dt);
    torso.rotation.x = damp(torso.rotation.x, -0.18 + s * 0.5, 12, dt);
    pelvis.rotation.x = damp(pelvis.rotation.x, s * 0.22, 12, dt);
    pelvis.rotation.z = damp(pelvis.rotation.z, 0, 10, dt);
    torso.rotation.z = damp(torso.rotation.z, 0, 10, dt);
    mesh.position.y = s * (0.65 + vaultHeight * 0.32);
  } else {
    const stance = 0.28 + (isWalk ? 0.08 : 0.05);
    const lh = Math.sin(walkCycle) * amp, rh = Math.sin(walkCycle + Math.PI) * amp;
    legs[0].hip.rotation.x = damp(legs[0].hip.rotation.x, lh - stance * 0.45, 11, dt);
    legs[1].hip.rotation.x = damp(legs[1].hip.rotation.x, rh - stance * 0.45, 11, dt);
    legs[0].knee.rotation.x = damp(legs[0].knee.rotation.x, Math.max(0.2, Math.sin(walkCycle + 0.55) * amp * 1.15) + stance, 12, dt);
    legs[1].knee.rotation.x = damp(legs[1].knee.rotation.x, Math.max(0.2, Math.sin(walkCycle + Math.PI + 0.55) * amp * 1.15) + stance, 12, dt);
    const bob = isWalk ? Math.abs(Math.sin(walkCycle)) * (isRun ? 0.055 : 0.032) : breath * 0.4;
    mesh.position.y = bob;
    pelvis.rotation.z = damp(pelvis.rotation.z, isWalk ? Math.sin(walkCycle) * (isRun ? 0.09 : 0.055) : 0, 9, dt);
    pelvis.rotation.x = damp(pelvis.rotation.x, isWalk ? -0.04 - sprint * 0.03 : -0.02, 9, dt);
    torso.rotation.x = damp(torso.rotation.x, (isWalk ? -0.1 - sprint * 0.07 : -0.05) - ud.fireKick * 0.35 + breath, 10, dt);
    torso.rotation.z = damp(torso.rotation.z, isWalk ? -Math.sin(walkCycle) * (isRun ? 0.06 : 0.035) : 0, 9, dt);
    torso.rotation.y = damp(torso.rotation.y, isWalk ? Math.sin(walkCycle) * 0.04 : 0, 8, dt);
  }
  const headPitch = (state === 'aim' || state === 'fire') ? -0.1 : 0.03 + breath * 0.5;
  head.rotation.x = damp(head.rotation.x, headPitch, 8, dt);
  head.rotation.y = damp(head.rotation.y, Math.sin(time * 0.55) * 0.04, 6, dt);
  if (rifle) {
    let rx = -0.20, ry = 0.06, rz = 0.03, px = 0.13, py = 0.28, pz = 0.24;
    if (state === 'reload') { rx = 0.22; ry = -0.18; rz = 0.10; px = 0.08; py = 0.24; pz = 0.14; }
    else if (state === 'roll' || state === 'vault') { rx = 0.28; ry = 0.06; px = 0.10; py = 0.22; pz = 0.12; }
    else if (state === 'fire') { rx = -0.22 - ud.fireKick * 0.45; ry = 0.04; pz = 0.26; py = 0.29 + ud.fireKick * 0.03; }
    else if (state === 'aim' || state === 'walk' || state === 'run') { rx = -0.20 - sprint * 0.04; pz = 0.24; }
    else { rx = -0.16; py = 0.26; pz = 0.20; }
    rifle.rotation.x = damp(rifle.rotation.x, rx, 14, dt);
    rifle.rotation.y = damp(rifle.rotation.y, ry, 14, dt);
    rifle.rotation.z = damp(rifle.rotation.z, rz, 14, dt);
    rifle.position.x = damp(rifle.position.x, px, 16, dt);
    rifle.position.y = damp(rifle.position.y, py, 16, dt);
    rifle.position.z = damp(rifle.position.z, pz, 16, dt);
  }
  if (arms.length === 2) {
    setTacticalArms(arms, state, ud.fireKick, dt);
    if (ud.fireKick > 0 && state !== 'roll' && state !== 'vault') {
      torso.rotation.x -= ud.fireKick * 0.1;
    }
  }
  if (ud.hitFlash > 0 && ud.chest && ud.chest.material) {
    if (!ud.chest.material.emissive) ud.chest.material.emissive = new THREE.Color(0x000000);
    ud.chest.material.emissive.setHex(0x442222);
    ud.chest.material.emissiveIntensity = ud.hitFlash * 2;
  } else if (ud.chest && ud.chest.material && ud.chest.material.emissive) {
    ud.chest.material.emissiveIntensity = 0;
  }
}

function animateZombie(mesh, dt, time, opts) {
  const ud = mesh.userData;
  const { moving = true, attacking = false, hit = false, dying = false, deathProgress = 0 } = opts;
  ud.animTime += dt;
  ud.hitFlash = Math.max(0, ud.hitFlash - dt * 5);
  ud.attackT = Math.max(0, ud.attackT - dt);
  const legs = ud.legs, arms = ud.arms, torso = ud.torso, head = ud.head, phase = ud.phase;
  if (dying) {
    const t = deathProgress, ease = t * t;
    torso.rotation.x = damp(torso.rotation.x, ease * 1.25, 8, dt);
    head.rotation.x = damp(head.rotation.x, ease * 0.7, 8, dt);
    legs[0].hip.rotation.x = damp(legs[0].hip.rotation.x, -0.55 * ease, 8, dt);
    legs[1].hip.rotation.x = damp(legs[1].hip.rotation.x, -0.35 * ease, 8, dt);
    arms[0].shoulder.rotation.x = damp(arms[0].shoulder.rotation.x, -1.3 * ease, 8, dt);
    arms[1].shoulder.rotation.x = damp(arms[1].shoulder.rotation.x, -1.0 * ease, 8, dt);
    mesh.position.y = -0.2 * ease;
    mesh.rotation.z = (ud.deathDir || 1) * ease * 1.05;
    return;
  }
  const cycle = time * (2.6 + Math.sin(phase) * 0.4) + phase;
  const limp = 0.6 + Math.sin(phase * 2.1) * 0.18;
  if (moving) {
    legs[0].hip.rotation.x = damp(legs[0].hip.rotation.x, Math.sin(cycle) * 0.5 * limp, 8, dt);
    legs[1].hip.rotation.x = damp(legs[1].hip.rotation.x, Math.sin(cycle + Math.PI) * 0.35, 8, dt);
    legs[0].knee.rotation.x = damp(legs[0].knee.rotation.x, Math.max(0.1, Math.sin(cycle + 0.5) * 0.65), 9, dt);
    legs[1].knee.rotation.x = damp(legs[1].knee.rotation.x, Math.max(0.08, Math.sin(cycle + Math.PI + 0.35) * 0.45), 9, dt);
    torso.rotation.z = damp(torso.rotation.z, Math.sin(cycle * 0.5) * 0.14, 6, dt);
    torso.rotation.x = damp(torso.rotation.x, -0.14 + Math.sin(cycle) * 0.07, 6, dt);
    head.rotation.y = damp(head.rotation.y, Math.sin(cycle * 0.35) * 0.22, 5, dt);
    head.rotation.z = damp(head.rotation.z, Math.sin(cycle * 0.28) * 0.12, 5, dt);
    arms[0].shoulder.rotation.x = damp(arms[0].shoulder.rotation.x, -0.55 + Math.sin(cycle + 0.9) * 0.32, 7, dt);
    arms[1].shoulder.rotation.x = damp(arms[1].shoulder.rotation.x, -0.8 + Math.sin(cycle + 2.1) * 0.22, 7, dt);
    arms[0].elbow.rotation.x = damp(arms[0].elbow.rotation.x, -0.45, 7, dt);
    arms[1].elbow.rotation.x = damp(arms[1].elbow.rotation.x, -0.75, 7, dt);
    mesh.position.y = Math.abs(Math.sin(cycle)) * 0.028;
  }
  if (attacking || ud.attackT > 0) {
    const at = ud.attackT > 0 ? (1 - ud.attackT / 0.45) : 0;
    const lunge = Math.sin(at * Math.PI);
    arms[0].shoulder.rotation.x = damp(arms[0].shoulder.rotation.x, -1.45 * lunge, 14, dt);
    arms[1].shoulder.rotation.x = damp(arms[1].shoulder.rotation.x, -1.2 * lunge, 14, dt);
    torso.rotation.x = damp(torso.rotation.x, -0.3 * lunge, 12, dt);
  }
  if (hit || ud.hitFlash > 0) {
    const h = ud.hitFlash;
    torso.rotation.x = damp(torso.rotation.x, -0.35 * h * 5, 14, dt);
    head.rotation.x = damp(head.rotation.x, 0.25 * h * 4, 14, dt);
    torso.rotation.z = damp(torso.rotation.z, (ud.deathDir || 1) * h * 0.4, 12, dt);
  }
}

function setupMenu() {
  const ops = $('ops'), info = $('menuOpInfo');
  if (ops) { ops.innerHTML = ''; OPS.forEach((op, i) => {
    const b = document.createElement('button'); b.className = 'op-card' + (i === selectedOp ? ' active' : '');
    b.textContent = op.name; b.style.borderColor = i === selectedOp ? '#a9d47a' : '';
    b.onclick = () => { selectedOp = i; setupMenu(); }; ops.appendChild(b);
  }); }
  if (info) info.textContent = OPS[selectedOp].name + ' · ' + OPS[selectedOp].desc;
  const skins = $('skinPick');
  if (skins && !skins.children.length) {
    ['STANDARD', 'FIELD', 'NIGHT'].forEach((s, i) => {
      const b = document.createElement('button'); b.className = 'skin-chip'; b.textContent = s;
      b.onclick = () => { [...skins.children].forEach((x) => x.classList.remove('active')); b.classList.add('active'); };
      if (!i) b.classList.add('active'); skins.appendChild(b);
    });
  }
}
setupMenu();

function blockedAt(x, z, r = player.r) {
  for (const o of obstacles) {
    const cx = Math.max(o.x - o.hw, Math.min(x, o.x + o.hw));
    const cz = Math.max(o.z - o.hz, Math.min(z, o.z + o.hz));
    if ((x - cx) * (x - cx) + (z - cz) * (z - cz) < r * r) return o;
  }
  return null;
}

function startRoll(mx, mz) {
  if (player.dashCd > 0 || player.vaultT > 0 || player.rollT > 0) return false;
  let dx = mx, dz = mz, len = Math.hypot(dx, dz);
  if (len < 0.15) { dx = Math.sin(player.faceAngle || 0); dz = Math.cos(player.faceAngle || 0); len = 1; }
  player.rollX = dx / len; player.rollZ = dz / len; player.rollT = player.rollDur; player.dashCd = 1.05; player.invuln = 0.38;
  player.rollSide = Math.random() < 0.5 ? -1 : 1; return true;
}

function tryVault(mx, mz) {
  if (player.vaultT > 0 || player.rollT > 0 || Math.hypot(mx, mz) < 0.25) return false;
  const len = Math.hypot(mx, mz) || 1, dx = mx / len, dz = mz / len;
  let hit = null, best = Infinity;
  for (const o of obstacles) {
    const along = (o.x - player.x) * dx + (o.z - player.z) * dz;
    if (along < 0.35 || along > 1.35) continue;
    const side = Math.abs((o.x - player.x) * (-dz) + (o.z - player.z) * dx);
    const lateral = Math.abs(dx) > Math.abs(dz) ? o.hz : o.hw;
    if (side > lateral + player.r + 0.18) continue;
    if (along < best) { best = along; hit = o; }
  }
  if (!hit || hit.h > 2.2 || hit.h < 0.4) return false;
  const pad = (Math.abs(dx) > Math.abs(dz) ? hit.hw : hit.hz) + player.r + 0.25;
  const lx = player.x + dx * (best + pad), lz = player.z + dz * (best + pad);
  if (blockedAt(lx, lz, player.r * 0.9)) return false;
  player.vaultT = player.vaultDur = Math.max(0.48, Math.min(0.85, 0.42 + hit.h * 0.16));
  player.vaultX = dx; player.vaultZ = dz; player.vaultArc = Math.min(1.9, 0.65 + hit.h * 0.38);
  player.vaultStartX = player.x; player.vaultStartZ = player.z; player.vaultEndX = lx; player.vaultEndZ = lz;
  player.vaultHeight = hit.h; player.invuln = Math.max(player.invuln, 0.35); return true;
}

function showMsg(t) { const e = $('msg'); if (e) e.textContent = t; messageClock = 2.6; }

function updateHud() {
  const hp = $('hpBar'), ht = $('hpText'), lv = $('lvl'), xb = $('xpBar');
  if (hp) hp.style.width = (100 * player.hp / player.maxHp) + '%';
  if (ht) ht.textContent = Math.ceil(player.hp);
  if (lv) lv.textContent = level;
  if (xb) xb.style.width = (100 * xp / xpNeed) + '%';
  if ($('timer')) $('timer').textContent = String(Math.floor(elapsed / 60)).padStart(2, '0') + ':' + String(Math.floor(elapsed % 60)).padStart(2, '0');
  if ($('kills')) $('kills').textContent = kills;
  if ($('diff')) $('diff').textContent = (1 + elapsed / 150).toFixed(1);
  if ($('hudOp')) $('hudOp').textContent = OPS[selectedOp].name;
  if ($('loadout')) $('loadout').textContent = 'AR-15 · LV ' + weaponLevel + ' · ARMOR ' + armor;
}

function startGame() {
  $('menu')?.classList.add('hidden'); $('pause')?.classList.add('hidden'); $('over')?.classList.add('hidden');
  $('levelup')?.classList.add('hidden'); $('hud')?.classList.remove('hidden'); $('boot')?.classList.add('hidden');
