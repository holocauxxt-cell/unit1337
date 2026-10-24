 * S;
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
