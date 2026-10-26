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
  door.position.set(0, Math.min(2.1, h * 0.65) / 2, d / 2 + 0.035); group.add(door);
  group.position.set(x, 0, z); scene.add(group);
  obstacles.push({ x, z, hw: w / 2, hz: d / 2, h, mesh: body });
}
addBuilding(-25, -24, 12, 5, 9, 0x414b49);
addBuilding(24, -25, 10, 4, 12, 0x4c5149);
addBuilding(-27, 22, 9, 3.4, 11, 0x3c4846);
addBuilding(25, 23, 13, 5.4, 8, 0x454b46);

for (let i = 0; i < 12; i++) {
  const x = (Math.random() - 0.5) * 58, z = (Math.random() - 0.5) * 58;
  if (Math.hypot(x, z) < 10) continue;
  const w = 2.4 + Math.random() * 3.5, d = 1.2 + Math.random() * 2.2, h = 0.65 + Math.random() * 1.1;
  const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(i % 3 ? 0x505953 : 0x5c5140));
  block.position.set(x, h / 2, z); block.castShadow = true; block.receiveShadow = true; scene.add(block);
  obstacles.push({ x, z, hw: w / 2, hz: d / 2, h, mesh: block });
}
for (let i = 0; i < 8; i++) {
  const x = -32 + i * 9, z = i % 2 ? -8 : 8;
  const barrier = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.65), concrete);
  barrier.position.set(x, 0.45, z); barrier.castShadow = true; scene.add(barrier);
  obstacles.push({ x, z, hw: 1.6, hz: 0.325, h: 0.9, mesh: barrier });
}
for (let i = 0; i < 10; i++) {
  const x = -34 + Math.random() * 68, z = -34 + Math.random() * 68;
  if (Math.hypot(x, z) < 9) continue;
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.7, 7), mat(0x4d5751));
  mesh.position.set(x, 0.35, z); mesh.castShadow = true; scene.add(mesh);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0xe3b56c }));
  lamp.position.set(x, 0.76, z); scene.add(lamp);
}
for (let i = 0; i < 6; i++) {
  const x = -28 + i * 11, z = i % 2 === 0 ? -15 : 15;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.018, 0.14), hazard);
  stripe.position.set(x, 0.04, z); scene.add(stripe);
}
for (let i = 0; i < 42; i++) {
  const x = (Math.random() - 0.5) * 64, z = (Math.random() - 0.5) * 64;
  if (Math.hypot(x, z) < 7) continue;
  const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2 + Math.random() * 1.5, 0.8 + Math.random() * 1.1, 1.2 + Math.random() * 1.4), mat(i % 3 ? 0x5a6558 : 0x7a6a48));
  crate.position.set(x, crate.geometry.parameters.height / 2, z); crate.castShadow = true; crate.receiveShadow = true; scene.add(crate);
  arena.push(crate);
  obstacles.push({ x, z, hw: crate.geometry.parameters.width / 2, hz: crate.geometry.parameters.depth / 2, h: crate.geometry.parameters.height, mesh: crate });
}

const OPS = [
  { id: 'ghost', name: 'GHOST', color: 0x5a7a62, desc: 'Сбалансированный боец' },
  { id: 'viper', name: 'VIPER', color: 0x8a9a55, desc: 'Быстрый штурмовик' },
  { id: 'raven', name: 'RAVEN', color: 0x4a5a6a, desc: 'Тактическая броня' }
];
let selectedOp = 0, running = false, paused = false, dead = false, last = 0, elapsed = 0;
let fireClock = 0, spawnClock = 0, wave = 1, waveKills = 0, kills = 0, level = 1, xp = 0, xpNeed = 5;
let armor = 0, weaponLevel = 1, chestClock = 0, messageClock = 0;
const keys = {}, zombies = [], bullets = [], drops = [];

const player = {
  x: 0, z: 0, hp: 100, maxHp: 100, speed: 7.2, r: 0.42,
  dash: 0, dashCd: 0, invuln: 0, moveX: 0, moveZ: 0,
  mesh: null, aim: 0,
  vaultT: 0, vaultDur: 0.55, vaultY: 0, vaultX: 0, vaultZ: 0,
  vaultStartX: 0, vaultStartZ: 0, vaultEndX: 0, vaultEndZ: 0, vaultHeight: 0, vaultArc: 0,
  rollT: 0, rollDur: 0.52, rollX: 0, rollZ: 0, rollSide: 1,
  faceAngle: 0, moveBlend: 0,
  animState: 'idle', animTime: 0, reloadT: 0, hitT: 0
};

function makeLimb(w, h, d, color, rough = 0.85, metal = 0.02, edged = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, rough, metal));
  m.castShadow = true; m.receiveShadow = true;
  if (edged) addEdge(m);
  return m;
}

function makeOperator(color) {
  const root = new THREE.Group();
  const isGhost = color === 0x5a7a62 || color === OPS[0].color;
  const skin = 0xe0b892, pants = 0x3a4550, boot = 0x1e242a, vest = color;

  const pelvis = new THREE.Group(); pelvis.position.y = 0.82; root.add(pelvis);
  const hips = makeLimb(0.44, 0.20, 0.28, 0x2a3238); pelvis.add(hips);

  const torso = new THREE.Group(); torso.position.y = 0.10; pelvis.add(torso);
  const chest = makeLimb(0.50, 0.54, 0.30, vest, 0.72); chest.position.y = 0.28; torso.add(chest);
  const plate = makeLimb(0.42, 0.34, 0.07, 0x1a2220, 0.5, 0.15); plate.position.set(0, 0.26, 0.17); torso.add(plate);
  const neck = makeLimb(0.11, 0.09, 0.11, skin, 0.9, 0.02, false); neck.position.y = 0.58; torso.add(neck);

  const head = new THREE.Group(); head.position.y = 0.70; torso.add(head);
  if (isGhost) {
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.155, 14, 12), mat(0xf0ebe3, 0.55, 0.05));
    skull.castShadow = true; head.add(skull); addEdge(skull, 0x111418, 1.04);
    const cowl = new THREE.Mesh(
      new THREE.SphereGeometry(0.168, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.72),
      mat(0x12161a, 0.85, 0.05)
    );
    cowl.position.y = 0.01; cowl.rotation.x = 0.08; head.add(cowl);
    const socketMat = mat(0x0a0c0e, 0.4, 0.1);
    const ls = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), socketMat);
    ls.position.set(-0.055, 0.02, 0.13); head.add(ls);
    const rs = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), socketMat);
    rs.position.set(0.055, 0.02, 0.13); head.add(rs);
    const nose = makeLimb(0.03, 0.06, 0.04, 0x0a0c0e, 0.5, 0.05, false);
    nose.position.set(0, -0.02, 0.145); head.add(nose);
    const teeth = makeLimb(0.09, 0.03, 0.03, 0xe8e4dc, 0.4, 0.05, false);
    teeth.position.set(0, -0.07, 0.135); head.add(teeth);
    const ear = makeLimb(0.04, 0.08, 0.06, 0x1a2024, 0.5, 0.2, false);
    ear.position.set(0.16, 0.0, 0.02); head.add(ear);
  } else {
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.155, 12, 10), mat(skin, 0.9));
    skull.castShadow = true; head.add(skull); addEdge(skull, 0x111418, 1.04);
    const helm = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
      mat(0x1a2220, 0.6, 0.15)
    );
    helm.position.y = 0.02; head.add(helm);
    const visor = makeLimb(0.20, 0.05, 0.07, 0x111816, 0.3); visor.position.set(0, 0.02, 0.13); head.add(visor);
  }

  const legs = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(side * 0.13, -0.04, 0.02); pelvis.add(hip);
    const thigh = makeLimb(0.15, 0.34, 0.17, pants); thigh.position.y = -0.17; hip.add(thigh);
    const knee = new THREE.Group(); knee.position.y = -0.34; hip.add(knee);
    const shin = makeLimb(0.13, 0.32, 0.15, pants); shin.position.y = -0.16; knee.add(shin);
    const foot = makeLimb(0.13, 0.07, 0.24, boot); foot.position.set(0, -0.34, 0.04); knee.add(foot);
    legs.push({ hip, knee, thigh, shin });
  }

  const arms = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.30, 0.48, 0.02);
    torso.add(shoulder);
    const upper = makeLimb(0.12, 0.28, 0.13, vest); upper.position.y = -0.13; shoulder.add(upper);
    const elbow = new THREE.Group(); elbow.position.y = -0.28; shoulder.add(elbow);
    const forearm = makeLimb(0.11, 0.26, 0.11, vest); forearm.position.y = -0.12; elbow.add(forearm);
    const wrist = new THREE.Group(); wrist.position.y = -0.26; elbow.add(wrist);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mat(skin));
    hand.castShadow = true; wrist.add(hand);
    arms.push({ shoulder, elbow, wrist, upper, forearm, hand, side });
  }

  const rifleGroup = new THREE.Group();
  rifleGroup.position.set(0.14, 0.30, 0.22);
  rifleGroup.rotation.x = -0.18;
  rifleGroup.rotation.y = 0.08;
  rifleGroup.rotation.z = 0.04;
  torso.add(rifleGroup);

  const receiver = makeLimb(0.07, 0.09, 0.38, 0x14181a, 0.4, 0.55);
  receiver.position.set(0, 0, 0.04); rifleGroup.add(receiver);
  const stock = makeLimb(0.06, 0.10, 0.20, 0x2a302e, 0.7);
  stock.position.set(0, 0.01, -0.24); rifleGroup.add(stock);
  const grip = makeLimb(0.055, 0.12, 0.06, 0x1c201e, 0.65);
  grip.position.set(0, -0.08, -0.02); rifleGroup.add(grip);
  const mag = makeLimb(0.05, 0.14, 0.06, 0x1a1e1c, 0.5);
  mag.position.set(0, -0.12, 0.06); rifleGroup.add(mag);
  const handguard = makeLimb(0.065, 0.07, 0.26, 0x1e2422, 0.55);
  handguard.position.z = 0.28; rifleGroup.add(handguard);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.32, 8), mat(0x0a0c0e, 0.35, 0.7));
  barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.52; barrel.castShadow = true; rifleGroup.add(barrel);
  const muzzleBrake = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.024, 0.05, 8), mat(0x0c0e10, 0.3, 0.65));
  muzzleBrake.rotation.x = Math.PI / 2; muzzleBrake.position.z = 0.70; rifleGroup.add(muzzleBrake);
  const optic = makeLimb(0.04, 0.05, 0.12, 0x0e1210, 0.35);
  optic.position.set(0, 0.07, 0.08); rifleGroup.add(optic);

  const muzzle = new THREE.Object3D(); muzzle.position.set(0, 0, 0.74); rifleGroup.add(muzzle);
  const rightGrip = new THREE.Object3D(); rightGrip.position.set(0.02, -0.06, -0.01); rifleGroup.add(rightGrip);
  const leftGrip = new THREE.Object3D(); leftGrip.position.set(-0.02, -0.01, 0.30); rifleGroup.add(leftGrip);

  root.userData = {
    isZombie: false, isGhost, pelvis, torso, head, chest, legs, arms,
    rifleGroup, muzzle, rightGrip, leftGrip,
    fireKick: 0, hitFlash: 0, attackT: 0,
    phase: Math.random() * Math.PI * 2, animState: 'idle', animTime: 0
  };
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return root;
}

function makeZombie(color) {
  const root = new THREE.Group();
  const skin = 0x83947b, cloth = color || 0x52634c;
  const pelvis = new THREE.Group(); pelvis.position.y = 0.88; root.add(pelvis);
  pelvis.add(makeLimb(0.40, 0.20, 0.24, 0x394238));
  const torso = new THREE.Group(); torso.position.y = 0.10; pelvis.add(torso);
  const chest = makeLimb(0.48, 0.52, 0.28, cloth, 0.9); chest.position.y = 0.26; torso.add(chest);
  const head = new THREE.Group(); head.position.y = 0.68; torso.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), mat(skin, 0.95)); skull.castShadow = true; head.add(skull);
  const jaw = makeLimb(0.14, 0.06, 0.10, 0x6a7a62); jaw.position.set(0.02, -0.10, 0.08); head.add(jaw);
  const legs = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(side * 0.13, -0.04, 0); pelvis.add(hip);
    const thigh = makeLimb(0.15, 0.36, 0.16, 0x465044); thigh.position.y = -0.18; hip.add(thigh);
    const knee = new THREE.Group(); knee.position.y = -0.36; hip.add(knee);
    const shin = makeLimb(0.13, 0.34, 0.14, 0x465044); shin.position.y = -0.17; knee.add(shin);
    legs.push({ hip, knee });
  }
  const arms = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group(); shoulder.position.set(side * 0.30, 0.46, 0); torso.add(shoulder);
    const upper = makeLimb(0.12, 0.28, 0.12, cloth); upper.position.y = -0.13; shoulder.add(upper);
    const elbow = new THREE.Group(); elbow.position.y = -0.28; shoulder.add(elbow);
    const forearm = makeLimb(0.11, 0.26, 0.11, skin); forearm.position.y = -0.12; elbow.add(forearm);
    arms.push({ shoulder, elbow, side });
  }
  root.userData = { isZombie: true, pelvis, torso, head, legs, arms, fireKick: 0, hitFlash: 0, attackT: 0, phase: Math.random() * Math.PI * 2, animState: 'walk', animTime: 0 };
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return root;
}

function damp(current, target, lambda, dt) { return THREE.MathUtils.damp(current, target, lambda, dt); }
