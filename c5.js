

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
  lmL.position.y = -0.24 * S; lmR.position.y = -0.24