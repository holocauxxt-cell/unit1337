import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

try {
  const parts = await Promise.all([0,1,2,3,4,5,6,7].map(async (i) => {
    const r = await fetch('./p' + i + '.js?v=p3');
    if (!r.ok) throw new Error('part ' + i + ' HTTP ' + r.status);
    return r.text();
  }));
  const code = parts.join('\n');
  const run = new Function('THREE', code);
  run(THREE);
} catch (err) {
  console.error('UNIT1337 load failed', err);
  const boot = document.getElementById('boot');
  if (boot) {
    boot.innerHTML = '<div class="boot-title">ERROR</div><div class="boot-sub">' +
      String(err && err.message ? err.message : err) + '</div>';
  }
}
