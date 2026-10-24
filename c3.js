(const o of obstacles) {
    const cx = Math.max(o.x - o.hw, Math.min(x, o.x + o.hw));
    const cz = Math.max(o.z - o.hd, Math.min(z, o.z + o.hd));
    let dx = x - cx, dz = z - cz;
    const d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      const d = Math.sqrt(d2) || 0.0001;
      const pen = r - d;
      hx += (dx / d) * pen;
      hz += (dz / d) * pen;
      hit = o;
    }
  }
  return { x: hx, z: hz, hit };
}
const propRng = (seed) => {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
};
const rnd = propRng(1337);
for (let i = 0; i < 18; i++) {
  const a = rnd() * Math.PI * 2;
  const d = 6 + rnd() * 14;
  const x = Math.cos(a) * d;
  const z = Math.sin(a) * d;
  if (Math.hypot(x, z) < 4) continue;
  const t = rnd();
  if (t < 0.35) placeCrate(x, z, 0.85 + rnd() * 0.4);
  else if (t < 0.55) placeBarrel(x, z);
  else if (t < 0.75) placeBarrier(x, z, rnd() * Math.PI);
  else placeSandbags(x, z, rnd() * Math.PI);
}
[[-16, -16], [16, -16], [-16, 16], [16, 16], [0, -18], [0, 18], [-18, 0], [18, 0]].forEach(([x, z], i) => {
  placeLamp(x * 0.85, z * 0.85);
  if (i < 4) {
    placeCrate(x * 0.7, z * 0.7, 1.1);
    placeBarrel(x * 0.7 + 1.2, z * 0.7);
  }
});
// --- Operator visual kits (3 skins each, CoD-inspired) ---
const SKIN_KITS = {
  ghost: [
    { name: 'Classic', body: 0x2f3f38, accent: 0x6dd6a0, armor: 0x1e2a24, mask: 0xf0f0f0, skin: 0xc8b8a0, boot: 0x1a221c, gun: 0x1a2228, pack: 0x243028, scale: 1, bulk: 1, maskStyle: 'skull' },
    { name: 'Urban', body: 0x3a3a42, accent: 0xa0b0c0, armor: 0x2a2a32, mask: 0xe8e8e8, skin: 0xc8b8a0, boot: 0x1a1a20, gun: 0x222830, pack: 0x303038, scale: 1, bulk: 1, maskStyle: 'skull' },
    { name: 'Night', body: 0x1a2220, accent: 0x40ff90, armor: 0x121816, mask: 0xd0d0d0, skin: 0xb8a890, boot: 0x101410, gun: 0x101418, pack: 0x141c18, scale: 1, bulk: 1, maskStyle: 'skull' },
  ],
  roach: [
    { name: 'Desert', body: 0x5a4a32, accent: 0xd4a84b, armor: 0x3d3424, mask: 0x2a2418, skin: 0xb8a080, boot: 0x2a2418, gun: 0x2a2820, pack: 0x4a3e28, scale: 1.08, bulk: 1.25, maskStyle: 'helmet' },
    { name: 'Woodland', body: 0x3a4a32, accent: 0x8aaa4a, armor: 0x2a3420, mask: 0x1a2214, skin: 0xb0a080, boot: 0x1a2214, gun: 0x222820, pack: 0x2a3820, scale: 1.08, bulk: 1.28, maskStyle: 'helmet' },
    { name: 'Heavy', body: 0x4a4440, accent: 0xff8844, armor: 0x2a2824, mask: 0x1a1814, skin: 0xa09070, boot: 0x181410, gun: 0x1a1814, pack: 0x2a2420, scale: 1.12, bulk: 1.35, maskStyle: 'helmet' },
  ],
  soap: [
    { name: 'SAS', body: 0x2a3a4a, accent: 0x5eb0ff, armor: 0x1a2834, mask: 0x1a2430, skin: 0xd0b898, boot: 0x1a2430, gun: 0x151c24, pack: 0x243040, scale: 0.96, bulk: 0.9, maskStyle: 'beanie' },
    { name: 'Arctic', body: 0x4a5a68, accent: 0xb0d8ff, armor: 0x3a4a58, mask: 0xd8e0e8, skin: 0xd0b898, boot: 0x3a4850, gun: 0x2a343c, pack: 0x405060, scale: 0.96, bulk: 0.92, maskStyle: 'beanie' },
    { name: 'Stealth', body: 0x1a2430, accent: 0x40c8ff, armor: 0x101820, mask: 0x0a1018, skin: 0xc0a888, boot: 0x0c1218, gun: 0x0a1014, pack: 0x121