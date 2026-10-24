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
  ret