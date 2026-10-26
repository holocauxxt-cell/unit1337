// UNIT 1337 — Operation Survivors
const $ = (id) => document.getElementById(id);
const canvas = $('c');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x152028);
scene.fog = new THREE.Fog(0x152028, 45, 100);
const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 180);
camera.position.set(0, 16, 14);
camera.lookAt(0, 0.6, 0);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
scene.add(new THREE.AmbientLight(0x7a8a9a, 0.55));
scene.add(new THREE.HemisphereLight(0xd0e4f5, 0x3a4838, 1.35));
const sun = new THREE.DirectionalLight(0xfff2d8, 2.6);
sun.position.set(-14, 26, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 2; sun.shadow.camera.far = 80;
sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
scene.add(sun);
const fill = new THREE.DirectionalLight(0x88aacc, 0.55);
fill.position.set(10, 12, -8);
scene.add(fill);

const mat = (color, roughness = 0.82, metalness = 0.02) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

function addEdge(mesh, color = 0x0c1014, inflate = 1.045) {
  const g = mesh.geometry;
  if (!g) return;
  const edge = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.BackSide }));
  edge.scale.setScalar(inflate);
  edge.renderOrder = -1;
  mesh.add(edge);
}

const groundMat = mat(0x3d4f46);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const floorMarkMat = new THREE.MeshStandardMaterial({ color: 0x6a776b, roughness: 1, transparent: true, opacity: 0.17 });
for (let i = -4; i <= 4; i++) {
  const lineA = new THREE.Mesh(new THREE.BoxGeometry(78, 0.012, 0.035), floorMarkMat);
  lineA.position.set(0, 0.025, i * 8); scene.add(lineA);
  const lineB = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.012, 78), floorMarkMat);
  lineB.position.set(i * 8, 0.026, 0); scene.add(lineB);
}

const arena = [], obstacles = [], corpses = [];
const concrete = mat(0x59615c), hazard = mat(0xb69b54);

function addBuilding(x, z, w, h, d, color = 0x424b49) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  body.position.y = h / 2; body.castShadow = true; body.receiveShadow = true; group.add(body);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.12, d + 0.12), mat(0x262f30));
  roof.position.y = h + 0.06; roof.castShadow = true; group.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(Math.min(1.2, w * 0.22), Math.min(2.1, h * 0.65), 0.06), mat(0x202827));

  door.position.set(0, Math.min(2.1, h * 0.65) / 2, d / 2 + 0.04); group.add(door);
  group.position.set(x, 0, z); scene.add(group); return group;
}
for (const [x, z, w, h, d, c] of [[-18, -14, 6, 4.5, 5, 0x4a5850], [16, -18, 5, 3.8, 4.5, 0x3d4a42], [-22, 10, 7, 5.2, 5.5, 0x455248], [20, 12, 5.5, 4.2, 5, 0x3a4640], [0, -22, 8, 3.5, 4, 0x4e5c54], [-12, 20, 5, 4, 5, 0x425048], [14, 22, 6, 4.8, 4.5, 0x3f4c44]]) addBuilding(x, z, w, h, d, c);

const OPS = [
  { id: 'ghost', name: 'GHOST', color: 0x5a7a62, desc: 'сбалансированный', hp: 100, speed: 1, dmg: 1 },
  { id: 'roach', name: 'ROACH', color: 0x8a6a3a, desc: 'тяжёлый · танк', hp: 130, speed: 0.88, dmg: 1.08 },
  { id: 'soap', name: 'SOAP', color: 0x4a7a9a, desc: 'лёгкий · манёвр', hp: 90, speed: 1.15, dmg: 0.95 }
];
const selectedSkin = { ghost: 0, roach: 0, soap: 0 };
let armor = 0, weaponLevel = 1;
const crateMat = mat(0x62513b, 0.9, 0.02);
const metalMat = mat(0x59646a, 0.45, 0.55);
const barrierMat = new THREE.MeshStandardMaterial({ color: 0x8a6a20, roughness: 0.7, metalness: 0.2 });
const lampMat = new THREE.MeshStandardMaterial({ color: 0x333840, roughness: 0.5, metalness: 0.6 });
const lampGlow = new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xffaa44, emissiveIntensity: 1.6, roughness: 0.35 });
function addObstacle(x, z, hw, hd, h, vaultable) {
  obstacles.push({ x, z, hw, hd, h, vaultable: !!vaultable });
}
function placeCrate(x, z, s = 1) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(1.1 * s, 1.1 * s, 1.1 * s), crateMat);
  m.position.set(x, 0.55 * s, z);
  m.rotation.y = Math.random() * 0.4;
  scene.add(m);
  addObstacle(x, z, 0.55 * s + 0.05, 0.55 * s + 0.05, 1.1 * s, true);
}
function placeBarrel(x, z) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.42, 1.15, 10), metalMat);
  m.position.set(x, 0.58, z);
  scene.add(m);
  addObstacle(x, z, 0.45, 0.45, 1.15, true);
}
function placeBarrier(x, z, rot = 0) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 0.55), barrierMat);
  base.position.y = 0.35;
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.2), barrierMat);
  top.position.y = 0.7;
  g.add(base, top);
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  scene.add(g);
  const c = Math.cos(rot), s = Math.sin(rot);
  // approximate axis-aligned bounds after rotation
  const hw = Math.abs(c) * 1.1 + Math.abs(s) * 0.3;
  const hd = Math.abs(s) * 1.1 + Math.abs(c) * 0.3;
  addObstacle(x, z, hw, hd, 0.85, true);
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
  const light = new THREE.PointLight(0xffcc77, 1.05, 14, 1.6);
  light.position.set(x, 2.3, z);
  scene.add(light);
  addObstacle(x, z, 0.2, 0.2, 2.4, false);
}
function placeSandbags(x, z, rot = 0) {
  const g = new THREE.Group();
  const bagMat = new THREE.MeshStandardMaterial({ color: 0x6a5a40, roughness: 1 });
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.45), bagMat);
    b.position.set((i - 1) * 0.5, 0.2, 0);
    g.add(b);
  }
  const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.45), bagMat);
  b2.position.set(0, 0.55, 0);
  g.add(b2);
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  scene.add(g);
  const c = Math.cos(rot), s = Math.sin(rot);
  const hw = Math.abs(c) * 1.0 + Math.abs(s) * 0.4;
  const hd = Math.abs(s) * 1.0 + Math.abs(c) * 0.4;
  addObstacle(x, z, hw, hd, 0.75, true);
}
function resolveCircleObs(x, z, r) {
  let hx = x, hz = z, hit = null;
  for (const o of obstacles) {
    const cx = Math.max(o.x - o.hw, Math.min(x, o.x + o.hw));
    const cz = Math.max(o.z - o.hd, Math.min(z, o.z + o.hd));
    let dx = x - cx, dz = z - cz;
    const d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      const d = Math.sqrt(d2) || 0.0001;
      const pen = r - d;
      hx += (dx / d) * pen;
      hz += (dz / d) * pen;
      hit = o;
    }
  }
  return { x: hx, z: hz, hit };
}
const propRng = (seed) => {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
};
const rnd = propRng(1337);
for (let i = 0; i < 18; i++) {
  const a = rnd() * Math.PI * 2;
  const d = 6 + rnd() * 14;
  const x = Math.cos(a) * d;
  const z = Math.sin(a) * d;
  if (Math.hypot(x, z) < 4) continue;
  const t = rnd();
  if (t < 0.35) placeCrate(x, z, 0.85 + rnd() * 0.4);
  else if (t < 0.55) placeBarrel(x, z);
  else if (t < 0.75) placeBarrier(x, z, rnd() * Math.PI);
  else placeSandbags(x, z, rnd() * Math.PI);
}
[[-16, -16], [16, -16], [-16, 16], [16, 16], [0, -18], [0, 18], [-18, 0], [18, 0]].forEach(([x, z], i) => {
  placeLamp(x * 0.85, z * 0.85);
  if (i < 4) {
    placeCrate(x * 0.7, z * 0.7, 1.1);
    placeBarrel(x * 0.7 + 1.2, z * 0.7);
  }
});
// --- Operator visual kits (3 skins each, CoD-inspired) ---
const SKIN_KITS = {
  ghost: [
    { name: 'Classic', body: 0x2f3f38, accent: 0x6dd6a0, armor: 0x1e2a24, mask: 0xf0f0f0, skin: 0xc8b8a0, boot: 0x1a221c, gun: 0x1a2228, pack: 0x243028, scale: 1, bulk: 1, maskStyle: 'skull' },
    { name: 'Urban', body: 0x3a3a42, accent: 0xa0b0c0, armor: 0x2a2a32, mask: 0xe8e8e8, skin: 0xc8b8a0, boot: 0x1a1a20, gun: 0x222830, pack: 0x303038, scale: 1, bulk: 1, maskStyle: 'skull' },
    { name: 'Night', body: 0x1a2220, accent: 0x40ff90, armor: 0x121816, mask: 0xd0d0d0, skin: 0xb8a890, boot: 0x101410, gun: 0x101418, pack: 0x141c18, scale: 1, bulk: 1, maskStyle: 'skull' },
  ],
  roach: [
    { name: 'Desert', body: 0x5a4a32, accent: 0xd4a84b, armor: 0x3d3424, mask: 0x2a2418, skin: 0xb8a080, boot: 0x2a2418, gun: 0x2a2820, pack: 0x4a3e28, scale: 1.08, bulk: 1.25, maskStyle: 'helmet' },
    { name: 'Woodland', body: 0x3a4a32, accent: 0x8aaa4a, armor: 0x2a3420, mask: 0x1a2214, skin: 0xb0a080, boot: 0x1a2214, gun: 0x222820, pack: 0x2a3820, scale: 1.08, bulk: 1.28, maskStyle: 'helmet' },
    { name: 'Heavy', body: 0x4a4440, accent: 0xff8844, armor: 0x2a2824, mask: 0x1a1814, skin: 0xa09070, boot: 0x181410, gun: 0x1a1814, pack: 0x2a2420, scale: 1.12, bulk: 1.35, maskStyle: 'helmet' },
  ],
  soap: [
    { name: 'SAS', body: 0x2a3a4a, accent: 0x5eb0ff, armor: 0x1a2834, mask: 0x1a2430, skin: 0xd0b898, boot: 0x1a2430, gun: 0x151c24, pack: 0x243040, scale: 0.96, bulk: 0.9, maskStyle: 'beanie' },
    { name: 'Arctic', body: 0x4a5a68, accent: 0xb0d8ff, armor: 0x3a4a58, mask: 0xd8e0e8, skin: 0xd0b898, boot: 0x3a4850, gun: 0x2a343c, pack: 0x405060, scale: 0.96, bulk: 0.92, maskStyle: 'beanie' },
    { name: 'Stealth', body: 0x1a2430, accent: 0x40c8ff, armor: 0x101820, mask: 0x0a1018, skin: 0xc0a888, boot: 0x0c1218, gun: 0x0a1014, pack: 0x121a24, scale: 0.94, bulk: 0.88, maskStyle: 'beanie' },
  ],
};
const playerRoot = new THREE.Group();
const playerTorso = new THREE.Group();
const legL = new THREE.Group();
const legR = new THREE.Group();
const armL = new THREE.Group();
const armR = new THREE.Group();
playerRoot.add(playerTorso, legL, legR);
scene.add(playerRoot);
const ringGeo = new THREE.RingGeometry(0.65, 0.8, 32);
const ringMat = new THREE.MeshBasicMaterial({ color: 0x6dd6a0, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
const playerRing = new THREE.Mesh(ringGeo, ringMat);
playerRing.rotation.x = -Math.PI / 2;
playerRing.position.y = 0.04;
playerRoot.add(playerRing);
let matBody = null, matArmor = null, matAccent = null;
const parts = { body: null, head: null, mask: null, pack: null, legL: null, legR: null, armL: null, armR: null, rifle: null, vest: null, shoulderL: null, shoulderR: null };

function clearGroup(g) {
  while (g.children.length) {
    const c = g.children[0];
    g.remove(c);
    if (c.geometry) c.geometry.dispose();
  }
}
function currentKit() {
  const id = selectedOp.id;
  const idx = selectedSkin[id] || 0;
  return SKIN_KITS[id][idx] || SKIN_KITS.ghost[0];
}
function buildPlayerVisual(opId, skinIdx) {
  if (opId == null) opId = selectedOp.id;
  if (skinIdx == null) skinIdx = selectedSkin[opId] || 0;
  const s = (SKIN_KITS[opId] && SKIN_KITS[opId][skinIdx]) || SKIN_KITS.ghost[0];
  const B = s.bulk, S = s.scale;
  clearGroup(playerTorso);
  clearGroup(legL);
  clearGroup(legR);
  clearGroup(armL);
  clearGroup(armR);

  matBody = new THREE.MeshStandardMaterial({ color: s.body, roughness: 0.55, metalness: 0.2, emissive: s.accent, emissiveIntensity: 0.12 });
  matArmor = new THREE.MeshStandardMaterial({ color: s.armor, roughness: 0.45, metalness: 0.45 });
  matAccent = new THREE.MeshStandardMaterial({ color: s.accent, roughness: 0.4, metalness: 0.35, emissive: s.accent, emissiveIntensity: 0.35 });
  const matSkin = new THREE.MeshStandardMaterial({ color: s.skin, roughness: 0.75 });
  const matBoot = new THREE.MeshStandardMaterial({ color: s.boot, roughness: 0.85 });
  const matGun = new THREE.MeshStandardMaterial({ color: s.gun, roughness: 0.35, metalness: 0.7 });
  const matMask = new THREE.MeshStandardMaterial({ color: s.mask, roughness: 0.55, metalness: s.maskStyle === 'skull' ? 0.15 : 0.3 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.30 * B, 0.52 * S, 5, 10), matBody);
  body.position.y = 0.95 * S;
  playerTorso.add(body);
  parts.body = body;

  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.52 * B, 0.42 * S, 0.28 * B), matArmor);
  vest.position.set(0, 1.02 * S, 0.02);
  playerTorso.add(vest);
  parts.vest = vest;

  // pouches
  for (const px of [-0.14, 0.14]) {
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.08), matBoot);
    pouch.position.set(px * B, 0.92 * S, 0.18);
    playerTorso.add(pouch);
  }
  // radio
  const radio = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.16, 0.08), matAccent);
  radio.position.set(-0.22 * B, 1.15 * S, -0.12);
  playerTorso.add(radio);

  const shL = new THREE.Mesh(new THREE.BoxGeometry(0.16 * B, 0.12, 0.2 * B), matArmor);
  const shR = new THREE.Mesh(new THREE.BoxGeometry(0.16 * B, 0.12, 0.2 * B), matArmor);
  shL.position.set(-0.34 * B, 1.22 * S, 0);
  shR.position.set(0.34 * B, 1.22 * S, 0);
  playerTorso.add(shL, shR);
  parts.shoulderL = shL; parts.shoulderR = shR;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19 * Math.sqrt(B), 10, 10), matSkin);
  head.position.y = 1.48 * S;
  playerTorso.add(head);
  parts.head = head;

  if (s.maskStyle === 'skull') {
    const mask = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.18), matMask);
    mask.position.set(0, 1.48 * S, 0.08);
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.04), new THREE.MeshBasicMaterial({ color: 0x111111 }));
    const eyeR = eyeL.clone();
    eyeL.position.set(-0.07, 1.5 * S, 0.17);
    eyeR.position.set(0.07, 1.5 * S, 0.17);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.02), new THREE.MeshBasicMaterial({ color: 0x222222 }));
    stripe.position.set(0, 1.42 * S, 0.17);
    // headset
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 12, Math.PI), matGun);
    band.rotation.x = Math.PI / 2; band.position.y = 1.58 * S;
    playerTorso.add(mask, eyeL, eyeR, stripe, band);
    parts.mask = mask;
  } else if (s.maskStyle === 'helmet') {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.22 * Math.sqrt(B), 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), matMask);
    helm.position.y = 1.52 * S;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.12), matAccent);
    visor.position.set(0, 1.5 * S, 0.14);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.16), matArmor);
    jaw.position.set(0, 1.38 * S, 0.06);
    const nvg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.14), matGun);
    nvg.position.set(0, 1.62 * S, 0.12);
    playerTorso.add(helm, visor, jaw, nvg);
    parts.mask = helm;
  } else {
    const beanie = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), matMask);
    beanie.position.y = 1.55 * S;
    const mic = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.18), matGun);
    mic.position.set(0.16, 1.42 * S, 0.1);
    const goggles = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.1), matAccent);
    goggles.position.set(0, 1.5 * S, 0.14);
    playerTorso.add(beanie, mic, goggles);
    parts.mask = beanie;
  }

  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.34 * B, 0.4 * S, 0.18), new THREE.MeshStandardMaterial({ color: s.pack, roughness: 0.8 }));
  pack.position.set(0, 1.0 * S, -0.28 * B);
  playerTorso.add(pack);
  parts.pack = pack;
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.3), matAccent);
  strip.position.set(0, 1.1 * S, 0.14);
  playerTorso.add(strip);

  const legGeo = new THREE.CapsuleGeometry(0.1 * B, 0.34 * S, 4, 6);
  const lmL = new THREE.Mesh(legGeo, matBoot);
  const lmR = new THREE.Mesh(legGeo, matBoot);
  lmL.position.y = -0.24 * S; lmR.position.y = -0.24 * S;
  legL.add(lmL); legR.add(lmR);
  const padL = new THREE.Mesh(new THREE.BoxGeometry(0.14 * B, 0.16, 0.12), matArmor);
  const padR = padL.clone();
  padL.position.set(0, -0.05, 0.04); padR.position.set(0, -0.05, 0.04);
  legL.add(padL); legR.add(padR);
  legL.position.set(-0.14 * B, 0.55 * S, 0);
  legR.position.set(0.14 * B, 0.55 * S, 0);
  parts.legL = lmL; parts.legR = lmR;

  const armGeo = new THREE.CapsuleGeometry(0.08 * B, 0.28 * S, 4, 6);
  const amL = new THREE.Mesh(armGeo, matBody);
  const amR = new THREE.Mesh(armGeo, matBody);
  amL.position.y = -0.2 * S; amR.position.y = -0.2 * S;
  armL.add(amL); armR.add(amR);
  const glL = new THREE.Mesh(new THREE.BoxGeometry(0.1 * B, 0.1, 0.1), matBoot);
  const glR = glL.clone();
  glL.position.y = -0.38 * S; glR.position.y = -0.38 * S;
  armL.add(glL); armR.add(glR);
  armL.position.set(-0.4 * B, 1.18 * S, 0.05);
  armR.position.set(0.4 * B, 1.18 * S, 0.05);
  parts.armL = amL; parts.armR = amR;

  let rifle;
  if (opId === 'roach') {
    rifle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.9), matGun);
    rifle.position.set(0.12, -0.18, 0.4);
    const mag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.12), matArmor);
    mag.position.set(0.12, -0.32, 0.15);
    armR.add(rifle, mag);
  } else if (opId === 'soap') {
    rifle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.1, 0.55), matGun);
    rifle.position.set(0.12, -0.12, 0.28);
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.2), matArmor);
    stock.position.set(0.12, -0.1, -0.05);
    armR.add(rifle, stock);
  } else {
    rifle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.78), matGun);
    rifle.position.set(0.14, -0.14, 0.36);
    const scope = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.14), matAccent);
    scope.position.set(0.14, -0.04, 0.3);
    armR.add(rifle, scope);
  }
  parts.rifle = rifle;
  playerTorso.add(armL, armR);
  playerRoot.scale.setScalar(S);
  ringMat.color.setHex(s.accent);
}
buildPlayerVisual('ghost', 0);


const geoZBody = new THREE.CapsuleGeometry(0.3, 0.5, 4, 8);
const geoZHead = new THREE.SphereGeometry(0.2, 8, 8);
const geoZArm = new THREE.CapsuleGeometry(0.07, 0.32, 3, 6);
const geoZLeg = new THREE.CapsuleGeometry(0.09, 0.3, 3, 6);
const eyeGeo = new THREE.SphereGeometry(0.045, 6, 6);
const zMats = {
  grunt: new THREE.MeshStandardMaterial({ color: 0x5a6a52, roughness: 0.85 }),
  rusher: new THREE.MeshStandardMaterial({ color: 0x7a6a40, roughness: 0.8 }),
  heavy: new THREE.MeshStandardMaterial({ color: 0x4a5058, roughness: 0.7, metalness: 0.2 }),
  elite: new THREE.MeshStandardMaterial({ color: 0x5a3030, roughness: 0.65, emissive: 0x200808, emissiveIntensity: 0.25 }),
};
const zSkin = new THREE.MeshStandardMaterial({ color: 0x8a9a7a, roughness: 0.9 });
const zEyeMat = new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 2.5, roughness: 0.3 });
function createZombieMesh(type) {
  const root = new THREE.Group();
  const torso = new THREE.Group();
  const mat = zMats[type] || zMats.grunt;
 const body = new THREE.Mesh(geoZBody, mat);
  body.position.y = 0.85;
  const head = new THREE.Mesh(geoZHead, zSkin);
  head.position.y = 1.35;
  torso.rotation.x = 0.25;
  const eyeL = new THREE.Mesh(eyeGeo, zEyeMat.clone());
  const eyeR = new THREE.Mesh(eyeGeo, zEyeMat.clone());
  eyeL.position.set(-0.08, 1.38, 0.16);
  eyeR.position.set(0.08, 1.38, 0.16);
  // jaw / torn cloth
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.1), zSkin);
  jaw.position.set(0, 1.28, 0.12);
  const rag = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.08), mat);
  rag.position.set(0, 0.95, -0.2);
  torso.add(body, head, eyeL, eyeR, jaw, rag);
  if (type === 'heavy' || type === 'elite') {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.3, 0.2), new THREE.MeshStandardMaterial({ color: 0x333840, metalness: 0.5, roughness: 0.5 }));
    plate.position.set(0, 0.95, 0.05);
    torso.add(plate);
  }
  const aL = new THREE.Group();
  const aR = new THREE.Group();
  const amL = new THREE.Mesh(geoZArm, zSkin);
  const amR = new THREE.Mesh(geoZArm, zSkin);
  amL.position.y = -0.22; amR.position.y = -0.22;
  aL.add(amL); aR.add(amR);
  aL.position.set(-0.35, 1.05, 0.1);
  aR.position.set(0.35, 1.05, 0.1);
  aL.rotation.x = -1.1; aR.rotation.x = -1.0;
  torso.add(aL, aR);
  const lL = new THREE.Group();
  const lR = new THREE.Group();
  const lmL = new THREE.Mesh(geoZLeg, mat);
  const lmR = new THREE.Mesh(geoZLeg, mat);
  lmL.position.y = -0.22; lmR.position.y = -0.22;
  lL.add(lmL); lR.add(lmR);
  lL.position.set(-0.12, 0.48, 0);
  lR.position.set(0.12, 0.48, 0);
  root.add(torso, lL, lR);
  root.userData = { torso, aL, aR, lL, lR, eyeL, eyeR, phase: Math.random() * Math.PI * 2 };
  return root;
}
const matBullet = new THREE.MeshStandardMaterial({ color: 0xc8f5dd, emissive: 0x6dd6a0, emissiveIntensity: 1.2 });
const matBulletCrit = new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffaa33, emissiveIntensity: 1.4 });
const matXp = new THREE.MeshStandardMaterial({ color: 0x5ec8ff, emissive: 0x2a80ff, emissiveIntensity: 1.1 });
const geoBullet = new THREE.SphereGeometry(0.12, 6, 6);
const geoXp = new THREE.OctahedronGeometry(0.22, 0);
const bulletPool = [], enemyPool = [], xpPool = [];
const activeBullets = [], activeEnemies = [], activeXp = [];
function acquireBullet(crit) {
  let b = bulletPool.pop();
  if (!b) {
    b = { mesh: new THREE.Mesh(geoBullet, matBullet), vx: 0, vz: 0, life: 0, dmg: 0 };
    scene.add(b.mesh);
  }
  b.mesh.material = crit ? matBulletCrit : matBullet;
  b.mesh.visible = true;
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
    const mesh = createZombieMesh(type);
    e = { mesh, type: 'grunt', hp: 1, maxHp: 1, speed: 1, r: 0.45, dmg: 8, xp: 1, hitT: 0 };
    scene.add(mesh);
  }
  e.mesh.visible = true;
  e.type = type;
  e.mesh.userData.phase = Math.random() * Math.PI * 2;
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
  x: 0, z: 0, angle: 0, faceAngle: 0,
  r: 0.45, hp: 100, maxHp: 100,
  level: 1, xp: 0, xpNeed: 8,
  speedMul: 1, dmgMul: 1, fireRate: 0.22, range: 12,
  projectiles: 1, regen: 0, magnet: 4.5, crit: 0.05,
  dashCd: 0, dashCdMax: 1.6, dashT: 0, dashDirX: 1, dashDirZ: 0,
  fireCd: 0, hurtT: 0, moveAmt: 0, shootKick: 0,
  vaultT: 0, vaultX: 0, vaultZ: 0, y: 0,
};
const keys = new Set();
const joy = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
const camTarget = new THREE.Vector3();
const opsEl = $('ops');
function refreshSkinButtons() {
  const box = $('skinPick');
  if (!box) return;
  box.innerHTML = '';
  const kits = SKIN_KITS[selectedOp.id] || [];
  kits.forEach((kit, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'skin-btn' + (selectedSkin[selectedOp.id] === i ? ' selected' : '');
    b.textContent = kit.name;
    b.onclick = () => {
      selectedSkin[selectedOp.id] = i;
      buildPlayerVisual(selectedOp.id, i);
      refreshSkinButtons();
      const info = $('menuOpInfo');
      if (info) info.textContent = selectedOp.name + ' · ' + kit.name + ' · HP ' + selectedOp.hp;
    };
    box.appendChild(b);
  });
}
opsEl.innerHTML = '';
OPS.forEach((op, i) => {
  const d = document.createElement('div');
  d.className = 'op' + (i === 0 ? ' selected' : '');
  const hpPct = Math.round((op.hp / 130) * 100);
  const spdPct = Math.round((op.speed / 1.15) * 100);
  const dmgPct = Math.round((op.dmg / 1.05) * 100);
  d.innerHTML = `<strong>${op.name}</strong>
    <span class="op-desc">${op.desc}</span>
    <div class="stat"><i>HP</i><b style="width:${hpPct}%"></b><em>${op.hp}</em></div>
    <div class="stat"><i>SPD</i><b style="width:${spdPct}%"></b><em>${op.speed.toFixed(2)}</em></div>
    <div class="stat"><i>DMG</i><b style="width:${dmgPct}%"></b><em>${op.dmg.toFixed(2)}</em></div>`;
  d.onclick = () => {
    selectedOp = op;
    opsEl.querySelectorAll('.op').forEach((e) => e.classList.remove('selected'));
    d.classList.add('selected');
    buildPlayerVisual(op.id, selectedSkin[op.id] || 0);
    refreshSkinButtons();
    const kit = currentKit();
    const info = $('menuOpInfo');
    if (info) info.textContent = op.name + ' · ' + kit.name + ' · HP ' + op.hp;
  };
  opsEl.appendChild(d);
});
refreshSkinButtons();
{
  const kit = currentKit();
  const info = $('menuOpInfo');
  if (info) info.textContent = selectedOp.name + ' · ' + kit.name + ' · HP ' + selectedOp.hp;
}
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
    x: 0, z: 0, angle: 0, faceAngle: 0,
    hp: selectedOp.hp, maxHp: selectedOp.hp,
    level: 1, xp: 0, xpNeed: 8,
    speedMul: selectedOp.speed, dmgMul: selectedOp.dmg,
    fireRate: 0.22, range: 12, projectiles: 1, regen: 0,
    magnet: 4.5, crit: 0.05, dashCd: 0, dashCdMax: 1.6, dashT: 0,
    fireCd: 0, hurtT: 0, moveAmt: 0, shootKick: 0,
    vaultT: 0, vaultX: 0, vaultZ: 0, y: 0,
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
$('btnMenu').onclick = () => goMainMenu();
$('btnResume')?.addEventListener('click', () => resumeGame());
$('btnRestart')?.addEventListener('click', () => startGame());
$('btnPauseMenu')?.addEventListener('click', () => goMainMenu());
function updatePauseStats() {
  const el = $('pauseStats');
  if (!el) return;
  const m = (time / 60) | 0, s = (time % 60) | 0;
  el.innerHTML = `Оператор: <b>${selectedOp.name}</b><br>
    Время ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} · Убийства ${kills} · Уровень ${player.level}<br>
    HP ${Math.max(0, player.hp|0)}/${player.maxHp} · DIFF ${difficulty().toFixed(1)}x`;
}
function setPauseUI(on) {
  paused = on;
  const p = $('pause');
  if (p) p.classList.toggle('hidden', !on);
  $('btnPause').textContent = on ? '▶' : 'Ⅱ';
  if (on) {
    updatePauseStats();
    joyHide();
  }
}
function togglePause() {
  if (gameOver || !running) return;
  setPauseUI(!paused);
}
function resumeGame() {
  if (!running || gameOver) return;
  setPauseUI(false);
  last = performance.now();
}
function goMainMenu() {
  running = false;
  paused = false;
  gameOver = false;
  menuPreview = true;
  cancelAnimationFrame(raf);
  clearWorld();
  $('pause')?.classList.add('hidden');
  $('over').classList.add('hidden');
  $('levelup').classList.add('hidden');
  $('hud').classList.add('hidden');
  $('menu').classList.remove('hidden');
  $('btnPause').textContent = 'Ⅱ';
  player.x = 0; player.z = 0; player.y = 0;
  playerRoot.position.set(0, 0, 0);
  buildPlayerVisual(selectedOp.id, selectedSkin[selectedOp.id] || 0);
  raf = requestAnimationFrame(frame);
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
  if (len < 0.1) { dx = Math.sin(player.faceAngle); dz = Math.cos(player.faceAngle); }
  else { dx /= len; dz /= len; }
  player.dashDirX = dx; player.dashDirZ = dz;
  player.dashT = 0.18; player.dashCd = player.dashCdMax;
}
function startGame() {
  buildPlayerVisual(selectedOp.id, selectedSkin[selectedOp.id] || 0);
  menuPreview = false;
  resetRun();
  running = true;
  paused = false;
  $('menu').classList.add('hidden');
  $('over').classList.add('hidden');
  $('levelup').classList.add('hidden');
  $('pause')?.classList.add('hidden');
  $('hud').classList.remove('hidden');
  $('btnPause').textContent = 'Ⅱ';
  showMsg(selectedOp.name + ' · ВХОД В ЗОНУ', 1200);
  last = performance.now();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(frame);
}
function clampPlayer() {
  const lim = HALF - player.r - 0.5;
  player.x = Math.max(-lim, Math.min(lim, player.x));
  player.z = Math.max(-lim, Math.min(lim, player.z));
}
function tryVault(nx, nz, mx, mz) {
  if (player.vaultT > 0 || player.dashT > 0) return false;
  const probe = resolveCircleObs(nx, nz, player.r + 0.08);
  if (!probe.hit || !probe.hit.vaultable) return false;
  if (player.moveAmt < 0.35 && player.dashT <= 0) return false;
  // only vault low-ish obstacles
  if (probe.hit.h > 1.35) return false;
  player.vaultT = 0.42;
  const len = Math.hypot(mx, mz) || 1;
  player.vaultX = (mx / len);
  player.vaultZ = (mz / len);
  // land past obstacle
  const land = 0.9 + probe.hit.hw;
  player.x = probe.hit.x + player.vaultX * land;
  player.z = probe.hit.z + player.vaultZ * land;
  return true;
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
  player.shootKick = 1;
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
    b.mesh.position.set(player.x + sx * 0.7, 1.05, player.z + sz * 0.7);
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
  const lim = HALF - 1.2;
  x = Math.max(-lim, Math.min(lim, x));
  z = Math.max(-lim, Math.min(lim, z));
  const roll = Math.random();
  let type = 'grunt';
  if (diff > 1.8 && roll < 0.12) type = 'heavy';
  else if (roll < 0.22) type = 'rusher';
  else if (diff > 2.5 && roll < 0.28) type = 'elite';
  const base = {
    grunt: { hp: 28, speed: 3.0, r: 0.42, dmg: 8, xp: 1 },
    rusher: { hp: 18, speed: 5.2, r: 0.38, dmg: 10, xp: 1 },
    heavy: { hp: 90, speed: 1.9, r: 0.55, dmg: 16, xp: 3 },
    elite: { hp: 140, speed: 2.5, r: 0.5, dmg: 18, xp: 5 },
  }[type];
  const e = acquireEnemy(type);
  e.hp = base.hp * (0.85 + diff * 0.25);
  e.maxHp = e.hp;
  e.speed = base.speed * (0.95 + diff * 0.04);
  e.r = base.r; e.dmg = base.dmg; e.xp = base.xp; e.hitT = 0;
  e.mesh.position.set(x, 0, z);
  e.mesh.scale.setScalar(type === 'heavy' ? 1.35 : type === 'elite' ? 1.2 : type === 'rusher' ? 0.9 : 1);
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
function lerpAngle(a, b, t) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}
function animatePlayer(dt) {
  if (player.vaultT > 0) {
    const t = 1 - player.vaultT / 0.42;
    // roll / vault
    playerTorso.rotation.x = -t * Math.PI * 1.6;
    playerTorso.rotation.z = Math.sin(t * Math.PI) * 0.3;
    legL.rotation.x = -0.8; legR.rotation.x = 0.6;
    armL.rotation.x = -1.2; armR.rotation.x = -0.8;
    playerRoot.rotation.y = player.faceAngle;
    playerRing.material.opacity = 0.15;
    return;
  }
  const moving = player.moveAmt > 0.08;
  const sprint = Math.min(1, player.moveAmt);
  // Monster Survivors-like: faster cycle, stronger bob, lean
  const cadence = moving ? (9 + sprint * 4) : 2.2;
  const walk = time * cadence;
  const legAmp = moving ? 0.7 * sprint : 0.05;
  const armAmp = moving ? 0.55 * sprint : 0.06;
  legL.rotation.x = Math.sin(walk) * legAmp;
  legR.rotation.x = Math.sin(walk + Math.PI) * legAmp;
  legL.rotation.z = moving ? Math.sin(walk) * 0.06 : 0;
  legR.rotation.z = moving ? -Math.sin(walk) * 0.06 : 0;
  // free arm swing, gun arm steadier with micro sway
  armL.rotation.x = Math.sin(walk + Math.PI) * armAmp - 0.35;
  armL.rotation.z = 0.15 + (moving ? Math.sin(walk * 0.5) * 0.08 : 0);
  const aimPitch = -0.62 - player.shootKick * 0.35;
  armR.rotation.x = aimPitch + (moving ? Math.sin(walk) * 0.1 * sprint : 0);
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
      } else {
        e.mesh.position.x = r.x;
        e.mesh.position.z = r.z;
        e.mesh.position.y = 0;
      }
    }
    e.mesh.rotation.y = Math.atan2(dx, dz);
    animateZombie(e, dt);
    if (d < e.r + player.r && player.dashT <= 0 && player.vaultT <= 0) {
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
        e.hp -= b.dmg; e.hitT = 0.12; hit = true;
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
  camera.lookAt(camTarget.x, 0.6, camTarget.z);
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
  else if (menuPreview) {
    // character showcase in main menu
    playerRoot.position.set(3.2, 0, 0);
    playerRoot.rotation.y = now * 0.0012;
    player.moveAmt = 0.35;
    player.y = 0;
    animatePlayer(0.016);
    const ang = now * 0.0004;
    camera.position.set(3.2 + Math.sin(ang) * 4.2, 2.4, Math.cos(ang) * 4.2);
    camera.lookAt(3.2, 1.1, 0);
  } else if (!gameOver) {
    camera.position.x = Math.sin(now * 0.00025) * 10;
    camera.position.z = 16 + Math.cos(now * 0.00025) * 5;
    camera.position.y = 14;
    camera.lookAt(0, 0.5, 0);
  }
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
raf = requestAnimationFrame(frame);
