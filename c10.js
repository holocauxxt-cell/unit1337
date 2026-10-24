'pointercancel', endJoy);
let lastTap = 0;
canvas.addEventListener('pointerup', () => {
  if (!running || paused) return;
  const now = performance.now();
  if (now - lastTap < 280) tryDash();
  lastTap = now;
});
window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (e.code === 'Space') { e.preventDefault(); tryDash(); }
  if (e.code === 'Escape' && running) togglePause();
});
window.addEventListener('keyup', (e) => keys.delete(e.code));
$('btnDash').onclick = () => tryDash();
$('btnPause').onclick = () => togglePause();
$('btnStart').onclick = () => startGame();
$('btnRetry').onclick = () => startGame();
$('btnMenu').onclick = () => goMainMenu();
$('btnResume')?.addEventListener('click', () => resumeGame());
$('btnRestart')?.addEventListener('click', () => startGame());
$('btnPauseMenu')?.addEventListener('click', () => goMainMenu());
function updatePauseStats() {
  const el = $('pauseStats');
  if (!el) return;
  const m = (time / 60) | 0, s = (time % 60) | 0;
  el.innerHTML = `Оператор: <b>${selectedOp.name}</b><br>
    Время ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} · Убийства ${kills} · Уровень ${player.level}<br>
    HP ${Math.max(0, player.hp|0)}/${player.maxHp} · DIFF ${difficulty().toFixed(1)}x`;
}
function setPauseUI(on) {
  paused = on;
  const p = $('pause');
  if (p) p.classList.toggle('hidden', !on);
  $('btnPause').textContent = on ? '▶' : 'Ⅱ';
  if (on) {
    updatePauseStats();
    joyHide();
  }
}
function togglePause() {
  if (gameOver || !running) return;
  setPauseUI(!paused);
}
function resumeGame() {
  if (!running || gameOver) return;
  setPauseUI(false);
  last = performance.now();
}
function goMainMenu() {
  running = false;
  paused = false;
  gameOver = false;
  menuPreview = true;
  cancelAnimationFrame(raf);
  clearWorld();
  $('pause')?.classList.add('hidden');
  $('over').classList.add('hidden');
  $('levelup').classList.add('hidden');
  $('hud').classList.add('hidden');
  $('menu').classList.remove('hidden');
  $('btnPause').textContent = 'Ⅱ';
  player.x = 0; player.z = 0; player.y = 0;
  playerRoot.position.set(0, 0, 0);
  buildPlayerVisual(selectedOp.id, selectedSkin[selectedOp.id] || 0);
  raf = requestAnimationFrame(frame);
}
function tryDash() {
  if (!running || paused || gameOver) return;
  if (player.dashCd > 0 || player.dashT > 0) return;
  let dx = joy.x, dz = joy.y;
  if (keys.has('KeyW') || keys.has('ArrowUp')) dz -= 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) dz += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
  const len = Math.hypot(dx, dz);
  if (len < 0.1) { dx = Math.sin(player.faceAngle); dz = Math.cos(player.faceAngle); }
  else { dx /= len; dz /= len; }
  player.dashDirX = dx; player.dashDirZ = dz;
  player.dashT = 0.18; player.dashCd = player.dashCdMax;
}
function startGame() {
  buildPlayerVisual(selectedOp.id, selectedSkin[selectedOp.id] || 0);
  menuPreview = false;
  resetRun();
  running = true;
  paused = false;
  $('menu').classList.add('hid