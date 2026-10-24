// UNIT 1337 loader — assemble full game from parts
const urls = ['./game.part0.js', './game.part1.js'];
const codes = await Promise.all(urls.map(u => fetch(u + '?v=anim2').then(r => r.text())));
const blob = new Blob(codes, { type: 'text/javascript' });
await import(URL.createObjectURL(blob));
