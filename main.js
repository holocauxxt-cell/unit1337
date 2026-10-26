import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

try {
  const r = await fetch('./game.js?v=stage5fix');
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
