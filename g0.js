// UNIT 1337 — 3D survivor (Three.js)
// Animations · zombie mobs · textured arena + props
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
function makeTex(draw, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  draw(g, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const groundTex = makeTex((g, s) => {
  g.fillStyle = '#1a2228';
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * s, y = Math.random() * s;
    const r = 8 + Math.random() * 40;
    g.fillStyle = `rgba(${20 + Math.random() * 30},${28 + Math.random() * 25},${30 + Math.random() * * 20},${0.15 + Math.random() * 0.25})`;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  g.strokeStyle = 'rgba(60,80,70,0.25)';
  g.lineWidth = 2;
  for (let i = 0; i < s; i += 32) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, s); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(s, i); g.stroke();
  }
  g.strokeStyle = 'rgba(10,12,14,0.5)';
  g.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    g.beginPath();
    let x = Math.random() * s, y = Math.random() * s;
    g.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (Math.random() - 0.5) * 40;
      y += (Math.random() - 0.5) * 40;
      g.lineTo(x, y);
    }
    g.stroke();
  }
}, 512);
groundTex.repeat.set(6, 6);
const crateTex = makeTex((g, s) => {
  g.fillStyle = '#5a4030';
  g.fillRect(0, 0, s, s);
  g.strokeStyle = '#3a2818';
  g.lineWidth = 6;
  for (let i = 0; i <= s; i += s / 4) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, s); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(s, i); g.stroke();
  }
}, 128);
const metalTex = makeTex((g, s) => {
  g.fillStyle = '#3a4550';
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 30; i++) {
    g.fillStyle = `rgba(${40 + Math.random() * 40},${50 + Math.random() * 40},${55 + Math.random() * 40},0.4)`;
    g.fillRect(Math.random() * s, Math.random() * s, 2 + Math.random() * 20, 1 + Math.random() * 3);
  }
}, 128);
const wallTex = makeTex((g, s) => {
  g.fillStyle = '#243028';
  g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 16) {
    for (let x = 0; x < s; x += 32) {
      const ox = (y / 16) % 2 === 0 ? 0 : 16;
      g.fillStyle = `rgb(${30 + Math.random() * 15},${40 + Math.random() * 18},${34 + Math.random() * 12})`;
      g.fillRect(x + ox, y, 30, 14);
    }
  }
}, 256);
wallTex.repeat.set(8, 1);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x0a1016, 1);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a1016, 22, 62);
const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.2, 120);
const camOffset = new THREE.Vector3(0, 20, 15);
camera.position.copy(camOffset);
scene.add(new THREE.AmbientLight(0x6a7a88, 0.45));
const sun = new THREE.DirectionalLight(0xc8d8e8, 1.05);
sun.position.set(12, 28, 8);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0x88aacc, 0x221810, 0.35));
const groundMat = new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95, metalness: 0.05, color: 0x889999 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD, WORLD), groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9, metalness: 0.05, color: 0xaabbcc });
function addWall(w, d, x, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.6, d), wallMat);
  m.position.set(x, 0.8, z);
  scene.add(m);
}
addWall(WORLD + 1, 0.7, 0, -HALF);
addWall(WORLD + 1, 0.7, 0, HALF);
addWall(0.7, WORLD + 1, -HALF, 0);
addWall(0.7, WORLD + 1, HALF, 0);
const crateMat = new THREE.MeshStandardMaterial({ map: crateTex, roughness: 0.85 });
const metalMat = new THREE.MeshStandardMaterial({ map: metalTex, roughness: 0.45, metalness: 0.55, color: 0xaabbcc });
const barrierMat = new THREE.MeshStandardMaterial({ color: 0x8a6a20, roughness: 0.7 });
const lampMat = new THREE.MeshStandardMaterial({ color: 0x333840, metalness: 0.6 });
const lampGlow = new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xffaa44, emissiveIntensity: 1.2 });
function placeCrate(x, z, s = 1) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.1 * s, 1.1 * s, 1.1 * s), crateMat);
  m.position.set(x, 0.55 * s, z);
  scene.add(m);
}
function placeBarrel(x, z) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 1.15, 10), metalMat);
  m.position.set(x, 0.58, z);
  scene.add(m);
}
function placeBarrier(x, z, rot = 0) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 0.55), barrierMat);
  base.position.y = 0.35;
  g.add(base);
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  scene.add(g);
}
function placeLamp(x, z) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.4, 6), lampMat);
  pole.position.y = 1.2;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.35), lampGlow);
  head.position.y = 2.45;
  g.add(pole, head);
  g.position.set(x, 0, z);
  scene.add(g);
  const light = new THREE.PointLight(0xffcc77, 0.5, 10, 2);
  light.position.set(x, 2.3, z);
  scene.add(light);
}
const rnd = (() => { let s = 1337; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
for (let i = 0; i < 16; i++) {
  const a = rnd() * Math.PI * 2, d = 6 + rnd() * 14;
  const x = Math.cos(a) * d, z = Math.sin(a) * d;
  if (Math.hypot(x, z) < 4) continue;
  const t = rnd();
  if (t < 0.4) placeCrate(x, z, 0.85 + rnd() * 0.4);
  else if (t < 0.65) placeBarrel(x, z);
  else placeBarrier(x, z, rnd() * Math.PI);
}
[[-16,-16],[16,-16],[-16,16],[16,16],[0,-18],[0,18]].forEach(([x,z],i) => {
  placeLamp(x*0.85, z*0.85);
  if (i < 4) { placeCrate(x*0.7, z*0.7, 1.1); placeBarrel(x*0.7+1.2, z*0.7); }
});
// PLAYER + ZOMBIES continued in g1
const matPlayer = new THREE.MeshStandardMaterial({ color: 0x3d5c4a, roughness: 0.55, metalness: 0.25, emissive: 0x0a2018, emissiveIntensity: 0.3 });
const matHead = new THREE.MeshStandardMaterial({ color: 0xc8b8a0, roughness: 0.7 });
const matRifle = new THREE.MeshStandardMaterial({ color: 0x1a2228, roughness: 0.4, metalness: 0.65 });
const matBoot = new THREE.MeshStandardMaterial({ color: 0x2a3228, roughness: 0.8 });
const playerRoot = new THREE.Group();
const playerTorso = new THREE.Group();
const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 4, 8), matPlayer);
body.position.y = 0.95;
const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), matHead);
head.position.y = 1.48;
playerTorso.add(body, head);
const legL = new THREE.Group(), legR = new THREE.Group();
const legGeo = new THREE.CapsuleGeometry(0.1, 0.35, 3, 6);
const legMeshL = new THREE.Mesh(legGeo, matBoot); legMeshL.position.y = -0.25; legL.add(legMeshL);
const legMeshR = new THREE.Mesh(legGeo, matBoot); legMeshR.position.y = -0.25; legR.add(legMeshR);
legL.position.set(-0.14, 0.55, 0); legR.position.set(0.14, 0.55, 0);
const armL = new THREE.Group(), armR = new THREE.Group();
const armGeo = new THREE.CapsuleGeometry(0.08, 0.28, 3, 6);
const armMeshL = new THREE.Mesh(armGeo, matPlayer); armMeshL.position.y = -0.2; armL.add(armMeshL);
const armMeshR = new THREE.Mesh(armGeo, matPlayer); armMeshR.position.y = -0.2; armR.add(armMeshR);
armL.position.set(-0.38, 1.15, 0.05); armR.position.set(0.38, 1.15, 0.05);
const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.75), matRifle);
rifle.position.set(0.15, -0.15, 0.35); armR.add(rifle);
playerTorso.add(armL, armR);
playerRoot.add(playerTorso, legL, legR);
scene.add(playerRoot);
const playerRing = new THREE.Mesh(new THREE.RingGeometry(0.65, 0.8, 32), new THREE.MeshBasicMaterial({ color: 0x6dd6a0, transparent: true, opacity: 0.4, side: THREE.DoubleSide }));
playerRing.rotation.x = -Math.PI / 2; playerRing.position.y = 0.04; playerRoot.add(playerRing);
