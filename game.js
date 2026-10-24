const chunks = await Promise.all([0,1,2].map(i => fetch('./g'+i+'.z?v=z2').then(r => {
  if (!r.ok) throw new Error('fail '+i+': '+r.status);
  return r.text();
}));
const bin = Uint8Array.from(atob(chunks.join('').replace(/\s/g,'')), c => c.charCodeAt(0));
const ds = new DecompressionStream('gzip');
const stream = new Blob([bin]).stream().pipeThrough(ds);
const code = await new Response(stream).text();
const s = document.createElement('script');
s.type = 'module';
s.textContent = code;
document.head.appendChild(s);
