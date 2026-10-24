crateTex = makeTex((g, s) => {
  g.fillStyle = '#5a4030';
  g.fillRect(0, 0, s, s);
  g.strokeStyle = '#3a2818';
  g.lineWidth = 6;
  for (let i = 0; i <= s; i += s / 4) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, s); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(s, i); g.stroke();
  }
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(0, 0, s, 8);
  g.fillRect(0, s - 8, s, 8);
}, 128);
const metalTex = makeTex((g, s) => {
  g.fillStyle = '#3a4550';
  g.fillRect(0, 0, s, s);
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(${40 + Math.random() * 40},${50 + Math.random() * 40},${55 + Math.random() * 40},0.4)`;
    g.fillRect(Math.random() * s, Math.random() * s, 2 + Math.random() * 20, 1 + Math.random() * 3);
  }
}, 128);
const wallTex = makeTex((g, s) => {
  g.fillStyle = '#243028';
  g.fillRect(0, 0, s, s);
  for (let y = 0; y < s; y += 16) {
    for (let x = 0; x < s; x += 32) {
      const ox = (y / 16) % 2 === 0 ? 0 : 16;
      g.fillStyle = `rgb(${30 + Math.random() * 15},${40 + Math.random() * 18},${34 + Math.random() * 12})`;
      g.fillRect(x + ox, y, 30, 14);
      g.strokeStyle = '#1a2018';
      g.strokeRect(x + ox, y, 30, 14);
    }
  }
}, 256);
wallTex.repeat.set(8, 1);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0x0c141c, 1);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0c141c, 28, 72);
const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.2, 120);
const camOffset = new THREE.Vector3(0, 20, 15);
camera.position.copy(camOffset);
scene.add(new THREE.AmbientLight(0x8aa0b0, 0.85));
const sun = new THREE.DirectionalLight(0xe8f0f8, 1.45);
sun.position.set(14, 32, 10);
scene.add(sun);
const fill = new THREE.DirectionalLight(0xb8d0e0, 0.55);
fill.position.set(-16, 18, -8);
scene.add(fill);
const rim = new THREE.DirectionalLight(0x6aaca0, 0.5);
rim.position.set(-10, 10, -14);
scene.add(rim);
scene.add(new THREE.HemisphereLight(0xa8c8e0, 0x2a3020, 0.6));
// subtle global fill so dark corners stay readable
const topFill = new THREE.DirectionalLight(0xd0e0f0, 0.35);
topFill.position.set(0, 40, 0);
scene.add(topFill);
const groundMat = new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95, metalness: 0.05, color: 0x99aaab });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD, WORLD), groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9, metalness: 0.05, color: 0xb8c8d0 });
function addWall(w, d, x, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.6, d), wallMat);
  m.position.set(x, 0.8, z);
  scene.add(m);
}
addWall(WORLD + 1, 0.7, 0, -HALF);
addWall(WORLD + 1, 0.7, 0, HALF);
addWall(0.7, WORLD + 1, -HALF, 0);
addWall(0.7, WORLD + 1, HALF, 0);
const crateMat 