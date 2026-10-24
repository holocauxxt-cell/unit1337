import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

try {
  const chunks = await Promise.all([0, 1, 2].map(async (i) => {
    const r = await fetch('./g' + i + '.z?v=z3');
    if (!r.ok) throw new Error('part ' + i + ' HTTP ' + r.status);
    return r.text();
  }));
  const b64 = chunks.join('').replace(/\s+/g, '');
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const ds = new DecompressionStream('gzip');
  const stream = new Blob([bin]).stream().pipeThrough(ds);
  let code = await new Response(stream).text();
  // Drop ES import — THREE already loaded above
  code = code.replace(/import\s*\*\s*as\s*THREE\s*from\s*['"][^'"]+['"];?\s*/m, '');
  // Run as classic function body with THREE in scope
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
