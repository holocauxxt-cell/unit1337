urn e;
}
function releaseEnemy(e, i) {
  e.mesh.visible = false;
  activeEnemies.splice(i, 1);
  enemyPool.push(e);
}
function acquireXp() {
  let o = xpPool.pop();
  if (!o) {
    o = { mesh: new THREE.Mesh(geoXp, matXp), v: 0 };
    scene.add(o.mesh);
  }
  o.mesh.visible = true;
  o.v = 0;
  activeXp.push(o);
  return o;
}
function releaseXp(o, i) {
  o.mesh.visible = false;
  activeXp.splice(i, 1);
  xpPool.push(o);
}
let selectedOp = OPS[0];
let running = false, paused = false, gameOver = false;
let time = 0, kills = 0, spawnAcc = 0, last = performance.now(), msgTimer = 0, raf = 0;
const player = {
  x: 0, z: 0, angle: 0, faceAngle: 0,
  r: 0.45, hp: 100, maxHp: 100,
  level: 1, xp: 0, xpNeed: 8,
  speedMul: 1, dmgMul: 1, fireRate: 0.22, range: 12,
  projectiles: 1, regen: 0, magnet: 4.5, crit: 0.05,
  dashCd: 0, dashCdMax: 1.6, dashT: 0, dashDirX: 1, dashDirZ: 0,
  fireCd: 0, hurtT: 0, moveAmt: 0, shootKick: 0,
  vaultT: 0, vaultX: 0, vaultZ: 0, y: 0,
};
const keys = new Set();
const joy = { active: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
const camTarget = new THREE.Vector3();
const opsEl = $('ops');
function refreshSkinButtons() {
  const box = $('skinPick');
  if (!box) return;
  box.innerHTML = '';
  const kits = SKIN_KITS[selectedOp.id] || [];
  kits.forEach((kit, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'skin-btn' + (selectedSkin[selectedOp.id] === i ? ' selected' : '');
    b.textContent = kit.name;
    b.onclick = () => {
      selectedSkin[selectedOp.id] = i;
      buildPlayerVisual(selectedOp.id, i);
      refreshSkinButtons();
      const info = $('menuOpInfo');
      if (info) info.textContent = selectedOp.name + ' · ' + kit.name + ' · HP ' + selectedOp.hp;
    };
    box.appendChild(b);
  });
}
opsEl.innerHTML = '';
OPS.forEach((op, i) => {
  const d = document.createElement('div');
  d.className = 'op' + (i === 0 ? ' selected' : '');
  const hpPct = Math.round((op.hp / 130) * 100);
  const spdPct = Math.round((op.speed / 1.15) * 100);
  const dmgPct = Math.round((op.dmg / 1.05) * 100);
  d.innerHTML = `<strong>${op.name}</strong>
    <span class="op-desc">${op.desc}</span>
    <div class="stat"><i>HP</i><b style="width:${hpPct}%"></b><em>${op.hp}</em></div>
    <div class="stat"><i>SPD</i><b style="width:${spdPct}%"></b><em>${op.speed.toFixed(2)}</em></div>
    <div class="stat"><i>DMG</i><b style="width:${dmgPct}%"></b><em>${op.dmg.toFixed(2)}</em></div>`;
  d.onclick = () => {
    selectedOp = op;
    opsEl.querySelectorAll('.op').forEach((e) => e.classList.remove('selected'));
    d.classList.add('selected');
    buildPlayerVisual(op.id, selectedSkin[op.id] || 0);
    refreshSkinButtons();
    const kit = currentKit();
    const info = $('menuOpInfo');
    if (info) info.textContent = op.name + ' · ' + kit.name + ' · HP ' + op.hp;
  };
  opsEl.appendChild(d);
});
refreshSkinButtons();
{
  const kit = currentKit();
  const info = $('menuOpInfo');
  if (info) info.textContent = selectedOp.name + ' · ' + kit.name + ' · HP ' + selectedO