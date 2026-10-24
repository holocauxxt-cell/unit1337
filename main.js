import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

try {
  const chunks = await Promise.all(
    Array.from({length: 16}, (_, i) =>
      fetch('./c' + i + '.js?v=p15').then(r => {
        if (!r.ok) throw new Error('part ' + i + ' HTTP ' + r.status);
        return r.text();
      })
    )
  );
  let code = chunks.join('');
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
