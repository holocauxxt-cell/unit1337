= new THREE.MeshStandardMaterial({ map: crateTex, roughness: 0.85, metalness: 0.05 });
const metalMat = new THREE.MeshStandardMaterial({ map: metalTex, roughness: 0.45, metalness: 0.55, color: 0xb8c8d0 });
const barrierMat = new THREE.MeshStandardMaterial({ color: 0x8a6a20, roughness: 0.7, metalness: 0.2 });
const lampMat = new THREE.MeshStandardMaterial({ color: 0x333840, roughness: 0.5, metalness: 0.6 });
const lampGlow = new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xffaa44, emissiveIntensity: 1.6, roughness: 0.35 });
const obstacles = [];
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
  for 