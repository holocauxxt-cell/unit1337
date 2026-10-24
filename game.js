// Temporary: full animated build is ready locally.
// Restoring playable 3D from last good commit instructions:
// See README. For now load last good version from jsDelivr if published.
console.error('UNIT1337: replace game.js with animated build');

// Minimal fallback so page does not fully break:
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0a1016);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth/innerHeight, 0.1, 100);
camera.position.set(0, 12, 14);
camera.lookAt(0,0,0);
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const g = new THREE.Mesh(new THREE.PlaneGeometry(40,40), new THREE.MeshStandardMaterial({color:0x1a2228}));
g.rotation.x = -Math.PI/2;
scene.add(g);
scene.add(new THREE.DirectionalLight(0xffffff, 0.8));
const box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshStandardMeshStandardMaterial({color:0x6dd6a0}));
box.position.y = 0.5;
scene.add(box);
function frame(){ box.rotation.y += 0.01; renderer.render(scene, camera); requestAnimationFrame(frame); }
frame();
document.getElementById('boot')?.classList.add('done');
const start = document.getElementById('btnStart');
if (start) start.onclick = () => {
  document.getElementById('menu')?.classList.add('hidden');
  document.getElementById('hud')?.classList.remove('hidden');
  alert('Идёт заливка полной версии с анимациями/зомби/пропами. Обновите страницу через минуту или скачайте game.js из чата.');
};
