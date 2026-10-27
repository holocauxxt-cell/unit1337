import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

try {
  const operatorTest = new URLSearchParams(location.search).get('operatorTest') === '1';
  document.body.classList.toggle('operator-test-mode', operatorTest);
  const BUILD_LABEL = operatorTest ? 'BUILD 24 · STAGE1 OPERATORS' : 'BUILD 24 · MAIN GAME';

  const gameFile = operatorTest
    ? 'https://raw.githubusercontent.com/holocauxxt-cell/unit1337/002c0d68529ade2d2310ce22ab577a04cfd8a1c6/operator-test-game.js'
    : './game.js?v=b24';

  const r = await fetch(gameFile);
  if (!r.ok) throw new Error('game.js HTTP ' + r.status);
  let code = await r.text();
  code = code.replace(/import\s*\*\s*as\s*THREE\s*from\s*['"][^'"]+['"];?\s*/m, '');

  // Higher fixed camera
  code = code.replace(
    /camera\.position\.set\([^)]+\);\s*camera\.lookAt\([^)]+\);/,
    'camera.position.set(0, 19.5, 15.5); camera.lookAt(0, 0.4, 0);'
  );
  code = code.replace(
    /camera\.position\.y \+= \(15\.5 - camera\.position\.y\) \* Math\.min\(1, dt \* 7\);/,
    'camera.position.y = 19.5;'
  );
  code = code.replace(
    /const camX = player\.x \+ 0\.5, camZ = player\.z \+ 12;/,
    'const camX = player.x + 0.3, camZ = player.z + 14.5;'
  );

  // ===== STAGE1: narrow shoulders (both operator-test and main game) =====
  code = code.replace(/shoulder\.position\.set\(side \* 0\.275, 0\.49, 0\.045\)/g,
    'shoulder.position.set(side * 0.215, 0.50, 0.025)');
  code = code.replace(/shoulder\.position\.set\(side \* 0\.30, 0\.48, 0\.02\)/g,
    'shoulder.position.set(side * 0.215, 0.50, 0.025)');
  code = code.replace(/shoulder\.position\.set\(side \* 0\.30, 0\.46, 0\)/g,
    'shoulder.position.set(side * 0.22, 0.48, 0)');

  // Smaller deltoid / upper arm bulk
  code = code.replace(/makeDetail\(0\.060, 0\.055, 0\.055, 0x303a35/g, 'makeDetail(0.045, 0.045, 0.045, 0x303a35');
  code = code.replace(/makeDetail\(0\.070, 0\.075, 0\.060, vest/g, 'makeDetail(0.052, 0.062, 0.050, vest');
  code = code.replace(/makeDetail\(0\.060, 0\.125, 0\.058, 0x303a35/g, 'makeDetail(0.048, 0.128, 0.048, 0x303a35');
  code = code.replace(/makeDetail\(0\.052, 0\.135, 0\.054, vest/g, 'makeDetail(0.040, 0.140, 0.042, vest');

  // Main game box arms thinner
  code = code.replace(/makeLimb\(0\.075, 0\.22, 0\.078, vest\)/g, 'makeLimb(0.065, 0.24, 0.068, vest)');
  code = code.replace(/makeLimb\(0\.12, 0\.26, 0\.12, vest\)/g, 'makeLimb(0.070, 0.26, 0.072, vest)');

  // ===== STAGE1: real Ghost skull mask (replace helmet+small-mark version) =====
  if (operatorTest) {
    const oldGhost = /if \(isGhost\) \{[\s\S]*?const skullMark = makeDetail\(0\.088[\s\S]*?\}\s*\} else \{/;
    const newGhost = `if (isGhost) {
    // BUILD24: readable Ghost skull over balaclava
    const balaclava = makeDetail(0.132, 0.150, 0.130, 0x12161a, 0.96, 0.01);
    balaclava.position.set(0, -0.02, 0.008); head.add(balaclava);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.140, 16, 14), mat(0xf2ede3, 0.45, 0.04));
    skull.position.set(0, -0.008, 0.045); skull.scale.set(1.0, 1.06, 0.90);
    skull.castShadow = true; head.add(skull); addEdge(skull, 0x0a0c10, 1.05);
    const sockMat = new THREE.MeshBasicMaterial({ color: 0x030406 });
    const ls = new THREE.Mesh(new THREE.SphereGeometry(0.040, 10, 8), sockMat);
    ls.position.set(-0.050, 0.025, 0.150); head.add(ls);
    const rs = new THREE.Mesh(new THREE.SphereGeometry(0.040, 10, 8), sockMat);
    rs.position.set(0.050, 0.025, 0.150); head.add(rs);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.050, 6), sockMat);
    nose.rotation.x = Math.PI; nose.position.set(0, -0.010, 0.160); head.add(nose);
    const teeth = makeLimb(0.090, 0.026, 0.030, 0xf5f0e6, 0.35, 0.03, false);
    teeth.position.set(0, -0.075, 0.152); head.add(teeth);
    const jaw = makeLimb(0.108, 0.038, 0.072, 0xe8e2d6, 0.42, 0.03, false);
    jaw.position.set(0, -0.105, 0.072); head.add(jaw);
    for (const side of [-1, 1]) {
      const headset = makeDetail(0.032, 0.052, 0.042, 0x1a2024, 0.55, 0.15);
      headset.position.set(side * 0.145, -0.005, 0.0); head.add(headset);
    }
    const rim = makeLimb(0.22, 0.020, 0.15, 0x1d241f, 0.75, 0.05, false);
    rim.position.set(0, 0.085, -0.01); head.add(rim);
  } else {`;
    if (oldGhost.test(code)) {
      code = code.replace(oldGhost, newGhost);
    }
  }

  // ===== STAGE1: dramatically different menu stances =====
  if (operatorTest) {
    const oldPose = /function applyPreviewPose\(model, index\) \{[\s\S]*?^\}/m;
    // Use a simpler unique start and replace the whole function body via line markers
    code = code.replace(
      /function applyPreviewPose\(model, index\) \{[\s\S]*?\n\}/,
      `function applyPreviewPose(model, index) {
  const ud = model.userData;
  ud.pelvis.rotation.set(0, 0, 0);
  ud.legs.forEach(leg => { leg.hip.rotation.set(0,0,0); leg.knee.rotation.set(0,0,0); leg.ankle.rotation.set(0,0,0); });
  if (index === 0) {
    // GHOST — kneeling aim (one knee down)
    ud.pelvis.position.y = 0.58;
    ud.torso.rotation.set(-0.28, 0.08, 0);
    ud.head.rotation.set(0.22, -0.06, 0);
    ud.legs[0].hip.rotation.set(-1.15, 0.15, 0.1);
    ud.legs[0].knee.rotation.set(2.05, 0, 0);
    ud.legs[0].ankle.rotation.set(-0.45, 0, 0);
    ud.legs[1].hip.rotation.set(0.55, -0.1, -0.08);
    ud.legs[1].knee.rotation.set(1.15, 0, 0);
    ud.legs[1].ankle.rotation.set(-0.15, 0, 0);
    ud.rifleGroup.position.set(0.06, 0.40, 0.28);
    ud.rifleGroup.rotation.set(-0.18, 0.02, 0.02);
    ud.arms.forEach(arm => {
      arm.shoulder.rotation.set(-0.55, arm.side * -0.05, arm.side * 0.12);
      arm.elbow.rotation.set(-1.25, 0, arm.side * 0.06);
      arm.wrist.rotation.set(0.05, 0, 0);
    });
  } else if (index === 1) {
    // VIPER — standing combat stance
    ud.pelvis.position.y = 0.82;
    ud.torso.rotation.set(-0.06, 0, 0);
    ud.head.rotation.set(0.06, 0, 0);
    ud.legs[0].hip.rotation.set(-0.18, 0.12, 0.08);
    ud.legs[0].knee.rotation.set(0.35, 0, 0);
    ud.legs[1].hip.rotation.set(-0.12, -0.14, -0.06);
    ud.legs[1].knee.rotation.set(0.28, 0, 0);
    ud.rifleGroup.position.set(0.08, 0.36, 0.30);
    ud.rifleGroup.rotation.set(-0.10, 0.02, 0);
    ud.arms.forEach(arm => {
      arm.shoulder.rotation.set(-0.38, arm.side * -0.04, -arm.side * 0.08);
      arm.elbow.rotation.set(-1.15, 0, arm.side * 0.05);
      arm.wrist.rotation.set(0.02, 0, 0);
    });
  } else {
    // RAVEN — compact low-ready
    ud.pelvis.position.y = 0.76;
    ud.torso.rotation.set(-0.12, -0.06, 0);
    ud.head.rotation.set(0.04, 0.08, 0);
    ud.legs.forEach(leg => { leg.hip.rotation.x = -0.22; leg.knee.rotation.x = 0.45; leg.ankle.rotation.x = -0.12; });
    ud.legs[0].hip.rotation.z = 0.06; ud.legs[1].hip.rotation.z = -0.06;
    ud.rifleGroup.position.set(0.14, 0.20, 0.22);
    ud.rifleGroup.rotation.set(-0.42, 0.12, 0.04);
    ud.arms.forEach(arm => {
      arm.shoulder.rotation.set(-0.30, arm.side * -0.03, arm.side * 0.16);
      arm.elbow.rotation.set(-0.95, 0, arm.side * 0.04);
      arm.wrist.rotation.set(0.04, 0, 0);
    });
  }
}`
    );
  }

  const run = new Function('THREE', code);
  run(THREE);

  let buildTag = document.getElementById('build-version');
  if (!buildTag) {
    buildTag = document.createElement('div');
    buildTag.id = 'build-version';
    buildTag.setAttribute('aria-label', 'Game build version');
    document.body.appendChild(buildTag);
  }
  buildTag.textContent = BUILD_LABEL;
  buildTag.dataset.build = '24';
} catch (err) {
  console.error('UNIT1337 load failed', err);
  const boot = document.getElementById('boot');
  if (boot) {
    const msg = (err && err.message) ? err.message : String(err);
    boot.innerHTML = '<div class="boot-title">ERROR</div><div class="boot-sub">' + msg + '</div>';
  }
}
