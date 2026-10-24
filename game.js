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

const matPlayer = new THREE.MeshStandardMaterial({ color: 0x3d5c4a, roughness: 0.55, metalness: 0.25, emissive: 0x0a2018, emiss impIntensity: 0.35 });
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

// RESTORE incomplete intentionally - use full restore from disk via next message
console.error('RESTORE_PARTIAL');
