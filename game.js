// UNIT 1337 — load base64 parts, decode, run as module
const n = 4;
const chunks = await Promise.all(
  Array.from({length: n}, (_, i) => fetch('./game.b64.' + i + '?v=3').then(r => r.text()))
);
const bin = Uint8Array.from(atob(chunks.join('')), c => c.charCodeAt(0));
const code = new TextDecoder().decode(bin);
const blob = new Blob([code], { type: 'text/javascript' });
await import(URL.createObjectURL(blob));
