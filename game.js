// UNIT 1337 — RoR2-like survivor, CoD setting, Monster Survivors-style controls
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const $ = (id) => document.getElementById(id);

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

let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = (W * DPR) | 0;
  canvas.height = (H * DPR) | 0;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// ---- state ----
let selectedOp = OPS[0];
let running = false;
let paused = false;
let gameOver = false;
let time = 0;
let kills = 0;
let spawnAcc = 0;
let last = performance.now();
let msgTimer = 0;

const player = {
  x: 0, y: 0, vx: 0, vy: 0,
  r: 14, hp: 100, maxHp: 100,
  angle: 0, level: 1, xp: 0, xpNeed: 8,
  speedMul: 1, dmgMul: 1, fireRate: 0.22, range: 170,
  projectiles: 1, regen: 0, magnet: 70, crit: 0.05,
  dashCd: 0, dashCdMax: 1.6, dashT: 0, dashDirX: 1, dashDirY: 0,
  fireCd: 0, hurtT: 0,
};
const bullets = [];
const enemies = [];
const xpOrbs = [];
const particles = [];
const cam = { x: 0, y: 0 };
const keys = new Set();
const joy = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0, kx: 0, ky: 0 };
const WORLD = 2200;

// ---- UI boot ----
const opsEl = $('ops');
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
  // RoR2-like time scaling
  return 1 + time / 55 + Math.floor(time / 60) * 0.35;
}

function resetRun() {
  Object.assign(player, {
    x: 0, y: 0, vx: 0, vy: 0,
    hp: selectedOp.hp, maxHp: selectedOp.hp,
    angle: 0, level: 1, xp: 0, xpNeed: 8,
    speedMul: selectedOp.speed, dmgMul: selectedOp.dmg,
    fireRate: 0.22, range: 170, projectiles: 1, regen: 0,
    magnet: 70, crit: 0.05, dashCd: 0, dashCdMax: 1.6, dashT: 0,
    fireCd: 0, hurtT: 0,
  });
  bullets.length = 0;
  enemies.length = 0;
  xpOrbs.length = 0;
  particles.length = 0;
  time = 0;
  kills = 0;
  spawnAcc = 0;
  gameOver = false;
  paused = false;
  cam.x = 0;
  cam.y = 0;
  $('hudOp').textContent = selectedOp.name;
  $('loadout').textContent = 'AR-15 · AUTO · UNIT 1337';
  updateHud();
}

function updateHud() {
  $('hpText').textContent = Math.max(0, player.hp | 0);
  $('hpBar').style.transform = `scaleX(${Math.max(0, player.hp / player.maxHp)})`;
  $('lvl').textContent = player.level;
  $('xpBar').style.transform = `scaleX(${Math.min(1, player.xp / player.xpNeed)})`;
  $('kills').textContent = kills;
  $('diff').textContent = difficulty().toFixed(1);
  const m = (time / 60) | 0;
  const s = (time % 60) | 0;
  $('timer').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---- input: Monster Survivors-style dynamic joystick ----
function joyShow(x, y) {
  joy.active = true;
  joy.ox = x; joy.oy = y;
  joy.x = 0; joy.y = 0;
  const el = $('joy');
  el.classList.remove('hidden');
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  $('joyKnob').style.transform = 'translate(0,0)';
}
function joyMove(x, y) {
  if (!joy.active) return;
  let dx = x - joy.ox, dy = y - joy.oy;
  const max = 42;
  const len = Math.hypot(dx, dy) || 1;
  if (len > max) { dx = dx / len * max; dy = dy / len * max; }
  joy.x = dx / max;
  joy.y = dy / max;
  $('joyKnob').style.transform = `translate(${dx}px,${dy}px)`;
}
function joyHide() {
  joy.active = false;
  joy.id = null;
  joy.x = 0; joy.y = 0;
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
function endJoy(e) {
  if (e.pointerId !== joy.id) return;
  joyHide();
}
canvas.addEventListener('pointerup', endJoy);
canvas.addEventListener('pointercancel', endJoy);

let lastTap = 0;
canvas.addEventListener('pointerup', (e) => {
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
  let dx = joy.x, dy = joy.y;
  if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
  const len = Math.hypot(dx, dy);
  if (len < 0.1) {
    dx = Math.cos(player.angle);
    dy = Math.sin(player.angle);
  } else {
    dx /= len; dy /= len;
  }
  player.dashDirX = dx;
  player.dashDirY = dy;
  player.dashT = 0.18;
  player.dashCd = player.dashCdMax;
  burst(player.x, player.y, '#6dd6a0', 8);
}

function startGame() {
  resetRun();
  running = true;
  $('menu').classList.add('hidden');
  $('over').classList.add('hidden');
  $('levelup').classList.add('hidden');
  $('hud').classList.remove('hidden');
  showMsg('ВХОД В ЗОНУ', 1200);
  last = performance.now();
  requestAnimationFrame(frame);
}

function clampWorld(o, r) {
  const h = WORLD / 2;
  o.x = Math.max(-h + r, Math.min(h - r, o.x));
  o.y = Math.max(-h + r, Math.min(h - r, o.y));
}

function nearestEnemy() {
  let best = null, bd = player.range * player.range;
  for (const e of enemies) {
    const d = (e.x - player.x) ** 2 + (e.y - player.y) ** 2;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

function shoot() {
  const t = nearestEnemy();
  if (!t) return;
  const ang = Math.atan2(t.y - player.y, t.x - player.x);
  player.angle = ang;
  const n = player.projectiles;
  const spread = n > 1 ? 0.12 : 0;
  for (let i = 0; i < n; i++) {
    const a = ang + (i - (n - 1) / 2) * spread;
    let dmg = 12 * player.dmgMul;
    let crit = false;
    if (Math.random() < player.crit) { dmg *= 2.2; crit = true; }
    bullets.push({
      x: player.x + Math.cos(a) * 16,
      y: player.y + Math.sin(a) * 16,
      vx: Math.cos(a) * 520,
      vy: Math.sin(a) * 520,
      life: player.range / 520 + 0.05,
      r: crit ? 4 : 3,
      dmg,
      crit,
    });
  }
}

function spawnEnemy() {
  const diff = difficulty();
  const ang = Math.random() * Math.PI * 2;
  const dist = 380 + Math.random() * 160;
  const x = player.x + Math.cos(ang) * dist;
  const y = player.y + Math.sin(ang) * dist;
  const roll = Math.random();
  let type = 'grunt';
  if (diff > 1.8 && roll < 0.12) type = 'heavy';
  else if (roll < 0.22) type = 'rusher';
  else if (diff > 2.5 && roll < 0.28) type = 'elite';

  const base = {
    grunt: { hp: 28, speed: 70, r: 12, dmg: 8, color: '#6a7a5c', xp: 1 },
    rusher: { hp: 18, speed: 130, r: 10, dmg: 10, color: '#c4a35a', xp: 1 },
    heavy: { hp: 90, speed: 45, r: 18, dmg: 16, color: '#4a5560', xp: 3 },
    elite: { hp: 140, speed: 60, r: 16, dmg: 18, color: '#8b3a3a', xp: 5 },
  }[type];

  enemies.push({
    type, x, y,
    hp: base.hp * (0.85 + diff * 0.25),
    maxHp: base.hp * (0.85 + diff * 0.25),
    speed: base.speed * (0.95 + diff * 0.04),
    r: base.r, dmg: base.dmg, color: base.color, xp: base.xp,
    hitT: 0,
  });
}

function killEnemy(e, idx) {
  kills++;
  const n = e.xp + (Math.random() < 0.2 ? 1 : 0);
  for (let i = 0; i < n; i++) {
    xpOrbs.push({
      x: e.x + (Math.random() - 0.5) * 16,
      y: e.y + (Math.random() - 0.5) * 16,
      v: 0,
    });
  }
  burst(e.x, e.y, e.color, 10);
  enemies.splice(idx, 1);
}

function burst(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 40 + Math.random() * 120;
    particles.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: 0.25 + Math.random() * 0.35, color, r: 1.5 + Math.random() * 2,
    });
  }
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
  gameOver = true;
  running = false;
  joyHide();
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

  let mx = joy.x, my = joy.y;
  if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
  const ml = Math.hypot(mx, my);
  if (ml > 1) { mx /= ml; my /= ml; }

  const baseSpeed = 165 * player.speedMul;
  if (player.dashT > 0) {
    player.dashT -= dt;
    player.x += player.dashDirX * 520 * dt;
    player.y += player.dashDirY * 520 * dt;
  } else if (ml > 0.05) {
    player.x += mx * baseSpeed * dt;
    player.y += my * baseSpeed * dt;
    player.angle = Math.atan2(my, mx);
  }
  clampWorld(player, player.r);

  player.fireCd -= dt;
  if (player.fireCd <= 0) {
    shoot();
    player.fireCd = player.fireRate;
  }

  const rate = Math.max(0.25, 1.1 - difficulty() * 0.08);
  spawnAcc += dt;
  const cap = Math.min(70, 12 + difficulty() * 8);
  while (spawnAcc >= rate && enemies.length < cap) {
    spawnAcc -= rate;
    spawnEnemy();
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.hitT = Math.max(0, e.hitT - dt);
    const dx = player.x - e.x, dy = player.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    e.x += (dx / d) * e.speed * dt;
    e.y += (dy / d) * e.speed * dt;
    if (d < e.r + player.r - 2) {
      if (player.dashT <= 0) {
        player.hp -= e.dmg * dt * 1.6;
        player.hurtT = 0.12;
        if (player.hp <= 0) {
          player.hp = 0;
          endGame();
          return;
        }
      }
    }
  }

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    let hit = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if ((b.x - e.x) ** 2 + (b.y - e.y) ** 2 < (e.r + b.r) ** 2) {
        e.hp -= b.dmg;
        e.hitT = 0.1;
        hit = true;
        if (e.hp <= 0) killEnemy(e, j);
        break;
      }
    }
    if (hit || b.life <= 0) bullets.splice(i, 1);
  }

  for (let i = xpOrbs.length - 1; i >= 0; i--) {
    const o = xpOrbs[i];
    const dx = player.x - o.x, dy = player.y - o.y;
    const d = Math.hypot(dx, dy);
    if (d < player.magnet) {
      o.v = Math.min(420, o.v + 500 * dt);
      o.x += (dx / (d || 1)) * o.v * dt;
      o.y += (dy / (d || 1)) * o.v * dt;
    }
    if (d < player.r + 8) {
      player.xp += 1;
      xpOrbs.splice(i, 1);
      if (player.xp >= player.xpNeed) levelUp();
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.92;
    p.vy *= 0.92;
    if (p.life <= 0) particles.splice(i, 1);
  }

  cam.x += (player.x - cam.x) * Math.min(1, 6 * dt);
  cam.y += (player.y - cam.y) * Math.min(1, 6 * dt);
  updateHud();
}

function drawGrid() {
  const step = 80;
  const ox = -((cam.x % step) + step) % step;
  const oy = -((cam.y % step) + step) % step;
  ctx.strokeStyle = '#1a2430';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = ox; x < W + step; x += step) {
    ctx.moveTo(x, 0); ctx.lineTo(x, H);
  }
  for (let y = oy; y < H + step; y += step) {
    ctx.moveTo(0, y); ctx.lineTo(W, y);
  }
  ctx.stroke();
}

function w2s(x, y) {
  return { x: x - cam.x + W / 2, y: y - cam.y + H / 2 };
}

function draw() {
  ctx.fillStyle = '#0b1016';
  ctx.fillRect(0, 0, W, H);
  drawGrid();

  const a = w2s(-WORLD / 2, -WORLD / 2);
  ctx.strokeStyle = '#2a4a3a';
  ctx.lineWidth = 3;
  ctx.strokeRect(a.x, a.y, WORLD, WORLD);

  for (const o of xpOrbs) {
    const p = w2s(o.x, o.y);
    ctx.fillStyle = '#5ec8ff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const e of enemies) {
    const p = w2s(e.x, e.y);
    ctx.fillStyle = e.hitT > 0 ? '#fff' : e.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, e.r, 0, Math.PI * 2);
    ctx.fill();
    if (e.type === 'elite' || e.type === 'heavy') {
      ctx.strokeStyle = e.type === 'elite' ? '#ff6b6b' : '#8899aa';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (e.hp < e.maxHp) {
      ctx.fillStyle = '#0008';
      ctx.fillRect(p.x - e.r, p.y - e.r - 7, e.r * 2, 3);
      ctx.fillStyle = '#e25b5b';
      ctx.fillRect(p.x - e.r, p.y - e.r - 7, e.r * 2 * (e.hp / e.maxHp), 3);
    }
  }

  for (const b of bullets) {
    const p = w2s(b.x, b.y);
    ctx.fillStyle = b.crit ? '#ffe08a' : '#c8f5dd';
    ctx.beginPath();
    ctx.arc(p.x, p.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const p of particles) {
    const s = w2s(p.x, p.y);
    ctx.globalAlpha = Math.max(0, p.life * 2);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  const pp = w2s(player.x, player.y);
  ctx.save();
  ctx.translate(pp.x, pp.y);
  ctx.rotate(player.angle);
  ctx.fillStyle = player.hurtT > 0 ? '#ffaaaa' : '#3d5c4a';
  ctx.beginPath();
  ctx.arc(0, 0, player.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1e2e28';
  ctx.fillRect(4, -4, 18, 8);
  ctx.fillStyle = '#6dd6a0';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#6dd6a044';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(pp.x, pp.y, 22, 0, Math.PI * 2);
  ctx.stroke();
}

function frame(now) {
  if (!running && !gameOver) return;
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  if (running) update(dt);
  draw();
  if (running || gameOver) requestAnimationFrame(frame);
}

function menuFrame() {
  if (running) return;
  ctx.fillStyle = '#0b1016';
  ctx.fillRect(0, 0, W, H);
  drawGrid();
  requestAnimationFrame(menuFrame);
}
menuFrame();
