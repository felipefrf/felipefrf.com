// The olympiad medals, rendered live from the Blender models (3d/medal_glb.py):
// transparent over the card, a slow turn, and drag to spin them yourself.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export function startMedal(canvas: HTMLCanvasElement, url: string, reduced: boolean) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.02).texture;
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(-5, 2.5, 2.5);
  const rim = new THREE.DirectionalLight(0xffd2b0, 1.4);
  rim.position.set(4, -1, -3);
  scene.add(key, rim);

  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
  camera.position.set(0, 0.42, 6.9);
  camera.lookAt(0, 0.42, 0);

  const pivot = new THREE.Group();
  scene.add(pivot);

  const size = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  size();
  new ResizeObserver(size).observe(canvas);

  // rotation state: a gentle idle turn, plus whatever the pointer adds
  let angle = -0.5;
  let vel = 0;
  const idle = reduced ? 0 : 0.55; // rad/s
  let dragging = false;
  let lastX = 0;
  let lastT = 0;
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX;
    lastT = performance.now();
    vel = 0;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = (e.clientX - lastX) * 0.012;
    angle += dx;
    vel = dx / Math.max(0.008, (now - lastT) / 1000);
    lastX = e.clientX;
    lastT = now;
    if (!running) draw();
  });
  const up = () => (dragging = false);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);

  const draw = () => renderer.render(scene, camera);

  let running = false;
  let last = 0;
  let tilt = 0.1;
  const frame = (now: number) => {
    if (!running) return;
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;
    if (!dragging) {
      vel *= Math.pow(0.04, dt); // inertia that settles in about a second
      angle += (idle + vel) * dt;
    }
    pivot.rotation.y = angle;
    pivot.rotation.x = tilt + Math.sin(now / 2400) * 0.04;
    pivot.position.y = Math.sin(now / 1800) * 0.03;
    draw();
    requestAnimationFrame(frame);
  };
  const play = () => {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  };
  const pause = () => (running = false);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(url, (g) => {
    const m = g.scene;
    // Blender is z-up and the disc faces +z there; glTF turned that into +y,
    // so stand it back up facing the camera
    m.rotation.x = Math.PI / 2;
    pivot.add(m);
    m.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        const mm = mesh.material as THREE.MeshStandardMaterial;
        mm.envMapIntensity = 0.85;
        if (mm.map) mm.side = THREE.DoubleSide;
      }
    });
    canvas.classList.add('ready');
    pivot.rotation.y = angle;
    pivot.rotation.x = tilt;
    draw();
    new IntersectionObserver((es) => (es[0].isIntersecting && !reduced ? play() : pause()), { rootMargin: '80px' }).observe(canvas);
  });
}
