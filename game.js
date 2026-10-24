const chunks = await Promise.all([0,1,2].map(i => fetch('./g'+i+'.z?v=z1').then(r => r.text())));
const bin = Uint8Array.from(atob(chunks.join('')), c => c.charCodeAt(0));
const ds = new DecompressionStream('gzip');
const stream = new Blob([bin]).stream().pipeThrough(ds);
const code = await new Response(stream).text();
await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
