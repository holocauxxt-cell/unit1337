import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

try {
  const r = await fetch('https://raw.githubusercontent.com/holocauxxt-cell/unit1337/5b1e261e7813cda43c776d3f2b5baac321d0f3a3/game.js');
  if (!r.ok) throw new Error('game.js HTTP ' + r.status);
  let code = await r.text();
  code = code.replace(/import\s*\*\s*as\s*THREE\s*from\s*['"][^'"]+['"];?\s*/m, '');
  const run = new Function('THREE', code);
  run(THREE);
} catch (err) {
  console.error('UNIT1337 load failed', err);
  const boot = document.getElementById('boot');
  if (boot) {
    const msg = (err && err.message) ? err.message : String(err);
    boot.innerHTML = '<div class="boot-title">ERROR</div><div class="boot-sub">' + msg + '</div>';
  }
}
