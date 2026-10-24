    } else {
        e.mesh.position.x = r.x;
        e.mesh.position.z = r.z;
        e.mesh.position.y = 0;
      }
    }
    e.mesh.rotation.y = Math.atan2(dx, dz);
    animateZombie(e, dt);
    if (d < e.r + player.r && player.dashT <= 0 && player.vaultT <= 0) {
      player.hp -= e.dmg * dt * 1.5;
      player.hurtT = 0.12;
      if (player.hp <= 0) { player.hp = 0; endGame(); return; }
    }
  }
  for (let i = activeBullets.length - 1; i >= 0; i--) {
    const b = activeBullets[i];
    b.mesh.position.x += b.vx * dt;
    b.mesh.position.z += b.vz * dt;
    b.life -= dt;
    let hit = false;
    for (let j = activeEnemies.length - 1; j >= 0; j--) {
      const e = activeEnemies[j];
      const dx = b.mesh.position.x - e.mesh.position.x;
      const dz = b.mesh.position.z - e.mesh.position.z;
      if (dx * dx + dz * dz < (e.r + 0.2) * (e.r + 0.2)) {
        e.hp -= b.dmg; e.hitT = 0.12; hit = true;
        if (e.hp <= 0) killEnemy(e, j);
        break;
      }
    }
    if (hit || b.life <= 0) releaseBullet(b, i);
  }
  for (let i = activeXp.length - 1; i >= 0; i--) {
    const o = activeXp[i];
    const dx = player.x - o.mesh.position.x;
    const dz = player.z - o.mesh.position.z;
    const d = Math.hypot(dx, dz);
    o.mesh.rotation.y += dt * 3;
    o.mesh.position.y = 0.35 + Math.sin(time * 4 + i) * 0.08;
    if (d < player.magnet) {
      o.v = Math.min(14, o.v + 18 * dt);
      o.mesh.position.x += (dx / (d || 1)) * o.v * dt;
      o.mesh.position.z += (dz / (d || 1)) * o.v * dt;
    }
    if (d < player.r + 0.5) {
      player.xp += 1;
      releaseXp(o, i);
      if (player.xp >= player.xpNeed) levelUp();
    }
  }
  camTarget.x += (player.x - camTarget.x) * Math.min(1, 5 * dt);
  camTarget.z += (player.z - camTarget.z) * Math.min(1, 5 * dt);
  camera.position.x = camTarget.x + camOffset.x;
  camera.position.y = camOffset.y;
  camera.position.z = camTarget.z + camOffset.z;
  camera.lookAt(camTarget.x, 0.6, camTarget.z);
  updateHud();
}
function onResize() {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', onResize);
onResize();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  if (running) update(dt);
  else if (menuPreview) {
    // character showcase in main menu
    playerRoot.position.set(3.2, 0, 0);
    playerRoot.rotation.y = now * 0.0012;
    player.moveAmt = 0.35;
    player.y = 0;
    animatePlayer(0.016);
    const ang = now * 0.0004;
    camera.position.set(3.2 + Math.sin(ang) * 4.2, 2.4, Math.cos(ang) * 4.2);
    camera.lookAt(3.2, 1.1, 0);
  } else if (!gameOver) {
    camera.position.x = Math.sin(now * 0.00025) * 10;
    camera.position.z = 16 + Math.cos(now * 0.00025) * 5;
    camera.position.y = 14;
    camera.lookAt(0, 0.5, 0);
  }
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);
}
raf = requestAnimationFrame(frame);
