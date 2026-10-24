// UNIT 1337 — 3D survivor (Three.js)
// Animations · zombie mobs · textured arena + props
const $ = (id) => document.getElementById(id);
const canvas = $('c');
const OPS = [
  { id: 'ghost', name: 'GHOST', color: 0x3d5a4c, accent: 0x7dffb3, hp: 100, speed: 5.2, dmg: 12, firerate: 0.14, desc: 'сбалансированный' },
  { id: 'soap', name: 'SOAP', color: 0x4a5568, accent: 0x63b3ed, hp: 120, speed: 4.6, dmg: 14, firerate: 0.16, desc: 'танк · больше HP' },
  { id: 'price', name: 'PRICE', color: 0x5c4033, accent: 0xf6ad55, hp: 90, speed: 5.8, dmg: 11, firerate: 0.11, desc: 'быстрый · высокий DPS' },
];

let selectedOp = OPS[0];
const selectedSkin = { ghost: 0, soap: 0, price: 0 };

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0e12);
scene.fog = new THREE.Fog(0x0a0e12, 18, 55);

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
camera.position.set(0, 14, 12);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.shadowMap.enabled = false;

const hemi = new THREE.HemisphereLight(0x88aacc, 0x1a1520, 0.85);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffe8c8, 0.9);
dir.position.set(8, 16, 6);
scene.add(dir);
const amb = new THREE.AmbientLight(0x304050, 0.35);
scene.add(amb);

const WORLD = 28;
const HALF = WORLD / 2;

function makeCanvasTex(draw, size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

const groundTex = makeCanvasTex((ctx, s) => {
  ctx.fillStyle = '#1a222c';
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(80,100,120,${0.04 + Math.random() * 0.06})`;
    ctx.fillRect(Math.random() * s, Math.random() * s, 2 + Math.random() * 6, 2 + Math.random() * 6);
  }
  ctx.strokeStyle = 'rgba(100,140,160,0.12)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= s; i += 16) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(s, i); ctx.stroke();
  }
}, 128);
groundTex.repeat.set(12, 12);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(WORLD + 4, WORLD + 4),
  new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95, metalness: 0.05 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const crateTex = makeCanvasTex((ctx, s) => {
  ctx.fillStyle = '#6b4e2e';
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = '#3d2a14';
  ctx.lineWidth = 3;
  ctx.strokeRect(2, 2, s - 4, s - 4);
  ctx.beginPath(); ctx.moveTo(0, s / 2); ctx.lineTo(s, s / 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(s / 2, 0); ctx.lineTo(s / 2, s); ctx.stroke();
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  for (let i = 0; i < 8; i++) ctx.fillRect(Math.random() * s, Math.random() * s, 3, 8);
}, 64);

const metalTex = makeCanvasTex((ctx, s) => {
  ctx.fillStyle = '#4a5568';
  ctx.fillRect(0, 0, s, s);
  ctx.fillStyle = '#718096';
  for (let i = 0; i < 20; i++) ctx.fillRect(Math.random() * s, Math.random() * s, 4, 2);
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, s - 2, s - 2);
}, 32);

const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a3340, roughness: 0.9, metalness: 0.1 });
const crateMat