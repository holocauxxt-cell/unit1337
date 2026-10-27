import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

try {
  // Proven complete hierarchical build (no truncation)
  const operatorTest = new URLSearchParams(location.search).get('operatorTest') === '1';
  document.body.classList.toggle('operator-test-mode', operatorTest);
  const BUILD_LABEL = operatorTest ? 'BUILD 12 · OPERATOR PREVIEW' : 'BUILD 12 · MAIN GAME';
  const gameFile = operatorTest ? './operator-test-game.js?v=12' : './game.js?v=operator-anatomy-v1';
  const r = await fetch(gameFile);
  if (!r.ok) throw new Error('game.js HTTP ' + r.status);
  let code = await r.text();
  code = code.replace(/import\s*\*\s*as\s*THREE\s*from\s*['"][^'"]+['"];?\s*/m, '');
  // Force higher fixed camera after load
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
  buildTag.dataset.build = '12';
} catch (err) {
  console.error('UNIT1337 load failed', err);
  const boot = document.getElementById('boot');
  if (boot) {
    const msg = (err && err.message) ? err.message : String(err);
    boot.innerHTML = '<div class="boot-title">ERROR</div><div class="boot-sub">' + msg + '</div>';
  }
}
