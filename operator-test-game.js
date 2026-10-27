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

function makeDetail(w, h, d, color, rough = 0.78, metal = 0.04) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat(color, rough, metal));
  mesh.scale.set(w, h, d);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function makeOperator(color) {
  const root = new THREE.Group();
  const opIndex = Math.max(0, OPS.findIndex(op => op.color === color));
  const isGhost = opIndex === 0;
  const skin = 0xe0b892, pants = 0x3a4550, boot = 0x1e242a, vest = color;

  const pelvis = new THREE.Group(); pelvis.position.y = 0.82; root.add(pelvis);
  const hips = makeLimb(0.44, 0.20, 0.28, 0x2a3238); pelvis.add(hips);

  const torso = new THREE.Group(); torso.position.y = 0.10; pelvis.add(torso);
  // Rounded torso base: softer chest silhouette under the plate carrier, avoiding the square-box look.
  const chest = makeDetail(0.25, 0.285, 0.155, vest, 0.78, 0.015); chest.position.y = 0.28; torso.add(chest);
  const plate = makeDetail(0.205, 0.165, 0.043, 0x1a2220, 0.54, 0.15); plate.position.set(0, 0.26, 0.165); torso.add(plate);
  // Layered tactical kit: soft-edged shoulder armor, segmented magazine pouches and side utility gear.
  const plateInset = makeDetail(0.155, 0.115, 0.025, 0x303a38, 0.62, 0.12);
  plateInset.position.set(0, 0.29, 0.214); torso.add(plateInset);
  const plateMark = makeLimb(0.12, 0.018, 0.012, 0x899184, 0.7, 0.1, false);
  plateMark.position.set(0, 0.37, 0.239); torso.add(plateMark);
  for (let p = 0; p < 3; p++) {
    const pouch = makeDetail(0.055, 0.075, 0.045, p === 1 ? 0x303b37 : 0x26302d, 0.9, 0.01);
    pouch.position.set(-0.13 + p * 0.13, 0.08, 0.205); torso.add(pouch);
    const flap = makeLimb(0.075, 0.025, 0.012, 0x414b43, 0.9, 0.01, false);
    flap.position.set(-0.13 + p * 0.13, 0.105, 0.244); torso.add(flap);
  }
  // Harness straps, belt hardware and utility pouches add depth without bright colors.
  const leftStrap = makeLimb(0.055, 0.39, 0.025, 0x252d2a, 0.9, 0.02, false);
  leftStrap.position.set(-0.145, 0.30, 0.205); leftStrap.rotation.z = -0.22; torso.add(leftStrap);
  const rightStrap = makeLimb(0.055, 0.39, 0.025, 0x252d2a, 0.9, 0.02, false);
  rightStrap.position.set(0.145, 0.30, 0.205); rightStrap.rotation.z = 0.22; torso.add(rightStrap);
  const buckle = makeLimb(0.075, 0.05, 0.025, 0x9a9b84, 0.42, 0.45, false);
  buckle.position.set(0, -0.01, 0.17); pelvis.add(buckle);
  const belt = makeLimb(0.47, 0.075, 0.31, 0x202824, 0.92, 0.02);
  belt.position.set(0, -0.01, 0); pelvis.add(belt);
  for (const side of [-1, 1]) {
    const utility = makeLimb(0.095, 0.105, 0.09, 0x252e2a, 0.9, 0.02);
    utility.position.set(side * 0.225, -0.01, 0.015); pelvis.add(utility);
    const utilityFlap = makeLimb(0.085, 0.025, 0.012, 0x50594a, 0.85, 0.02, false);
    utilityFlap.position.set(side * 0.225, 0.025, 0.064); pelvis.add(utilityFlap);
  }
  const radio = makeLimb(0.075, 0.14, 0.055, 0x202725, 0.72, 0.08);
  radio.position.set(-0.235, 0.27, -0.025); torso.add(radio);
  const radioAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.09, 6), mat(0x141a18, 0.5, 0.2));
  radioAntenna.position.set(-0.24, 0.385, -0.025); torso.add(radioAntenna);
  const neck = makeLimb(0.11, 0.09, 0.11, skin, 0.9, 0.02, false); neck.position.y = 0.58; torso.add(neck);

  const head = new THREE.Group(); head.position.y = 0.70; torso.add(head);
  if (isGhost) {
    // Ghost uses a covered tactical face, not a skull: compact helmet, balaclava and low-profile eye protection.
    const balaclava = makeDetail(0.128, 0.145, 0.125, 0x202622, 0.96, 0.01);
    balaclava.position.set(0, -0.025, 0.012); head.add(balaclava);
    const jawWrap = makeDetail(0.105, 0.067, 0.105, 0x303832, 0.98, 0.01);
    jawWrap.position.set(0, -0.09, 0.055); head.add(jawWrap);
    const helmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.151, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58),
      mat(0x343d35, 0.78, 0.04)
    );
    helmet.position.set(0, 0.035, -0.005); helmet.scale.set(1.02, 0.9, 1.0); helmet.castShadow = true; head.add(helmet);
    const helmetRim = makeLimb(0.235, 0.025, 0.19, 0x1d241f, 0.82, 0.02, false);
    helmetRim.position.set(0, 0.005, 0.025); head.add(helmetRim);
    const goggles = makeLimb(0.205, 0.052, 0.045, 0x111816, 0.28, 0.28, false);
    goggles.position.set(0, 0.015, 0.126); head.add(goggles);
    for (const side of [-1, 1]) {
      const lens = makeLimb(0.082, 0.032, 0.012, 0x293b38, 0.24, 0.4, false);
      lens.position.set(side * 0.052, 0.016, 0.151); head.add(lens);
      const headset = makeDetail(0.035, 0.052, 0.045, 0x171e1b, 0.6, 0.08);
      headset.position.set(side * 0.145, -0.005, 0.005); head.add(headset);
    }
    const maskSeam = makeLimb(0.09, 0.012, 0.012, 0x414a41, 0.92, 0.01, false);
    maskSeam.position.set(0, -0.064, 0.151); head.add(maskSeam);
  } else {
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.155, 12, 10), mat(skin, 0.9));
    skull.castShadow = true; head.add(skull); addEdge(skull, 0x111418, 1.04);
    const helm = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
      mat(0x1a2220, 0.6, 0.15)
    );
    helm.position.y = 0.02; head.add(helm);
    const visor = makeLimb(0.20, 0.05, 0.07, 0x111816, 0.3); visor.position.set(0, 0.02, 0.13); head.add(visor);
    const mount = makeLimb(0.035, 0.06, 0.035, 0x39433c, 0.48, 0.3, false);
    mount.position.set(0, 0.09, 0.12); head.add(mount);
    const sideRail = makeLimb(0.025, 0.025, 0.12, 0x485149, 0.55, 0.25, false);
    sideRail.position.set(0.145, 0.005, 0); head.add(sideRail);
    const headset = makeDetail(0.035, 0.055, 0.045, 0x171e1b, 0.55, 0.12);
    headset.position.set(-0.155, -0.005, 0.015); head.add(headset);
    const nvgHinge = makeLimb(0.045, 0.035, 0.035, 0x62695a, 0.45, 0.35, false);
    nvgHinge.position.set(0, 0.105, 0.15); head.add(nvgHinge);
    const nvgArm = makeLimb(0.025, 0.10, 0.025, 0x252c28, 0.5, 0.3, false);
    nvgArm.position.set(0, 0.065, 0.18); nvgArm.rotation.x = -0.32; head.add(nvgArm);
    const nvgPod = makeDetail(0.035, 0.065, 0.045, 0x151b19, 0.42, 0.35);
    nvgPod.position.set(0, 0.025, 0.22); head.add(nvgPod);
    if (opIndex === 1) {
      const lowerMask = makeDetail(0.105, 0.07, 0.105, 0x202722, 0.92, 0.02);
      lowerMask.position.set(0, -0.085, 0.075); head.add(lowerMask);
      const helmetRail = makeLimb(0.025, 0.025, 0.15, 0x667064, 0.65, 0.12, false);
      helmetRail.position.set(0.155, 0.045, -0.005); head.add(helmetRail);
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.12, 6), mat(0x252d28, 0.7, 0.05));
      antenna.position.set(-0.12, 0.12, -0.02); antenna.rotation.z = -0.18; head.add(antenna);
    } else if (opIndex === 2) {
      const hood = makeDetail(0.145, 0.12, 0.13, 0x252d32, 0.95, 0.01);
      hood.position.set(0, -0.045, -0.015); head.add(hood);
      const faceShield = makeDetail(0.13, 0.09, 0.055, 0x101719, 0.28, 0.22);
      faceShield.position.set(0, -0.035, 0.132); head.add(faceShield);
      const shieldRim = makeLimb(0.15, 0.018, 0.018, 0x56615c, 0.7, 0.08, false);
      shieldRim.position.set(0, 0.012, 0.17); head.add(shieldRim);
    }
  }

  const legs = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(side * 0.13, -0.04, 0.02); pelvis.add(hip);
    const thigh = makeLimb(0.16, 0.34, 0.18, pants); thigh.position.y = -0.17; hip.add(thigh);
    const thighPocket = makeLimb(0.105, 0.12, 0.035, 0x303a3d, 0.9, 0.01);
    thighPocket.position.set(side * 0.015, -0.19, 0.092); hip.add(thighPocket);
    const pocketFlap = makeLimb(0.11, 0.025, 0.012, 0x59604f, 0.9, 0.01, false);
    pocketFlap.position.set(side * 0.015, -0.145, 0.114); hip.add(pocketFlap);
    const knee = new THREE.Group(); knee.position.y = -0.34; hip.add(knee);
    const kneePad = makeDetail(0.095, 0.105, 0.045, 0x252d2b, 0.72, 0.08);
    kneePad.position.set(0, -0.015, 0.085); knee.add(kneePad);
    const kneeRidge = makeLimb(0.09, 0.018, 0.012, 0x59604f, 0.82, 0.02, false);
    kneeRidge.position.set(0, 0.015, 0.125); knee.add(kneeRidge);
    const shin = makeLimb(0.135, 0.32, 0.155, pants); shin.position.y = -0.16; knee.add(shin);
    // Articulated ankle/boot lets the foot roll naturally during a run cycle.
    const ankle = new THREE.Group(); ankle.position.y = -0.30; knee.add(ankle);
    const boot = makeLimb(0.14, 0.09, 0.25, 0x202725, 0.78, 0.04);
    boot.position.set(0, -0.02, 0.055); ankle.add(boot);
    const toeCap = makeDetail(0.125, 0.052, 0.09, 0x303834, 0.72, 0.08);
    toeCap.position.set(0, -0.01, 0.135); ankle.add(toeCap);
    const sole = makeLimb(0.145, 0.025, 0.26, 0x101514, 0.95, 0.01, false);
    sole.position.set(0, -0.065, 0.06); ankle.add(sole);
    legs.push({ hip, knee, ankle, thigh, shin });
  }

  const arms = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.30, 0.48, 0.02);
    torso.add(shoulder);
    const shoulderPad = makeDetail(0.095, 0.09, 0.095, 0x303a35, 0.8, 0.02);
    shoulderPad.position.set(0, -0.025, 0.005); shoulder.add(shoulderPad);
    const upper = makeDetail(0.068, 0.14, 0.071, vest, 0.82, 0.015); upper.position.y = -0.13; shoulder.add(upper);
    const upperStrap = makeLimb(0.145, 0.035, 0.145, 0x222b28, 0.9, 0.01, false);
    upperStrap.position.set(0, -0.08, 0); shoulder.add(upperStrap);
    const elbow = new THREE.Group(); elbow.position.y = -0.28; shoulder.add(elbow);
    const elbowPad = makeDetail(0.075, 0.065, 0.07, 0x252d2b, 0.8, 0.02);
    elbowPad.position.set(0, -0.015, 0.025); elbow.add(elbowPad);
    const forearm = makeDetail(0.061, 0.13, 0.061, vest, 0.84, 0.015); forearm.position.y = -0.12; elbow.add(forearm);
    const wrist = new THREE.Group(); wrist.position.y = -0.26; elbow.add(wrist);
    const glove = makeDetail(0.062, 0.07, 0.065, 0x171d1b, 0.95, 0.01);
    glove.position.set(0, -0.015, 0.015); wrist.add(glove);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mat(0x252c28, 0.95));
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
  const topRail = makeLimb(0.025, 0.018, 0.30, 0x343b36, 0.45, 0.55, false);
  topRail.position.set(0, 0.047, 0.22); rifleGroup.add(topRail);
  const optic = makeLimb(0.04, 0.05, 0.12, 0x0e1210, 0.35);
  optic.position.set(0, 0.07, 0.08); rifleGroup.add(optic);
  const opticLensFront = makeLimb(0.032, 0.032, 0.012, 0x344b4a, 0.22, 0.45, false);
  opticLensFront.position.set(0, 0.075, 0.145); rifleGroup.add(opticLensFront);
  const opticLensRear = makeLimb(0.028, 0.028, 0.012, 0x202f30, 0.25, 0.35, false);
  opticLensRear.position.set(0, 0.075, 0.025); rifleGroup.add(opticLensRear);
  for (let railSlot = 0; railSlot < 5; railSlot++) {
    const slot = makeLimb(0.012, 0.012, 0.025, 0x50574d, 0.6, 0.4, false);
    slot.position.set(0, 0.055, 0.13 + railSlot * 0.045); rifleGroup.add(slot);
  }

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
  // Use the actual smoothed turn step as angular velocity, so torso/head counter-rotation
  // follows the operator instead of snapping when the facing target changes quickly.
  const turnStep = diff * Math.min(1, dt * 10);
  mesh.rotation.y = fy + turnStep;
  const turnTarget = THREE.MathUtils.clamp(turnStep / Math.max(dt, 0.016), -3.2, 3.2);
  ud.turnRate = damp(ud.turnRate || 0, turnTarget, 8, dt);
  let state = 'idle';
  if (vaulting) state = 'vault'; else if (rolling) state = 'roll'; else if (reloading) state = 'reload';
  else if (hit) state = 'hit'; else if (moving && sprint > 0.55) state = 'run';
  else if (moving) state = 'walk'; else if (firing) state = 'fire'; else if (aiming) state = 'aim';
  ud.animState = state;
  const legs = ud.legs, arms = ud.arms, torso = ud.torso, pelvis = ud.pelvis, head = ud.head, rifle = ud.rifleGroup;
  const isRun = state === 'run', isWalk = state === 'walk' || isRun;
  // Compact, weighty tactical gait: shorter stride, lower bounce and less arm flailing.
  const cadence = isRun ? 8.0 : isWalk ? 5.7 : 1.0;
  const walkCycle = time * cadence;
  const amp = isRun ? 0.48 : isWalk ? 0.29 : 0.025;
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
    if (legs[0].ankle) legs[0].ankle.rotation.x = damp(legs[0].ankle.rotation.x, isWalk ? Math.max(0, -Math.sin(walkCycle + 0.75)) * (isRun ? 0.32 : 0.18) : 0.02, 10, dt);
    if (legs[1].ankle) legs[1].ankle.rotation.x = damp(legs[1].ankle.rotation.x, isWalk ? Math.max(0, -Math.sin(walkCycle + Math.PI + 0.75)) * (isRun ? 0.32 : 0.18) : 0.02, 10, dt);
    const bob = isWalk ? Math.abs(Math.sin(walkCycle)) * (isRun ? 0.055 : 0.032) : breath * 0.4;
    mesh.position.y = bob;
    pelvis.rotation.z = damp(pelvis.rotation.z, isWalk ? Math.sin(walkCycle) * (isRun ? 0.09 : 0.055) : 0, 9, dt);
    pelvis.rotation.x = damp(pelvis.rotation.x, isWalk ? -0.04 - sprint * 0.03 : -0.02, 9, dt);
    torso.rotation.x = damp(torso.rotation.x, (isWalk ? -0.1 - sprint * 0.07 : -0.05) - ud.fireKick * 0.35 + breath, 10, dt);
    torso.rotation.z = damp(torso.rotation.z, isWalk ? -Math.sin(walkCycle) * (isRun ? 0.06 : 0.035) : 0, 9, dt);
    const gaitYaw = isWalk ? Math.sin(walkCycle) * 0.04 : 0;
    const turnCounter = THREE.MathUtils.clamp(-ud.turnRate * 0.032, -0.12, 0.12);
    torso.rotation.y = damp(torso.rotation.y, gaitYaw + turnCounter, 8, dt);
    // Small foot/hip response helps the body read as turning instead of rotating like a rigid stick.
    legs[0].hip.rotation.z = damp(legs[0].hip.rotation.z, THREE.MathUtils.clamp(ud.turnRate * 0.012, -0.045, 0.045), 7, dt);
    legs[1].hip.rotation.z = damp(legs[1].hip.rotation.z, THREE.MathUtils.clamp(ud.turnRate * 0.025, -0.09, 0.09), 7, dt);
  }
  const headPitch = (state === 'aim' || state === 'fire') ? -0.1 : 0.03 + breath * 0.5;
  head.rotation.x = damp(head.rotation.x, headPitch, 8, dt);
  const headCounter = THREE.MathUtils.clamp(-ud.turnRate * 0.035, -0.12, 0.12);
  head.rotation.y = damp(head.rotation.y, headCounter + Math.sin(time * 0.55) * 0.025, 6, dt);
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
    // Small, phase-locked shoulder/forearm movement makes the rifle stance feel carried, not frozen.
    if (isWalk && state !== 'roll' && state !== 'vault' && state !== 'reload') {
      const gait = Math.sin(walkCycle);
      const gaitScale = isRun ? 0.075 : 0.035;
      arms[0].shoulder.rotation.x += gait * gaitScale;
      arms[1].shoulder.rotation.x -= gait * gaitScale * 0.65;
      arms[0].elbow.rotation.x -= Math.max(0, gait) * gaitScale * 0.55;
      arms[1].elbow.rotation.x -= Math.max(0, -gait) * gaitScale * 0.4;
    }
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

let previewRenderer = null, previewScene = null, previewCamera = null, previewOperator = null;
let previewYaw = 0, previewDrag = null, previewLastInput = 0;
function setupOperatorPreview() {
  const previewCanvas = $('operatorPreviewCanvas');
  if (!previewCanvas || !document.body.classList.contains('operator-test-mode') || previewRenderer) return;
  previewScene = new THREE.Scene();
  previewScene.background = new THREE.Color(0x101820);
  previewCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
  previewCamera.position.set(0, 1.45, 5.8);
  previewCamera.lookAt(0, 1.02, 0);
  previewRenderer = new THREE.WebGLRenderer({ canvas: previewCanvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  previewRenderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  previewRenderer.setSize(Math.max(1, previewCanvas.clientWidth), Math.max(1, previewCanvas.clientHeight), false);
  previewRenderer.shadowMap.enabled = true;
  previewRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  previewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  previewRenderer.toneMappingExposure = 1.1;
  previewScene.add(new THREE.HemisphereLight(0xdce8ee, 0x242c29, 2.0));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.5); key.position.set(-3, 5, 4); previewScene.add(key);
  const rim = new THREE.DirectionalLight(0x8ba6b0, 1.1); rim.position.set(3, 2, -3); previewScene.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.4, 32), new THREE.MeshStandardMaterial({ color: 0x28322f, roughness: 0.95 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.03; floor.receiveShadow = true; previewScene.add(floor);
  key.castShadow = true;
  const canvas = previewCanvas;
  canvas.style.touchAction = 'pan-y';
  canvas.addEventListener('pointerdown', (e) => {
    previewDrag = { x: e.clientX, yaw: previewYaw, id: e.pointerId };
    previewLastInput = performance.now();
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!previewDrag || previewDrag.id !== e.pointerId) return;
    previewYaw = previewDrag.yaw + (e.clientX - previewDrag.x) * 0.012;
    previewLastInput = performance.now();
  });
  const endPreviewDrag = (e) => { if (previewDrag && previewDrag.id === e.pointerId) previewDrag = null; };
  canvas.addEventListener('pointerup', endPreviewDrag);
  canvas.addEventListener('pointercancel', endPreviewDrag);
  updateOperatorPreview();
}
function applyPreviewPose(model, index) {
  const ud = model.userData;
  // Preview poses are presentation-only; in-game animation and controls are untouched.
  ud.pelvis.position.y = index === 0 ? 0.61 : index === 2 ? 0.73 : 0.82;
  ud.pelvis.rotation.set(0, 0, 0);
  ud.torso.rotation.set(index === 0 ? -0.13 : index === 2 ? -0.08 : 0.025, 0, 0);
  ud.head.rotation.set(index === 0 ? 0.10 : 0, 0, 0);
  ud.legs.forEach((leg, i) => {
    leg.hip.rotation.set(0, 0, 0);
    leg.knee.rotation.set(0, 0, 0);
    leg.ankle.rotation.set(0, 0, 0);
  });
  ud.arms.forEach(arm => {
    arm.shoulder.rotation.set(0, 0, 0);
    arm.elbow.rotation.set(0, 0, 0);
    arm.wrist.rotation.set(0, 0, 0);
  });
  ud.rifleGroup.rotation.set(-0.18, 0.08, 0.04);
  if (index === 0) {
    // GHOST: one-knee kneeling, rifle shouldered and looking down the optic.
    ud.legs[0].hip.rotation.x = -0.88;
    ud.legs[0].knee.rotation.x = 1.72;
    ud.legs[0].ankle.rotation.x = -0.35;
    ud.legs[1].hip.rotation.x = 0.50;
    ud.legs[1].knee.rotation.x = 1.00;
    ud.torso.rotation.x = -0.19;
    ud.head.rotation.x = 0.16;
    ud.rifleGroup.position.set(0.10, 0.40, 0.27);
    ud.rifleGroup.rotation.set(-0.10, 0.02, 0.015);
    ud.arms.forEach(arm => {
      arm.shoulder.rotation.x = -1.05;
      arm.shoulder.rotation.z = arm.side * -0.12;
      arm.elbow.rotation.x = -0.62;
    });
  } else if (index === 1) {
    // VIPER: upright aggressive aim, rifle held high and tight to the shoulder.
    ud.rifleGroup.position.set(0.08, 0.36, 0.28);
    ud.rifleGroup.rotation.set(-0.10, 0.015, 0.01);
    ud.arms.forEach(arm => {
      arm.shoulder.rotation.x = -1.12;
      arm.shoulder.rotation.z = arm.side * -0.09;
      arm.elbow.rotation.x = -0.72;
    });
    ud.head.rotation.x = 0.10;
  } else {
    // RAVEN: low-ready stance, knees flexed and rifle held across the chest.
    ud.legs.forEach(leg => { leg.hip.rotation.x = -0.16; leg.knee.rotation.x = 0.35; });
    ud.rifleGroup.position.set(0.14, 0.27, 0.23);
    ud.rifleGroup.rotation.set(-0.28, 0.16, 0.04);
    ud.arms.forEach(arm => {
      arm.shoulder.rotation.x = -0.76;
      arm.shoulder.rotation.z = arm.side * -0.16;
      arm.elbow.rotation.x = -0.45;
    });
    ud.head.rotation.x = 0.02;
  }
}
function updateOperatorPreview() {
  if (!previewScene || !previewRenderer) return;
  if (previewOperator) {
    previewScene.remove(previewOperator);
    previewOperator.traverse(o => {
      if (o.isMesh) {
        o.geometry?.dispose();
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material?.dispose();
      }
    });
  }
  previewOperator = makeOperator(OPS[selectedOp].color);
  previewOperator.scale.setScalar(1.20);
  previewOperator.position.y = 0;
  applyPreviewPose(previewOperator, selectedOp);
  previewScene.add(previewOperator);
  const c = $('operatorPreviewCanvas');
  previewRenderer.setSize(Math.max(1, c.clientWidth), Math.max(1, c.clientHeight), false);
  previewCamera.aspect = Math.max(1, c.clientWidth) / Math.max(1, c.clientHeight);
  previewCamera.updateProjectionMatrix();
}
function renderOperatorPreview(time) {
  if (!previewRenderer || !previewScene || !$('menu') || $('menu').classList.contains('hidden')) return;
  if (previewOperator) {
    // Slow automatic turn gives a 360-degree look; horizontal finger-drag takes control immediately.
    if (!previewDrag && time - previewLastInput > 1800) previewYaw += 0.0018;
    previewOperator.rotation.y = previewYaw;
  }
  previewRenderer.render(previewScene, previewCamera);
}
function setupMenu() {
  setupOperatorPreview();
  const ops = $('ops'), info = $('menuOpInfo');
  if (ops) { ops.innerHTML = ''; OPS.forEach((op, i) => {
    const b = document.createElement('button'); b.className = 'op-card' + (i === selectedOp ? ' active' : '');
    b.textContent = op.name; b.style.borderColor = i === selectedOp ? '#a9d47a' : '';
    b.onclick = () => { selectedOp = i; setupMenu(); updateOperatorPreview(); }; ops.appendChild(b);
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
  for (const a of [...zombies, ...bullets, ...drops]) { scene.remove(a.mesh || a); if (a.tracer) scene.remove(a.tracer); if (a.flash) scene.remove(a.flash); }
  for (const corpse of corpses) scene.remove(corpse.mesh);
  corpses.length = 0; zombies.length = 0; bullets.length = 0; drops.length = 0;
  elapsed = 0; fireClock = 0; spawnClock = 0; wave = 1; waveKills = 0; kills = 0;
  level = 1; xp = 0; xpNeed = 5; armor = 0; weaponLevel = 1;
  Object.assign(player, { x: 0, z: 0, hp: 100, maxHp: 100, dash: 0, dashCd: 0, invuln: 0, vaultT: 0, vaultY: 0, rollT: 0, rollX: 0, rollZ: 0, animState: 'idle', reloadT: 0, hitT: 0 });
  if (player.mesh) scene.remove(player.mesh);
  player.mesh = makeOperator(OPS[selectedOp].color);
  player.mesh.position.set(0, 0, 0); player.mesh.visible = true; player.mesh.scale.set(1.1, 1.12, 1.1);
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
  // World-space tracer aligned with bullet travel, not a camera-facing sprite.
  const tracer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.72, 5),
    new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  const dir3 = new THREE.Vector3(dx / len, 0, dz / len);
  tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir3);
  tracer.position.copy(muzzlePos).addScaledVector(dir3, -0.25);
  scene.add(tracer);
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
      if (b.tracer) {
        const speed = Math.hypot(b.vx, b.vz) || 1;
        const dir3 = new THREE.Vector3(b.vx / speed, 0, b.vz / speed);
        b.tracer.position.set(b.x, b.y || 1.2, b.z).addScaledVector(dir3, -0.25);
        b.tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir3);
        b.tracer.material.opacity = Math.max(0.2, 0.95 - b.age * 1.1);
      }
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
  renderOperatorPreview(now);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  if (previewRenderer && $('operatorPreviewCanvas')) {
    const c = $('operatorPreviewCanvas');
    previewRenderer.setSize(Math.max(1, c.clientWidth), Math.max(1, c.clientHeight), false);
    previewCamera.aspect = Math.max(1, c.clientWidth) / Math.max(1, c.clientHeight);
    previewCamera.updateProjectionMatrix();
  }
});

$('boot')?.classList.add('hidden');
requestAnimationFrame(frame);
