// UNIT 1337 — 3D survivor (Three.js)
// RoR2-like camera · CoD setting · Monster Survivors controls
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const $ = (id) => document.getElementById(id);
const canvas = $('c');

const OPS = [
  { id: 'ghost', name: 'GHOST', hp: 100, speed: 1, dmg: 1, desc: 'Сбалансированный оператор' },
  { id: 'roach', name: 'ROACH', hp: 130, speed: 0.9, dmg: 0.95, desc: 'Танк · больше HP' },
  { id: 'soap', name: 'SOAP', hp: 90, speed: 1.15, dmg: 1.05, desc: 'Лёгкий · выше скорость' },
];

const ITEM_POOL = [
  { id: 'ap', name: 'Бронебойные', desc: 'Урон +18%', apply: (p) => { p.dmgMul *= 1.18; } },
  { id: 'grip', name: 'Тактическая рукоять', desc: 'Скорострельность +15%', apply: (p) => { p.fireRate *= 0.85; } },
  { id: 'optic', name: 'Коллиматор', desc: 'Дальность +20%', apply: (p) => { p.range *= 1.2; } },
  { id: 'boots', name: 'Тактические ботинки', desc: 'Скорость +12%', apply: (p) => { p.speedMul *= 1.12; } },
  { id: 'plate', name: 'Керамическая плита', desc: 'Макс. HP +25', apply: (p) => { p.maxHp += 25; p.hp += 25; } },
  { id: 'stim', name: 'Боевой стимулятор', desc: 'Реген 2 HP/с', apply: (p) => { p.regen += 2; } },
  { id: 'mag', name: 'Расширенный магазин', desc: 'Мультивыстрел +1', apply: (p) => { p.projectiles += 1; } },
  { id: 'dashcd', name: 'Лёгкий рюкзак', desc: 'Кулдаун рывка −20%', apply: (p) => { p.dashCdMax *= 0.8; } },
  { id: 'pickup', name: 'Магнитный модуль', desc: 'Радиус сбора XP +30%', apply: (p) => { p.magnet *= 1.3; } },
  { id: 'crit', name: 'Снайперский патрон', desc: 'Крит 15% ×2.2', apply: (p) => { p.crit = Math.min(0.5, p.crit + 0.15); } },
];

const WORLD = 48;
const HALF = WORLD / 2;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x0a1016, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a1016, 28, 70);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.2, 120);
const camOffset = new THREE.Vector3(0, 22, 16);
camera.position.copy(camOffset);
camera.lookAt(0, 0, 0);

scene.add(new THREE.AmbientLight(0x6a7a88, 0.55));
const sun = new THREE.DirectionalLight(0xc8d8e8, 1.1);
sun.position.set(12, 28, 8);
scene.add(sun);
const rim = new THREE.DirectionalLight(0x4a8a6a, 0.35);
rim.position.set(-10, 8, -12);
scene.add(rim);

const groundMat = new THREE.MeshStandardMaterial({ color: 0x141c22, roughness: 0.92, metalness: 0.05 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD, WORLD), groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const grid = new THREE.GridHelper(WORLD, 24, 0x2a3a48, 0x1a2430);
grid.position.y = 0.02;
scene.add(grid);

const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e3a30, roughness: 0.85, metalness: 0.1 });
function addWall(w, d, x, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), wallMat);
  m.position.set(x, 0.6, z);
  scene.add(m);
}
addWall(WORLD + 1, 0.6, 0, -HALF);
addWall(WORLD + 1, 0.6, 0, HALF);
addWall(0.6, WORLD + 1, -HALF, 0);
addWall(0.6, WORLD + 1, HALF, 0);

const geoBody = new THREE.CapsuleGeometry(0.35, 0.7, 4, 8);
const geoHead = new THREE.SphereGeometry(0.22, 8, 8);
const geoRifle = new THREE.BoxGeometry(0.12, 0.1, 0.7);
const geoEnemy = new THREE.CapsuleGeometry(0.32, 0.55, 4, 8);
const geoBullet = new THREE.SphereGeometry(0.12, 6, 6);
const geoXp = new THREE.OctahedronGeometry(0.22, 0);

const matPlayer = new THREE.MeshStandardMaterial({ color: 0x3d5c4a, roughness: 0.55, metalness: 0.25, emissive: 0x0a2018, emissiveIntensity: 0.35 });
const matHead = new THREE.MeshStandardMaterial({ color: 0xc8b8a0, roughness: 0.7 });
const matRifle = new THREE.MeshStandardMaterial({ color: 0x1a2228, roughness: 0.4, metalness: 0.6 });
const matBullet = new THREE.MeshStandardMaterial({ color: 0xc8f5dd, emissive: 0x6dd6a0, emissiveIntensity: 1.2 });
const matBulletCrit = new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffaa33, emissiveIntensity: 1.4 });
const matXp = new THREE.MeshStandardMaterial({ color: 0x5ec8ff, emissive: 0x2a80ff, emissiveIntensity: 1.1 });

const enemyMats = {
  grunt: new THREE.MeshStandardMaterial({ color: 0x6a7a5c, roughness: 0.7 }),
  rusher: new THREE.MeshStandardMaterial({ color: 0xc4a35a, roughness: 0.65 }),
  heavy: new THREE.MeshStandardMaterial({ color: 0x4a5560, roughness: 0.55, metalness: 0.3 }),
  elite: new THREE.MeshStandardMaterial({ color: 0x8b3a3a, roughness: 0.5, emissive: 0x401010, emissiveIntensity: 0.4 }),
};

const playerRoot = new THREE.Group();
const playerBody = new THREE.Mesh(geoBody, matPlayer);
playerBody.position.y = 0.7;
const playerHead = new THREE.Mesh(geoHead, matHead);
playerHead.position.y = 1.35;
const playerRifle = new THREE.Mesh(geoRifle, matRifle);
playerRifle.position.set(0.35, 0.85, 0.25);
playerRoot.add(playerBody, playerHead, playerRifle);
scene.add(playerRoot);

const ringGeo = new THREE.RingGeometry(0.7, 0.85, 32);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x6dd6a0, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
const playerRing = new THREE.Mesh(ringGeo, ringMat);
playerRing.rotation.x = -Math.PI / 2;
playerRing.position.y = 0.05;
playerRoot.add(playerRing);

const bulletPool = [];
const enemyPool = [];
const xpPool = [];
const activeBullets = [];
const activeEnemies = [];
const activeXp = [];

function acquireBullet(crit) {
  let b = bulletPool.pop();
  if (!b) {
    b = { mesh: new THREE.Mesh(geoBullet, matBullet), vx: 0, vz: 0, life: 0, dmg: 0, crit: false };
    scene.add(b.mesh);
  }
  b.mesh.material = crit ? matBulletCrit : matBullet;
  b.mesh.visible = true;
  b.crit = crit;
  activeBullets.push(b);
  return b;
}
function releaseBullet(b, i) {
  b.mesh.visible = false;
  activeBullets.splice(i, 1);
  bulletPool.push(b);
}

function acquireEnemy(type) {
  let e = enemyPool.pop();
  if (!e) {
    e = { mesh: new THREE.Mesh(geoEnemy, enemyMats.grunt), type: 'grunt', hp: 1, maxHp: 1, speed: 1, r: 0.45, dmg: 8, xp: 1, hitT: 0 };
    scene.add(e.mesh);
  }
  e.mesh.material = enemyMats[type] || enemyMats.grunt;
  e.mesh.visible = true;
  e.type = type;
  activeEnemies.push(e);
  return e;
}
function releaseEnemy(e, i) {
  e.mesh.visible = false;
  activeEnemies.splice(i, 1);
  enemyPool.push(e);
}

function acquireXp() {
  let o = xpPool.pop();
  if (!o) {
    o = { mesh: new THREE.Mesh(geoXp, matXp), v: 0 };
    scene.add(o.mesh);
  }
  o.mesh.visible = true;
  o.v = 0;
  activeXp.push(o);
  return o;
}
function releaseXp(o, i) {
  o.mesh.visible = false;
  activeXp.splice(i, 1);
  xpPool.push(o);
}

let selectedOp = OPS[0];
let running = false, paused = false, gameOver = false;
let time = 0, kills = 0, spawnAcc = 0, last = performance.now(), msgTimer = 0, raf = 0;

const player = {
  x: 0, z: 0, angle: 0, r: 0.45, hp: 100, maxHp: 100,
  level: 1, xp: 0, xpNeed: 8, speedMul: 1, dmgMul: 1, fireRate: 0.22, range: 12,
  projectiles: 1, regen: 0, magnet: 4.5, crit: 0.05,
  dashCd: 0, dashCdMax: 1.6, dashT: 0, dashDirX: 1, dashDirZ: 0, fireCd: 0, hurtT: 0,
};

const keys = new Set();
const joy = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
const camTarget = new THREE.Vector3();

const opsEl = $('ops');
opsEl.innerHTML = '';
OPS.forEach((op, i) => {
  const d = document.createElement('div');
  d.className = 'op' + (i === 0 ? ' selected' : '');
  d.innerHTML = `<strong>${op.name}</strong><span>${op.desc}</span>`;
  d.onclick = () => {
    selectedOp = op;
    opsEl.querySelectorAll('.op').forEach((e) => e.classList.remove('selected'));
    d.classList.add('selected');
  };
  opsEl.appendChild(d);
});
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
    x: 0, z: 0, angle: 0, hp: selectedOp.hp, maxHp: selectedOp.hp,
    level: 1, xp: 0, xpNeed: 8, speedMul: selectedOp.speed, dmgMul: selectedOp.dmg,
    fireRate: 0.22, range: 12, projectiles: 1, regen: 0, magnet: 4.5, crit: 0.05,
    dashCd: 0, dashCdMax: 1.6, dashT: 0, fireCd: 0, hurtT: 0,
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
canvas.addEventListener('pointercancel', endJoy);

let lastTap = 0;
canvas.addEventListener('pointerup', () => {
  if (!running || paused) return;
  const now = performance.now();
  if (now - lastTap < 280) tryDash();
  lastTap = now;
});

window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (e.code === 'Space') { e.preventDefault(); tryDash(); }
  if (e.code === 'Escape' && running) togglePause();
});
window.addEventListener('keyup', (e) => keys.delete(e.code));

$('btnDash').onclick = () => tryDash();
$('btnPause').onclick = () => togglePause();
$('btnStart').onclick = () => startGame();
$('btnRetry').onclick = () => startGame();
$('btnMenu').onclick = () => {
  running = false;
  $('over').classList.add('hidden');
  $('hud').classList.add('hidden');
  $('menu').classList.remove('hidden');
};

function togglePause() {
  if (gameOver || !running) return;
  paused = !paused;
  $('btnPause').textContent = paused ? '▶' : 'Ⅱ';
  showMsg(paused ? 'ПАУЗА' : 'БОЙ');
}

function tryDash() {
  if (!running || paused || gameOver) return;
  if (player.dashCd > 0 || player.dashT > 0) return;
  let dx = joy.x, dz = joy.y;
  if (keys.has('KeyW') || keys.has('ArrowUp')) dz -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) dz += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
  const len = Math.hypot(dx, dz);
  if (len < 0.1) { dx = Math.sin(player.angle); dz = Math.cos(player.angle); }
  else { dx /= len; dz /= len; }
  player.dashDirX = dx; player.dashDirZ = dz;
  player.dashT = 0.18; player.dashCd = player.dashCdMax;
}

function startGame() {
  resetRun();
  running = true;
  $('menu').classList.add('hidden');
  $('over').classList.add('hidden');
  $('levelup').classList.add('hidden');
  $('hud').classList.remove('hidden');
  showMsg('ВХОД В ЗОНУ · 3D', 1200);
  last = performance.now();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(frame);
}

function clampPlayer() {
  const lim = HALF - player.r - 0.4;
  player.x = Math.max(-lim, Math.min(lim, player.x));
  player.z = Math.max(-lim, Math.min(lim, player.z));
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
    b.mesh.position.set(player.x + sx * 0.7, 0.9, player.z + sz * 0.7);
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
  const lim = HALF - 1;
  x = Math.max(-lim, Math.min(lim, x));
  z = Math.max(-lim, Math.min(lim, z));
  const roll = Math.random();
  let type = 'grunt';
  if (diff > 1.8 && roll < 0.12) type = 'heavy';
  else if (roll < 0.22) type = 'rusher';
  else if (diff > 2.5 && roll < 0.28) type = 'elite';
  const base = {
    grunt: { hp: 28, speed: 3.2, r: 0.42, dmg: 8, xp: 1 },
    rusher: { hp: 18, speed: 5.4, r: 0.38, dmg: 10, xp: 1 },
    heavy: { hp: 90, speed: 2.0, r: 0.55, dmg: 16, xp: 3 },
    elite: { hp: 140, speed: 2.6, r: 0.5, dmg: 18, xp: 5 },
  }[type];
  const e = acquireEnemy(type);
  e.hp = base.hp * (0.85 + diff * 0.25);
  e.maxHp = e.hp;
  e.speed = base.speed * (0.95 + diff * 0.04);
  e.r = base.r; e.dmg = base.dmg; e.xp = base.xp; e.hitT = 0;
  e.mesh.position.set(x, base.r + 0.15, z);
  e.mesh.scale.setScalar(type === 'heavy' ? 1.35 : type === 'elite' ? 1.2 : 1);
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

function update(dt) {
  if (paused || gameOver) return;
  time += dt;
  player.dashCd = Math.max(0, player.dashCd - dt);
  player.hurtT = Math.max(0, player.hurtT - dt);
  if (player.regen > 0 && player.hp < player.maxHp) {
    player.hp = Math.min(player.maxHp, player.hp + player.regen * dt);
  }

  let mx = joy.x, mz = joy.y;
  if (keys.has('KeyW') || keys.has('ArrowUp')) mz -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) mz += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
  const ml = Math.hypot(mx, mz);
  if (ml > 1) { mx /= ml; mz /= ml; }

  const baseSpeed = 7.5 * player.speedMul;
  if (player.dashT > 0) {
    player.dashT -= dt;
    player.x += player.dashDirX * 22 * dt;
    player.z += player.dashDirZ * 22 * dt;
  } else if (ml > 0.05) {
    player.x += mx * baseSpeed * dt;
    player.z += mz * baseSpeed * dt;
    player.angle = Math.atan2(mx, mz);
  }
  clampPlayer();

  playerRoot.position.set(player.x, 0, player.z);
  playerRoot.rotation.y = player.angle;
  matPlayer.emissiveIntensity = player.hurtT > 0 ? 0.9 : 0.35;
  matPlayer.color.setHex(player.hurtT > 0 ? 0xaa5555 : 0x3d5c4a);
  playerRing.material.opacity = 0.35 + 0.15 * Math.sin(time * 4);

  player.fireCd -= dt;
  if (player.fireCd <= 0) { shoot(); player.fireCd = player.fireRate; }

  const rate = Math.max(0.28, 1.15 - difficulty() * 0.08);
  spawnAcc += dt;
  const cap = Math.min(55, 10 + difficulty() * 7);
  while (spawnAcc >= rate && activeEnemies.length < cap) {
    spawnAcc -= rate;
    spawnEnemy();
  }

  for (let i = activeEnemies.length - 1; i >= 0; i--) {
    const e = activeEnemies[i];
    e.hitT = Math.max(0, e.hitT - dt);
    const dx = player.x - e.mesh.position.x;
    const dz = player.z - e.mesh.position.z;
    const d = Math.hypot(dx, dz) || 1;
    e.mesh.position.x += (dx / d) * e.speed * dt;
    e.mesh.position.z += (dz / d) * e.speed * dt;
    e.mesh.rotation.y = Math.atan2(dx, dz);
    if (e.mesh.material.emissive) {
      e.mesh.material.emissiveIntensity = e.hitT > 0 ? 0.8 : (e.type === 'elite' ? 0.4 : 0);
    }
    if (d < e.r + player.r && player.dashT <= 0) {
      player.hp -= e.dmg * dt * 1.5;
      player.hurtT = 0.12;
      if (player.hp <= 0) { player.hp = 0; endGame(); return; }
    }
  }

  for (let i = activeBullets.length - 1; i >= 0; i--) {
    const b = activeBullets[i];
    b.mesh.position.x += b.vx * dt;
    b.mesh.position.z += b.vz * dt;
    b.life -= dt;
    let hit = false;
    for (let j = activeEnemies.length - 1; j >= 0; j--) {
      const e = activeEnemies[j];
      const dx = b.mesh.position.x - e.mesh.position.x;
      const dz = b.mesh.position.z - e.mesh.position.z;
      if (dx * dx + dz * dz < (e.r + 0.2) * (e.r + 0.2)) {
        e.hp -= b.dmg; e.hitT = 0.1; hit = true;
        if (e.hp <= 0) killEnemy(e, j);
        break;
      }
    }
    if (hit || b.life <= 0) releaseBullet(b, i);
  }

  for (let i = activeXp.length - 1; i >= 0; i--) {
    const o = activeXp[i];
    const dx = player.x - o.mesh.position.x;
    const dz = player.z - o.mesh.position.z;
    const d = Math.hypot(dx, dz);
    o.mesh.rotation.y += dt * 3;
    o.mesh.position.y = 0.35 + Math.sin(time * 4 + i) * 0.08;
    if (d < player.magnet) {
      o.v = Math.min(14, o.v + 18 * dt);
      o.mesh.position.x += (dx / (d || 1)) * o.v * dt;
      o.mesh.position.z += (dz / (d || 1)) * o.v * dt;
    }
    if (d < player.r + 0.5) {
      player.xp += 1;
      releaseXp(o, i);
      if (player.xp >= player.xpNeed) levelUp();
    }
  }

  camTarget.x += (player.x - camTarget.x) * Math.min(1, 5 * dt);
  camTarget.z += (player.z - camTarget.z) * Math.min(1, 5 * dt);
  camera.position.x = camTarget.x + camOffset.x;
  camera.position.y = camOffset.y;
  camera.position.z = camTarget.z + camOffset.z;
  camera.lookAt(camTarget.x, 0.5, camTarget.z);
  updateHud();
}

function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', onResize);
onResize();

function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  if (running) update(dt);
  else if (!gameOver) {
    camera.position.x = Math.sin(now * 0.00025) * 8;
    camera.position.z = 18 + Math.cos(now * 0.00025) * 4;
    camera.position.y = 16;
    camera.lookAt(0, 0, 0);
  }
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
raf = requestAnimationFrame(frame);
