// UNIT 1337 — 3D survivor (Three.js)
// Animations · zombie mobs · textured arena + props
const $ = (id) => document.getElementById(id);
const canvas = $('c');
const OPS = [
  { id: 'ghost', name: 'GHOST', hp: 100, speed: 1, dmg: 1, desc: 'Маска · баланс', accent: 0x6dd6a0 },
  { id: 'roach', name: 'ROACH', hp: 130, speed: 0.9, dmg: 0.95, desc: 'Тяжёлый · танк', accent: 0xd4a84b },
  { id: 'soap', name: 'SOAP', hp: 90, speed: 1.15, dmg: 1.05, desc: 'Лёгкий · манёвр', accent: 0x5eb0ff },
];
const selectedSkin = { ghost: 0, roach: 0, soap: 0 };
let menuPreview = true;

const ITEM_POOL = [
  { id: 'ap', name: 'Бронебойные', desc: 'Урон +18%', apply: (p) => { p.dmgMul *= 1.18; } },
  { id: 'grip', name: 'Тактическая рукоять', desc: 'Скорострельность +15%', apply: (p) => { p.fireRate *= 0.85; } },
  { id: 'optic', name: 'Коллиматор', desc: 'Дальность +20%', apply: (p) => { p.range *= 1.2; } },
  { id: 'boots', name: 'Тактические ботинки', desc: 'Скорость +12%', apply: (p) => { p.speedMul *= 1.12; } },
  { id: 'plate', name: 'Керамическая плита', desc: 'Макс. HP +25', apply: (p) => { p.maxHp += 25; p.hp += 25; } },
  { id: 'stim', name: 'Боевой стимулятор', desc: 'Реген 2 HP/с', apply: (p) => { p.regen += 2; } },
  { id: 'mag', name: 'Расширенный магазин', desc: 'Мультивыстрел +1', apply: (p) => { p.projectiles += 1; } },
  { id: 'dashcd', name: 'Лёгкий рюкзак', desc: 'Кулдаун рывка −20%', apply: (p) => { p.dashCdMax *= 0.8; } },
  { id: 'pickup', name: 'Магнитный модуль', desc: 'Радиус сбора XP +30%', apply: (p) => { p.magnet *= 1.3; } },
  { id: 'crit', name: 'Снайперский патрон', desc: 'Крит 15% ×2.2', apply: (p) => { p.crit = Math.min(0.5, p.crit + 0.15); } },
];
const WORLD = 48;
const HALF = WORLD / 2;
function makeTex(draw, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  draw(g, size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const groundTex = makeTex((g, s) => {
  g.fillStyle = '#1a2228';
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * s, y = Math.random() * s;
    const r = 8 + Math.random() * 40;
    g.fillStyle = `rgba(${20 + Math.random() * 30},${28 + Math.random() * 25},${30 + Math.random() * 20},${0.15 + Math.random() * 0.25})`;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  g.strokeStyle = 'rgba(60,80,70,0.25)';
  g.lineWidth = 2;
  for (let i = 0; i < s; i += 32) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, s); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(s, i); g.stroke();
  }
  g.strokeStyle = 'rgba(10,12,14,0.5)';
  g.lineWidth = 1.5;
  for (let i = 0; i < 12; i++) {
    g.beginPath();
    let x = Math.random() * s, y = Math.random() * s;
    g.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (Math.random() - 0.5) * 40;
      y += (Math.random() - 0.5) * 40;
      g.lineTo(x, y);
    }
    g.stroke();
  }
}, 512);
groundTex.repeat.set(6, 6);
const 