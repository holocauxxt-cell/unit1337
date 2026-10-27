import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

try {
  const operatorTest = new URLSearchParams(location.search).get('operatorTest') === '1';
  document.body.classList.toggle('operator-test-mode', operatorTest);
  const BUILD_LABEL = operatorTest ? 'BUILD 23 · STAGE1 OPERATORS' : 'BUILD 23 · MAIN GAME';

  // Main game: local game.js. Operator test: proven full file from history (avoids truncation).
  const gameFile = operatorTest
    ? 'https://raw.githubusercontent.com/holocauxxt-cell/unit1337/002c0d68529ade2d2310ce22ab577a04cfd8a1c6/operator-test-game.js'
    : './game.js?v=operator-anatomy-v1';

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

  // STAGE1 anatomy patches (applied to operator-test build)
  if (operatorTest) {
    // Narrow shoulders: 0.275 -> 0.225 (removes wing silhouette)
    code = code.replace(
      /shoulder\.position\.set\(side \* 0\.275, 0\.49, 0\.045\)/g,
      'shoulder.position.set(side * 0.225, 0.50, 0.03)'
    );
    // Slightly smaller shoulder pads
    code = code.replace(
      /makeDetail\(0\.060, 0\.055, 0\.055, 0x303a35/g,
      'makeDetail(0.048, 0.048, 0.048, 0x303a35'
    );
    code = code.replace(
      /makeDetail\(0\.070, 0\.075, 0\.060, vest/g,
      'makeDetail(0.055, 0.065, 0.052, vest'
    );
    // Tapered forearm
    code = code.replace(
      /makeDetail\(0\.052, 0\.135, 0\.054, vest/g,
      'makeDetail(0.042, 0.140, 0.044, vest'
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
  buildTag.dataset.build = '23';
} catch (err) {
  console.error('UNIT1337 load failed', err);
  const boot = document.getElementById('boot');
  if (boot) {
    const msg = (err && err.message) ? err.message : String(err);
    boot.innerHTML = '<div class="boot-title">ERROR</div><div class="boot-sub">' + msg + '</div>';
  }
}
