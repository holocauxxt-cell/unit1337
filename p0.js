// UNIT 1337 — 3D survivor (Three.js)
// Animations · zombie mobs · textured arena + props
const $ = (id) => document.getElementById(id);
const canvas = $('c');
const OPS = [
  { id: 'ghost', name: 'GHOST', hp: 100, speed: 1, dmg: 1, desc: 'Маска · баланс', accent: 0x6dd6a0 },
  { id: 'roach', name: 'ROACH', hp: 130, speed: 0.9, dmg: 0.95, desc: 'Тяжёлый · танк', accent: 0xd4a84b },
  { id: 'price', name: 'PRICE', hp: 85, speed: 1.15, dmg: 1.1, desc: 'Лёгкий · DPS', accent: 0x6eb5ff },
];
let selectedOp = OPS[0];
const selectedSkin = { ghost: 0, roach: 0, price: 0 };

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

// walls
const wallMat = new THREE.MeshStandardMaterial({ color: 0x2a3540, roughness: 0.9, metalness: 0.1 });
function addWall(w, h, x, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.6), wallMat);
  m.position.set(x, h / 2, z);
  scene.add(m);
}
addWall(WORLD + 1, 1.2, 0, -HALF);
addWall(WORLD + 1, 1.2, 0, HALF);
addWall(0.7, WORLD + 1, -HALF, 0);
addWall(0.7, WORLD + 1, HALF, 0);
const crateMat 