// UNIT 1337 — Operation Survivors
// STAGE1: visual operator overhaul — anatomy, Ghost mask, distinct stances
const $ = (id) => document.getElementById(id);
const canvas = $('c');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x152028);
scene.fog = new THREE.Fog(0x152028, 45, 100);
const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 180);
camera.position.set(0, 19.5, 15.5);
camera.lookAt(0, 0.4, 0);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
scene.add(new THREE.AmbientLight(0x7a8a9a, 0.55));
scene.add(new THREE.HemisphereLight(0xd0e4f5, 0x3a4838, 1.35));
const sun = new THREE.DirectionalLight(0xfff2d8, 2.6);
sun.position.set(-14, 26, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.near = 2; sun.shadow.camera.far = 80;
sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
scene.add(sun);
const fill = new THREE.DirectionalLight(0x88aacc, 0.55);
fill.position.set(10, 12, -8);
scene.add(fill);

// PLACEHOLDER - full content will be restored via chunk method if this truncates
console.log('STAGE1 OPERATOR OVERHAUL');
