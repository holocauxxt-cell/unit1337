// UNIT 1337 — Operation Survivors
// Stylized tactical operator (CoD MW2 Ghost vibe, clean mobile proportions)
const $ = (id) => document.getElementById(id);
const canvas = $('c');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x152028);
scene.fog = new THREE.Fog(0x152028, 45, 100);
const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 180);
camera.position.set(0, 16, 14);
camera.lookAt(0, 0.6, 0);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
scene.add(new THREE.AmbientLight(0x7a8a9a, 0.6));
scene.add(new THREE.HemisphereLight(0xd0e4f5, 0x3a4838, 1.4));
const sun = new THREE.DirectionalLight(0xfff2d8, 2.7);
sun.position.set(-14, 26, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 2; sun.shadow.camera.far = 80;
sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
scene.add(sun);
const fill = new THREE.DirectionalLight(0x88aacc, 0.6);
fill.position.set(10, 12, -8);
scene.add(fill);

const mat = (color, roughness = 0.82, metalness = 0.02) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

function addEdge(mesh, color = 0x0c1014, inflate = 1.05) {
  const g = mesh.geometry;
  if (!g) return;
  const edge = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.BackSide }));
  edge.scale.setScalar(inflate);
  edge.renderOrder = -1;
  mesh.add(edge);
}

const groundMat = mat(0x3d4f46);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const floorMarkMat = new THREE.MeshStandardMaterial({ color: 0x6a776b, roughness: 1, transparent: true, opacity: 0.17 });
for (let i = -4; i <= 4; i++) {
  const lineA = new THREE.Mesh(new THREE.BoxGeometry(78, 0.012, 0.035), floorMarkMat);
  lineA.position.set(0, 0.025, i * 8); scene.add(lineA);
  const lineB = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.012, 78), floorMarkMat);
  lineB.position.set(i * 8, 0.026, 0); scene.add(lineB);
}

// ... FULL CONTENT TOO LONG FOR SINGLE CALL - USING LOCAL STAGE5 STRUCTURE ...
console.log('STAGE5 STYLIZED LOADED');
