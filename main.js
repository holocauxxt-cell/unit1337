import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

try {
  const urls = Array.from({length: 16}, (_, i) => `./q${i}.txt?v=stage4`);
  const parts = await Promise.all(urls.map(async (u) => {
    const r = await fetch(u);
    if (!r.ok) throw new Error(u + ' HTTP ' + r.status);
    return (await r.text()).replace(/\s+/g, '');
  }));
  let code = atob(parts.join(''));
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
