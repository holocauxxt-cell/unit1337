// UNIT 1337 — Operation Survivors
// Stage 1c: tactical operator visible, two-hand grip, animation states
const $ = (id) => document.getElementById(id);
const canvas = $('c');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a2430);
scene.fog = new THREE.Fog(0x1a2430, 40, 95);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 180);
camera.position.set(8, 9, 10);
camera.lookAt(0, 1.1, 0);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
scene.add(new THREE.AmbientLight(0x6a7a88, 0.85));
scene.add(new THREE.HemisphereLight(0xc8ddf0, 0x3a4a38, 1.6));
const sun = new THREE.DirectionalLight(0xfff0d0, 2.8);
sun.position.set(-12, 22, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
scene.add(sun);

const mat = (color, roughness = 0.82, metalness = 0.02) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const groundMat = mat(0x4a5a50);
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
  const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2 + Math.random() * 1.5, 0.8 + Math.random() * 1.1, 1.2 + Math.random() * 1.4), mat(i % 3 ? 0x4a5149 : 0x6a5b43));
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

function makeLimb(w, h, d, color, rough = 0.85, metal = 0.02) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, rough, metal));
  m.castShadow = true; m.receiveShadow = true; return m;
}

function makeOperator(color) {
  const root = new THREE.Group();
  const skin = 0xe0b892, pants = 0x4a5560, boot = 0x333a42, vest = color;

  const pelvis = new THREE.Group(); pelvis.position.y = 0.92; root.add(pelvis);
  pelvis.add(makeLimb(0.42, 0.22, 0.26, 0x2a3238));

  const torso = new THREE.Group(); torso.position.y = 0.12; pelvis.add(torso);
  const chest = makeLimb(0.52, 0.58, 0.30, vest, 0.75); chest.position.y = 0.30; torso.add(chest);
  const plate = makeLimb(0.44, 0.36, 0.08, 0x1e2824, 0.55); plate.position.set(0, 0.28, 0.16); torso.add(plate);
  const neck = makeLimb(0.12, 0.10, 0.12, skin); neck.position.y = 0.64; torso.add(neck);

  const head = new THREE.Group(); head.position.y = 0.78; torso.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), mat(skin, 0.9)); skull.castShadow = true; head.add(skull);
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.175, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(0x1a2220, 0.6, 0.15));
  helm.position.y = 0.02; head.add(helm);
  const visor = makeLimb(0.22, 0.06, 0.08, 0x111816, 0.3); visor.position.set(0, 0.02, 0.14); head.add(visor);

  const legs = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(side * 0.14, -0.05, 0); pelvis.add(hip);
    const thigh = makeLimb(0.16, 0.38, 0.18, pants); thigh.position.y = -0.19; hip.add(thigh);
    const knee = new THREE.Group(); knee.position.y = -0.38; hip.add(knee);
    const shin = makeLimb(0.14, 0.36, 0.16, pants); shin.position.y = -0.18; knee.add(shin);
    const foot = makeLimb(0.14, 0.08, 0.26, boot); foot.position.set(0, -0.38, 0.04); knee.add(foot);
    legs.push({ hip, knee, thigh, shin });
  }

  const arms = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group(); shoulder.position.set(side * 0.32, 0.52, 0); torso.add(shoulder);
    const upper = makeLimb(0.13, 0.30, 0.14, vest); upper.position.y = -0.14; shoulder.add(upper);
    const elbow = new THREE.Group(); elbow.position.y = -0.30; shoulder.add(elbow);
    const forearm = makeLimb(0.12, 0.28, 0.12, vest); forearm.position.y = -0.13; elbow.add(forearm);
    const wrist = new THREE.Group(); wrist.position.y = -0.28; elbow.add(wrist);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), mat(skin)); hand.castShadow = true; wrist.add(hand);
    arms.push({ shoulder, elbow, wrist, upper, forearm, hand, side });
  }

  const rifleGroup = new THREE.Group();
  rifleGroup.position.set(0.12, 0.38, 0.28);
  rifleGroup.rotation.x = -0.08; rifleGroup.rotation.y = 0.05;
  torso.add(rifleGroup);

  const receiver = makeLimb(0.09, 0.11, 0.42, 0x14181a, 0.4, 0.55);
  receiver.position.set(0, 0, 0.05); rifleGroup.add(receiver);
  const stock = makeLimb(0.08, 0.12, 0.22, 0x2a302e, 0.7); stock.position.set(0, 0.01, -0.28); rifleGroup.add(stock);
  const grip = makeLimb(0.07, 0.14, 0.08, 0x1c201e, 0.65); grip.position.set(0, -0.10, -0.02); rifleGroup.add(grip);
  const mag = makeLimb(0.06, 0.16, 0.08, 0x1a1e1c, 0.5); mag.position.set(0, -0.14, 0.08); rifleGroup.add(mag);
  const handguard = makeLimb(0.08, 0.09, 0.28, 0x1e2422, 0.55); handguard.position.z = 0.32; rifleGroup.add(handguard);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.36, 8), mat(0x0a0c0e, 0.35, 0.7));
  barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.58; barrel.castShadow = true; rifleGroup.add(barrel);
  const muzzleBrake = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.028, 0.06, 8), mat(0x0c0e10, 0.3, 0.65));
  muzzleBrake.rotation.x = Math.PI / 2; muzzleBrake.position.z = 0.78; rifleGroup.add(muzzleBrake);
  const optic = makeLimb(0.05, 0.06, 0.14, 0x0e1210, 0.35); optic.position.set(0, 0.09, 0.10); rifleGroup.add(optic);

  const muzzle = new THREE.Object3D(); muzzle.position.set(0, 0, 0.82); rifleGroup.add(muzzle);
  const rightGrip = new THREE.Object3D(); rightGrip.position.set(0, -0.06, -0.02); rifleGroup.add(rightGrip);
  const leftGrip = new THREE.Object3D(); leftGrip.position.set(0, -0.02, 0.34); rifleGroup.add(leftGrip);

  root.userData = {
    isZombie: false, pelvis, torso, head, chest, legs, arms,
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
  arm.shoulder.rotation.x = THREE.MathUtils.clamp(pitch * 0.85, -1.4, 0.6);
  arm.shoulder.rotation.z = THREE.MathUtils.clamp(yaw * 0.35 * arm.side, -0.9, 0.9);
  arm.elbow.rotation.x = -THREE.MathUtils.clamp((0.55 - dist) * 2.8, 0.15, 1.5);
}

function animateOperator(mesh, dt, time, opts) {
  const ud = mesh.userData;
  const { moving = false, sprint = 0, aiming = true, firing = false, rolling = false, vaulting = false, vaultProgress = 0, rollProgress = 0, rollSide = 1, hit = false, reloading = false, faceAngle = 0, vaultHeight = 0.8 } = opts;
  ud.animTime += dt; ud.fireKick = Math.max(0, ud.fireKick - dt * 8); ud.hitFlash = Math.max(0, ud.hitFlash - dt * 6);
  mesh.rotation.y = faceAngle;
  let state = 'idle';
  if (vaulting) state = 'vault'; else if (rolling) state = 'roll'; else if (reloading) state = 'reload';
  else if (hit) state = 'hit'; else if (firing) state = 'fire'; else if (moving && sprint > 0.55) state = 'run';
  else if (moving) state = 'walk'; else if (aiming) state = 'aim';
  ud.animState = state;
  const legs = ud.legs, arms = ud.arms, torso = ud.torso, pelvis = ud.pelvis, head = ud.head, rifle = ud.rifleGroup;
  const walkCycle = time * (state === 'run' ? 11 : state === 'walk' ? 7.5 : 1.2);
  const amp = state === 'run' ? 0.85 : state === 'walk' ? 0.55 : 0.04;
  if (state === 'roll') {
    const t = rollProgress;
    legs[0].hip.rotation.x = -0.9 + Math.sin(t * Math.PI) * 0.4; legs[1].hip.rotation.x = 0.6 - Math.sin(t * Math.PI) * 0.3;
    legs[0].knee.rotation.x = 1.1; legs[1].knee.rotation.x = 0.9;
    pelvis.rotation.x = Math.sin(t * Math.PI) * 0.5; pelvis.rotation.z = rollSide * Math.sin(t * Math.PI) * 0.9;
    torso.rotation.x = Math.sin(t * Math.PI) * 0.8; torso.rotation.z = rollSide * Math.sin(t * Math.PI) * 0.5;
    mesh.position.y = Math.sin(t * Math.PI) * 0.35;
  } else if (state === 'vault') {
    const t = vaultProgress;
    legs[0].hip.rotation.x = -0.3 - Math.sin(t * Math.PI) * 1.0; legs[1].hip.rotation.x = -0.1 - Math.sin(t * Math.PI * 0.9) * 0.8;
    legs[0].knee.rotation.x = 0.4 + Math.sin(t * Math.PI) * 1.0; legs[1].knee.rotation.x = 0.3 + Math.sin(t * Math.PI * 0.85) * 0.9;
    torso.rotation.x = -0.2 + Math.sin(t * Math.PI) * 0.55; pelvis.rotation.x = Math.sin(t * Math.PI) * 0.25;
    mesh.position.y = Math.sin(t * Math.PI) * (0.7 + vaultHeight * 0.35);
  } else {
    legs[0].hip.rotation.x = Math.sin(walkCycle) * amp; legs[1].hip.rotation.x = Math.sin(walkCycle + Math.PI) * amp;
    legs[0].knee.rotation.x = Math.max(0, Math.sin(walkCycle + 0.4) * amp * 1.1);
    legs[1].knee.rotation.x = Math.max(0, Math.sin(walkCycle + Math.PI + 0.4) * amp * 1.1);
    mesh.position.y = moving ? Math.abs(Math.sin(walkCycle)) * 0.04 * (0.5 + sprint) : 0;
    pelvis.rotation.z = moving ? Math.sin(walkCycle) * 0.06 : 0; pelvis.rotation.x = 0;
    torso.rotation.x = moving ? -0.08 - sprint * 0.06 : -0.04;
    torso.rotation.z = moving ? Math.sin(walkCycle) * 0.04 : 0;
  }
  head.rotation.x = state === 'aim' || state === 'fire' ? -0.08 : 0.02;
  head.rotation.y = Math.sin(time * 0.7) * 0.03;
  if (rifle) {
    let rx = -0.10, ry = 0.04, rz = 0, px = 0.10, py = 0.36, pz = 0.26;
    if (state === 'reload') { rx = 0.35; ry = -0.25; rz = 0.15; px = 0.05; py = 0.30; pz = 0.18; }
    else if (state === 'roll' || state === 'vault') { rx = 0.4; ry = 0.1; px = 0.08; py = 0.28; pz = 0.12; }
    else if (state === 'fire' || state === 'aim') { rx = -0.12 - ud.fireKick * 0.8; ry = 0.02; pz = 0.30; }
    rifle.rotation.x = damp(rifle.rotation.x, rx, 12, dt); rifle.rotation.y = damp(rifle.rotation.y, ry, 12, dt); rifle.rotation.z = damp(rifle.rotation.z, rz, 12, dt);
    rifle.position.x = damp(rifle.position.x, px, 14, dt); rifle.position.y = damp(rifle.position.y, py, 14, dt); rifle.position.z = damp(rifle.position.z, pz, 14, dt);
  }
  if (ud.rightGrip && ud.leftGrip && arms.length === 2) {
    mesh.updateMatrixWorld(true);
    const tmpR = new THREE.Vector3(), tmpL = new THREE.Vector3(), shR = new THREE.Vector3(), shL = new THREE.Vector3();
    ud.rightGrip.getWorldPosition(tmpR); ud.leftGrip.getWorldPosition(tmpL);
    arms[1].shoulder.getWorldPosition(shR); arms[0].shoulder.getWorldPosition(shL);
    if (state === 'reload') {
      arms[0].shoulder.rotation.x = -0.9; arms[0].shoulder.rotation.z = 0.5; arms[0].elbow.rotation.x = -1.4;
      arms[1].shoulder.rotation.x = -0.5; arms[1].elbow.rotation.x = -0.8;
    } else if (state === 'roll' || state === 'vault') {
      arms[0].shoulder.rotation.x = -1.0; arms[0].elbow.rotation.x = -0.6;
      arms[1].shoulder.rotation.x = -0.8; arms[1].elbow.rotation.x = -0.5;
    } else {
      poseArmToTarget(arms[1], tmpR, shR); poseArmToTarget(arms[0], tmpL, shL);
      arms[0].elbow.rotation.x = Math.min(arms[0].elbow.rotation.x, -0.7);
      arms[1].elbow.rotation.x = Math.min(arms[1].elbow.rotation.x, -0.55);
      if (ud.fireKick > 0) { arms[1].shoulder.rotation.x -= ud.fireKick * 0.25; torso.rotation.x -= ud.fireKick * 0.15; }
    }
  }
  if (ud.hitFlash > 0 && ud.chest && ud.chest.material) {
    if (!ud.chest.material.emissive) ud.chest.material.emissive = new THREE.Color(0x000000);
    ud.chest.material.emissive.setHex(0x442222); ud.chest.material.emissiveIntensity = ud.hitFlash * 2;
  } else if (ud.chest && ud.chest.material && ud.chest.material.emissive) ud.chest.material.emissiveIntensity = 0;
}

function animateZombie(mesh, dt, time, opts) {
  const ud = mesh.userData;
  const { moving = true, attacking = false, hit = false, dying = false, deathProgress = 0 } = opts;
  ud.animTime += dt; ud.hitFlash = Math.max(0, ud.hitFlash - dt * 5); ud.attackT = Math.max(0, ud.attackT - dt);
  const legs = ud.legs, arms = ud.arms, torso = ud.torso, head = ud.head, phase = ud.phase;
  if (dying) {
    const t = deathProgress;
    torso.rotation.x = t * 1.1; head.rotation.x = t * 0.6;
    legs[0].hip.rotation.x = -0.5 * t; legs[1].hip.rotation.x = -0.3 * t;
    arms[0].shoulder.rotation.x = -1.2 * t; arms[1].shoulder.rotation.x = -0.9 * t;
    mesh.position.y = -0.15 * t; mesh.rotation.z = (ud.deathDir || 1) * t * 0.9; return;
  }
  const cycle = time * 3.2 + phase, limp = 0.55 + Math.sin(phase * 2.1) * 0.15;
  if (moving) {
    legs[0].hip.rotation.x = Math.sin(cycle) * 0.55 * limp; legs[1].hip.rotation.x = Math.sin(cycle + Math.PI) * 0.40;
    legs[0].knee.rotation.x = Math.max(0, Math.sin(cycle + 0.5) * 0.7); legs[1].knee.rotation.x = Math.max(0, Math.sin(cycle + Math.PI + 0.3) * 0.5);
    torso.rotation.z = Math.sin(cycle * 0.5) * 0.12; torso.rotation.x = -0.12 + Math.sin(cycle) * 0.06;
    head.rotation.y = Math.sin(cycle * 0.4) * 0.2; head.rotation.z = Math.sin(cycle * 0.3) * 0.1;
    arms[0].shoulder.rotation.x = -0.5 + Math.sin(cycle + 0.8) * 0.35; arms[1].shoulder.rotation.x = -0.75 + Math.sin(cycle + 2.0) * 0.25;
    arms[0].elbow.rotation.x = -0.4; arms[1].elbow.rotation.x = -0.7;
    mesh.position.y = Math.abs(Math.sin(cycle)) * 0.03;
  }
  if (attacking || ud.attackT > 0) {
    const at = ud.attackT > 0 ? (1 - ud.attackT / 0.45) : 0;
    arms[0].shoulder.rotation.x = -1.4 * Math.sin(at * Math.PI); arms[1].shoulder.rotation.x = -1.1 * Math.sin(at * Math.PI);
    torso.rotation.x = -0.25 * Math.sin(at * Math.PI);
  }
  if (hit || ud.hitFlash > 0) { torso.rotation.x = -0.25 * ud.hitFlash * 4; head.rotation.x = 0.2 * ud.hitFlash * 3; }
}

function setupMenu() {
  const ops = $('ops'), info = $('menuOpInfo');
  if (ops) { ops.innerHTML = ''; OPS.forEach((op, i) => {
    const b = document.createElement('button'); b.className = 'op-card' + (i === selectedOp ? ' active' : '');
    b.textContent = op.name; b.style.borderColor = i === selectedOp ? '#a9d47a' : '';
    b.onclick = () => { selectedOp = i; setupMenu(); }; ops.appendChild(b);
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
  player.mesh.position.set(0, 0, 0); player.mesh.visible = true; player.mesh.scale.set(1, 1, 1);
  scene.add(player.mesh);
  camera.position.set(8, 9, 10); camera.lookAt(0, 1.1, 0);
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
  const ud = player.mesh.userData; ud.fireKick = 0.14;
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
    const camX = player.x + 7, camZ = player.z + 9;
    camera.position.x += (camX - camera.position.x) * Math.min(1, dt * 10);
    camera.position.z += (camZ - camera.position.z) * Math.min(1, dt * 10);
    camera.position.y += (8.5 - camera.position.y) * Math.min(1, dt * 10);
    camera.lookAt(player.x, 1.15, player.z);
  }
  renderer.render(scene, camera);
}

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
});

$('boot')?.classList.add('hidden');
requestAnimationFrame(frame);
