import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

try {
  const parts = [];
  for (let i = 0; i < 20; i++) {
    const name = 's' + String(i).padStart(2, '0') + '.js';
    const r = await fetch('./' + name + '?v=s5p');
    if (!r.ok) throw new Error(name + ' HTTP ' + r.status);
    parts.push(await r.text());
  }
  let code = parts.join('');
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
