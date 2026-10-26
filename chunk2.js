  for (const a of [...zombies, ...bullets, ...drops]) { scene.remove(a.mesh || a); if (a.tracer) scene.remove(a.tracer); if (a.flash) scene.remove(a.flash); }
  for (const corpse of corpses) scene.remove(corpse.mesh);
  corpses.length = 0; zombies.length = 0; bullets.length = 0; drops.length = 0;
  elapsed = 0; fireClock = 0; spawnClock = 0; wave = 1; waveKills = 0; kills = 0;
  level = 1; xp = 0; xpNeed = 5; armor = 0; weaponLevel = 1;
  Object.assign(player, { x: 0, z: 0, hp: 100, maxHp: 100, dash: 0, dashCd: 0, invuln: 0, vaultT: 0, vaultY: 0, rollT: 0, rollX: 0, rollZ: 0, animState: 'idle', reloadT: 0, hitT: 0 });
  if (player.mesh) scene.remove(player.mesh);
  player.mesh = makeOperator(OPS[selectedOp].color);
  player.mesh.position.set(0, 0, 0); player.mesh.visible = true; player.mesh.scale.set(1, 1, 1);
  scene.add(player.mesh);
  camera.position.set(0.5, 15.5, 12); camera.lookAt(0, 0.5, 1.5);
  running = true; paused = false; dead = false; last = performance.now();
  showMsg('МИССИЯ НАЧАЛАСЬ · ВОЛНА 1'); updateHud();
}

function spawnZombie() {
  const a = Math.random() * Math.PI * 2, d = 18 + Math.random() * 10;
  const tough = wave % 5 === 0 && waveKills === 0 && Math.random() < 0.18;
  const mesh = makeZombie(tough ? 0x6e3532 : 0x52634c);
  mesh.scale.setScalar(tough ? 1.3 : 1);
  const z = { mesh, x: player.x + Math.cos(a) * d, z: player.z + Math.sin(a) * d, hp: tough ? 7 + wave : 2 + Math.floor(wave * 0.35), speed: (tough ? 1.3 : 1.65) + Math.min(wave * 0.045, 1), damage: tough ? 18 : 8, r: tough ? 0.65 : 0.42, attack: 0, tough, hitT: 0 };
  mesh.position.set(z.x, 0, z.z); scene.add(mesh); zombies.push(z);
}

function dropAt(x, z, type) {
  let color = type === 'chest' ? 0xd5a448 : type === 'heal' ? 0x4ee48a : type === 'armor' ? 0x66aaff : 0x65d8ff;
  const mesh = new THREE.Mesh(type === 'chest' ? new THREE.BoxGeometry(0.85, 0.58, 0.6) : new THREE.IcosahedronGeometry(0.3, 0), mat(color, 0.35, 0.25));
  mesh.position.set(x, type === 'chest' ? 0.35 : 0.45, z); mesh.castShadow = true; scene.add(mesh);
  drops.push({ mesh, x, z, type, bob: Math.random() * 6 });
}

function killZombie(i) {
  const z = zombies[i]; z.dead = true; z.deathT = 0.65;
  z.mesh.userData.deathDir = Math.random() < 0.5 ? -1 : 1;
  zombies.splice(i, 1);
  corpses.push({ mesh: z.mesh, life: 0.75, dir: z.mesh.userData.deathDir, deathT: 0.65 });
  kills++; waveKills++;
  if (Math.random() < 0.16) dropAt(z.x, z.z, Math.random() < 0.5 ? 'heal' : 'armor'); else dropAt(z.x, z.z, 'xp');
  if (z.tough) { dropAt(z.x, z.z, 'chest'); showMsg('ЭЛИТА УСТРАНЕНА · ДОБЫЧА'); }
  if (waveKills >= wave * 8) { wave++; waveKills = 0; dropAt(player.x + 2, player.z - 2, 'chest'); showMsg('ВОЛНА ' + wave + ' · ПОДКРЕПЛЕНИЕ'); }
  updateHud();
}

function shoot() {
  if (!zombies.length) return;
  let target = null, best = 25 * 25;
  for (const z of zombies) { const d = (z.x - player.x) ** 2 + (z.z - player.z) ** 2; if (d < best) { best = d; target = z; } }
  if (!target) return;
  const dx = target.x - player.x, dz = target.z - player.z, len = Math.hypot(dx, dz) || 1;
  player.faceAngle = Math.atan2(dx, dz);
  const ud = player.mesh.userData; ud.fireKick = 0.22;
  const muzzlePos = ud.muzzle ? ud.muzzle.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(player.x + (dx / len) * 0.55, 1.25, player.z + (dz / len) * 0.55);
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffc14d, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
  flash.scale.set(0.38, 0.38, 1); flash.position.copy(muzzlePos); scene.add(flash);
  const tracer = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffe0a0, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
  tracer.scale.set(0.55, 0.05, 1); tracer.position.copy(muzzlePos); scene.add(tracer);
  bullets.push({ mesh: tracer, tracer, flash, x: muzzlePos.x, y: muzzlePos.y, z: muzzlePos.z, vx: (dx / len) * 32, vz: (dz / len) * 32, life: 0.55, age: 0, damage: 1 + Math.floor((weaponLevel - 1) * 0.7) });
}

function levelUp() {
  level++; xp -= xpNeed; xpNeed = Math.ceil(xpNeed * 1.35); running = false;
  const box = $('choices');
  if (box) {
    box.innerHTML = '';
    const choices = [
      ['МЕДИЦИНА', 'Восстановить 35 HP', () => { player.hp = Math.min(player.maxHp, player.hp + 35); }],
      ['УСИЛЕНИЕ ОРУЖИЯ', 'Урон +1', () => { weaponLevel++; }],
      ['БРОНЯ', 'Поглотить часть урона', () => { armor++; }],
      ['АДРЕНАЛИН', 'Скорость +10%', () => { player.speed *= 1.1; }]
    ];
    choices.sort(() => Math.random() - 0.5).slice(0, 3).forEach(([name, desc, fn]) => {
      const b = document.createElement('button'); b.className = 'choice';
      b.innerHTML = '<b>' + name + '</b><span>' + desc + '</span>';
      b.onclick = () => { fn(); $('levelup').classList.add('hidden'); running = true; last = performance.now(); showMsg('УСИЛЕНИЕ ПОЛУЧЕНО'); updateHud(); };
      box.appendChild(b);
    });
  }
  $('levelup')?.classList.remove('hidden'); updateHud();
}

function endGame() {
  running = false; dead = true; $('hud')?.classList.add('hidden'); $('over')?.classList.remove('hidden');
  if ($('overStats')) $('overStats').textContent = 'Время: ' + ($('timer')?.textContent || '') + ' · Убийства: ' + kills + ' · Уровень: ' + level;
}

function pauseGame() {
  if (dead) return; paused = !paused;
  if (paused) { running = false; $('pause')?.classList.remove('hidden'); if ($('pauseStats')) $('pauseStats').textContent = 'Убийства: ' + kills + ' · Уровень: ' + level; }
  else { $('pause')?.classList.add('hidden'); running = true; last = performance.now(); }
}

$('btnStart')?.addEventListener('click', startGame);
$('btnRetry')?.addEventListener('click', startGame);
$('btnRestart')?.addEventListener('click', startGame);
$('btnMenu')?.addEventListener('click', () => { dead = false; $('over')?.classList.add('hidden'); $('hud')?.classList.add('hidden'); $('menu')?.classList.remove('hidden'); running = false; });
$('btnPauseMenu')?.addEventListener('click', () => { paused = false; running = false; $('pause')?.classList.add('hidden'); $('hud')?.classList.add('hidden'); $('menu')?.classList.remove('hidden'); });
$('btnResume')?.addEventListener('click', pauseGame);
$('btnPause')?.addEventListener('click', pauseGame);
$('btnDash')?.addEventListener('click', () => startRoll(player.moveX, player.moveZ));

addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === 'Escape' && !dead) pauseGame();
  if (e.code === 'Space') startRoll((keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0), (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0));
});
addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });

let touchStart = null;
canvas.addEventListener('pointerdown', (e) => { touchStart = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
canvas.addEventListener('pointermove', (e) => {
  if (touchStart && touchStart.id === e.pointerId && e.pointerType !== 'mouse') {
    player.moveX = Math.max(-1, Math.min(1, (e.clientX - touchStart.x) / 45));
    player.moveZ = Math.max(-1, Math.min(1, (e.clientY - touchStart.y) / 45));
  }
});
canvas.addEventListener('pointerup', (e) => { if (touchStart && touchStart.id === e.pointerId) { touchStart = null; player.moveX = 0; player.moveZ = 0; } });
canvas.addEventListener('pointercancel', () => { touchStart = null; player.moveX = 0; player.moveZ = 0; });

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000 || 0, 0.04); last = now; const time = now * 0.001;
  let mx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0) + player.moveX;
  let mz = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0) + player.moveZ;
  let len = Math.hypot(mx, mz); if (len > 1) { mx /= len; mz /= len; }

  if (running && !paused && !dead) {
    elapsed += dt; fireClock -= dt; spawnClock -= dt; chestClock -= dt; messageClock -= dt;
    if (messageClock <= 0 && $('msg')) $('msg').textContent = '';
    player.dash = Math.max(0, player.dash - dt); player.dashCd = Math.max(0, player.dashCd - dt);
    player.invuln = Math.max(0, player.invuln - dt); player.hitT = Math.max(0, player.hitT - dt); player.reloadT = Math.max(0, player.reloadT - dt);
    const rolling = player.rollT > 0, vaulting = player.vaultT > 0, speed = player.speed * (rolling ? 2.25 : 1);

    if (rolling) {
      const stepX = player.rollX * speed * dt, stepZ = player.rollZ * speed * dt;
      if (!blockedAt(player.x + stepX, player.z)) player.x += stepX;
      if (!blockedAt(player.x, player.z + stepZ)) player.z += stepZ;
      player.rollT = Math.max(0, player.rollT - dt);
    } else if (!vaulting && len > 0.1) {
      const nx = player.x + mx * speed * dt, nz = player.z + mz * speed * dt;
      if (!blockedAt(nx, nz)) { player.x = nx; player.z = nz; }
      else {
        if (!blockedAt(nx, player.z)) player.x = nx;
        if (!blockedAt(player.x, nz)) player.z = nz;
        if (blockedAt(nx, nz)) tryVault(mx, mz);
      }
    }
    if (vaulting) {
      const progress = 1 - player.vaultT / player.vaultDur;
      player.x = player.vaultStartX + (player.vaultEndX - player.vaultStartX) * progress;
      player.z = player.vaultStartZ + (player.vaultEndZ - player.vaultStartZ) * progress;
      player.vaultT = Math.max(0, player.vaultT - dt);
    }
    if (len > 0.1 && !rolling) player.faceAngle = Math.atan2(mx, mz);
    if (fireClock <= 0 && zombies.length && !rolling && player.reloadT <= 0) { shoot(); fireClock = Math.max(0.11, 0.22 - weaponLevel * 0.012); }
    if (spawnClock <= 0) { const count = 1 + Math.floor(wave * 0.35); for (let i = 0; i < count; i++) spawnZombie(); spawnClock = Math.max(0.7, 2.1 - wave * 0.06); }

    for (let i = zombies.length - 1; i >= 0; i--) {
      const z = zombies[i]; if (z.dead) continue;
      z.hitT = Math.max(0, (z.hitT || 0) - dt);
      const dx = player.x - z.x, dz = player.z - z.z, dist = Math.hypot(dx, dz) || 1;
      const spd = z.speed * (z.hitT > 0 ? 0.35 : 1);
      if (dist > z.r + player.r + 0.15) {
        if (!blockedAt(z.x + (dx / dist) * spd * dt, z.z, z.r * 0.8)) z.x += (dx / dist) * spd * dt;
        if (!blockedAt(z.x, z.z + (dz / dist) * spd * dt, z.r * 0.8)) z.z += (dz / dist) * spd * dt;
      } else {
        z.mesh.userData.attackT = 0.45;
        if (player.invuln <= 0) {
          let dmg = z.damage; if (armor > 0) dmg = Math.max(1, dmg - 3);
          player.hp -= dmg; player.hitT = 0.25; player.invuln = 0.35;
          if (player.hp <= 0) { player.hp = 0; endGame(); }
        }
      }
      z.mesh.position.x = z.x; z.mesh.position.z = z.z; z.mesh.rotation.y = Math.atan2(dx, dz);
      animateZombie(z.mesh, dt, time, { moving: dist > z.r + 0.5, attacking: z.mesh.userData.attackT > 0, hit: z.hitT > 0 });
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i]; b.life -= dt; b.age = (b.age || 0) + dt;
      b.x += b.vx * dt; b.z += b.vz * dt;
      if (b.tracer) { b.tracer.position.x = b.x; b.tracer.position.z = b.z; b.tracer.position.y = b.y || 1.2; }
      if (b.flash && b.age > 0.06) { scene.remove(b.flash); b.flash.material.dispose(); b.flash = null; }
      let hit = -1;
      for (let j = 0; j < zombies.length; j++) {
        if ((zombies[j].x - b.x) ** 2 + (zombies[j].z - b.z) ** 2 < (zombies[j].r + 0.2) ** 2) { hit = j; break; }
      }
      if (hit >= 0) {
        const target = zombies[hit]; target.hp -= b.damage; target.hitT = 0.18; target.mesh.userData.hitFlash = 0.15;
        const klen = Math.hypot(b.vx, b.vz) || 1; target.x -= (b.vx / klen) * 0.35; target.z -= (b.vz / klen) * 0.35;
        if (target.hp <= 0) killZombie(hit);
        scene.remove(b.tracer); if (b.flash) { scene.remove(b.flash); b.flash.material.dispose(); }
        b.tracer.material.dispose(); bullets.splice(i, 1);
      } else if (b.life <= 0) {
        scene.remove(b.tracer); if (b.flash) { scene.remove(b.flash); b.flash.material.dispose(); }
        b.tracer.material.dispose(); bullets.splice(i, 1);
      }
    }

    for (let i = corpses.length - 1; i >= 0; i--) {
      const corpse = corpses[i]; corpse.life -= dt;
      animateZombie(corpse.mesh, dt, time, { dying: true, deathProgress: 1 - Math.max(0, corpse.life / 0.75) });
      if (corpse.life <= 0) {
        scene.remove(corpse.mesh);
        corpse.mesh.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose()); else if (o.material) o.material.dispose(); } });
        corpses.splice(i, 1);
      }
    }

    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.mesh.position.y = (d.type === 'chest' ? 0.35 : 0.45) + Math.sin(now * 0.004 + d.bob) * 0.12;
      if ((d.x - player.x) ** 2 + (d.z - player.z) ** 2 < 1.7) {
        if (d.type === 'xp') { xp++; if (xp >= xpNeed) levelUp(); }
        else if (d.type === 'heal') player.hp = Math.min(player.maxHp, player.hp + 25);
        else if (d.type === 'armor') armor++;
        else if (d.type === 'chest') {
          const r = Math.random();
          if (r < 0.34) { player.hp = Math.min(player.maxHp, player.hp + 45); showMsg('СУНДУК · АПТЕЧКА'); }
          else if (r < 0.67) { weaponLevel++; showMsg('СУНДУК · УЛУЧШЕНИЕ ОРУЖИЯ'); }
          else { armor++; showMsg('СУНДУК · БРОНЯ +1'); }
        }
        scene.remove(d.mesh); drops.splice(i, 1); updateHud();
      }
    }

    if (chestClock <= 0) {
      if (elapsed > 15 && Math.random() < 0.4) dropAt(player.x + (Math.random() - 0.5) * 12, player.z + (Math.random() - 0.5) * 12, 'chest');
      chestClock = 24;
    }

    if (player.mesh) {
      player.mesh.position.x = player.x; player.mesh.position.z = player.z;
      const moveAmt = Math.min(1, len);
      animateOperator(player.mesh, dt, time, {
        moving: moveAmt > 0.1 && !rolling && !vaulting, sprint: moveAmt, aiming: true, firing: fireClock > 0.12,
        rolling, vaulting, vaultProgress: vaulting ? 1 - player.vaultT / player.vaultDur : 0, vaultHeight: player.vaultHeight,
        rollProgress: rolling ? 1 - player.rollT / player.rollDur : 0, rollSide: player.rollSide,
        hit: player.hitT > 0, reloading: player.reloadT > 0, faceAngle: player.faceAngle
      });
    }
    updateHud();
  }

  if (player.mesh) {
    const camX = player.x + 0.5, camZ = player.z + 12;
    camera.position.x += (camX - camera.position.x) * Math.min(1, dt * 7);
    camera.position.z += (camZ - camera.position.z) * Math.min(1, dt * 7);
    camera.position.y += (15.5 - camera.position.y) * Math.min(1, dt * 7);
    camera.lookAt(player.x, 0.5, player.z + 1.5);
  }
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
});

$('boot')?.classList.add('hidden');
requestAnimationFrame(frame);
