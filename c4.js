a24, scale: 0.94, bulk: 0.88, maskStyle: 'beanie' },
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