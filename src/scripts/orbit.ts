// Hero: a live orbital simulation. Three spacecraft are integrated with RK4
// under Earth's gravity plus the J2 oblateness term, in kilometres and seconds,
// and drawn over a dotted Earth that turns at its real rate (time-warped).
// The lead spacecraft is Matsumoto-2, the SAR satellite my ITA team designed,
// modelled in Blender (3d/satellite.py) and loaded as glTF.
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const MU = 398600.4418; // km^3/s^2
const RE = 6378.137; // km
const J2 = 1.08263e-3;
const OMEGA_E = 7.2921159e-5; // rad/s
const D2R = Math.PI / 180;

type Vec = [number, number, number];
type State = { r: Vec; v: Vec };

function accel(r: Vec): Vec {
  const [x, y, z] = r;
  const r2 = x * x + y * y + z * z;
  const rn = Math.sqrt(r2);
  const k = -MU / (r2 * rn);
  const j = 1.5 * J2 * (RE * RE) / r2;
  const zz = (z * z) / r2;
  return [k * x * (1 + j * (1 - 5 * zz)), k * y * (1 + j * (1 - 5 * zz)), k * z * (1 + j * (3 - 5 * zz))];
}

function rk4(s: State, h: number): State {
  const add = (a: Vec, b: Vec, f: number): Vec => [a[0] + b[0] * f, a[1] + b[1] * f, a[2] + b[2] * f];
  const k1v = accel(s.r), k1r = s.v;
  const k2v = accel(add(s.r, k1r, h / 2)), k2r = add(s.v, k1v, h / 2);
  const k3v = accel(add(s.r, k2r, h / 2)), k3r = add(s.v, k2v, h / 2);
  const k4v = accel(add(s.r, k3r, h)), k4r = add(s.v, k3v, h);
  const r: Vec = [0, 0, 0], v: Vec = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    r[i] = s.r[i] + (h / 6) * (k1r[i] + 2 * k2r[i] + 2 * k3r[i] + k4r[i]);
    v[i] = s.v[i] + (h / 6) * (k1v[i] + 2 * k2v[i] + 2 * k3v[i] + k4v[i]);
  }
  return { r, v };
}

// Classical elements → ECI state (km, km/s).
function fromElements(a: number, e: number, inc: number, raan: number, argp: number, nu: number): State {
  const p = a * (1 - e * e);
  const rpf = p / (1 + e * Math.cos(nu));
  const rP: Vec = [rpf * Math.cos(nu), rpf * Math.sin(nu), 0];
  const vk = Math.sqrt(MU / p);
  const vP: Vec = [-vk * Math.sin(nu), vk * (e + Math.cos(nu)), 0];
  const [cO, sO, ci, si, cw, sw] = [Math.cos(raan), Math.sin(raan), Math.cos(inc), Math.sin(inc), Math.cos(argp), Math.sin(argp)];
  const R = [
    [cO * cw - sO * sw * ci, -cO * sw - sO * cw * ci, sO * si],
    [sO * cw + cO * sw * ci, -sO * sw + cO * cw * ci, -cO * si],
    [sw * si, cw * si, ci],
  ];
  const m = (u: Vec): Vec => [0, 1, 2].map((i) => R[i][0] * u[0] + R[i][1] * u[1] + R[i][2] * u[2]) as Vec;
  return { r: m(rP), v: m(vP) };
}

// ECI km → scene units (Earth radius = 1, three.js is y-up).
const toScene = (r: Vec, out: THREE.Vector3) => out.set(r[0] / RE, r[2] / RE, -r[1] / RE);

type Craft = {
  name: string;
  s: State;
  color: THREE.Color;
  trail: Float32Array;
  trailColors: Float32Array;
  head: number;
  count: number;
  line: THREE.Line;
  dot?: THREE.Mesh;
  period: number;
};

export type Telemetry = { t: number; alt: number; vel: number; lat: number; lon: number; orbit: number; inc: number };

export function startOrbit(
  canvas: HTMLCanvasElement,
  opts: { reduced: boolean; onTelemetry?: (t: Telemetry) => void; label?: HTMLElement | null; host: HTMLElement },
) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 200);
  const world = new THREE.Group(); // dragged by the visitor
  scene.add(world);
  world.rotation.x = 0.32;
  world.rotation.y = -0.6;

  const sunDir = new THREE.Vector3(-0.55, 0.35, 0.75).normalize();
  const sun = new THREE.DirectionalLight(0xffffff, 3.2);
  sun.position.copy(sunDir).multiplyScalar(10);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x8899bb, 0.25));

  // ---- Earth: dark core, dotted continents, latitude rings, atmosphere ----
  const earth = new THREE.Group();
  world.add(earth);
  earth.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.995, 96, 64),
      new THREE.MeshBasicMaterial({ color: 0x07080b }),
    ),
  );

  const dotMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uSun: { value: sunDir }, uPx: { value: renderer.getPixelRatio() }, uScale: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform vec3 uSun; uniform float uPx; uniform float uScale;
      varying float vLight; varying float vFacing;
      void main() {
        vec3 n = normalize((modelMatrix * vec4(position, 0.0)).xyz);
        vLight = smoothstep(-0.25, 0.45, dot(n, uSun));
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vFacing = dot(normalize(normalMatrix * position), normalize(-mv.xyz));
        gl_PointSize = uPx * uScale * 2.6 * (3.6 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vLight; varying float vFacing;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.2, d);
        vec3 day = vec3(0.93, 0.94, 0.96);
        vec3 night = vec3(0.16, 0.18, 0.24);
        vec3 col = mix(night, day, vLight);
        a *= smoothstep(-0.05, 0.25, vFacing);
        gl_FragColor = vec4(col, a * mix(0.55, 0.95, vLight));
      }`,
  });

  const grid = new THREE.Group();
  earth.add(grid);
  const ringMat = new THREE.LineBasicMaterial({ color: 0x2a2f3a, transparent: true, opacity: 0.55 });
  for (let lat = -60; lat <= 60; lat += 30) {
    const pts: THREE.Vector3[] = [];
    const r = Math.cos(lat * D2R) * 1.002, y = Math.sin(lat * D2R) * 1.002;
    for (let k = 0; k <= 128; k++) pts.push(new THREE.Vector3(r * Math.cos((k / 128) * Math.PI * 2), y, r * Math.sin((k / 128) * Math.PI * 2)));
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat));
  }
  for (let lon = 0; lon < 180; lon += 30) {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= 128; k++) {
      const a = (k / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * Math.cos(lon * D2R), Math.sin(a), Math.cos(a) * Math.sin(lon * D2R)).multiplyScalar(1.002));
    }
    grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat));
  }

  const llToVec = (lat: number, lon: number, r = 1.004) => {
    const la = lat * D2R, lo = lon * D2R;
    // ECEF (x toward lon 0, z north) → scene (y up)
    return new THREE.Vector3(r * Math.cos(la) * Math.cos(lo), r * Math.sin(la), -r * Math.cos(la) * Math.sin(lo));
  };

  fetch('/3d/land.bin')
    .then((r) => r.arrayBuffer())
    .then((buf) => {
      const a = new Int16Array(buf);
      const pos = new Float32Array((a.length / 2) * 3);
      for (let i = 0; i < a.length / 2; i++) {
        const v = llToVec(a[2 * i] / 100, a[2 * i + 1] / 100);
        pos.set([v.x, v.y, v.z], i * 3);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      earth.add(new THREE.Points(g, dotMat));
    })
    .catch(() => {});

  // São José dos Campos (ITA) beacon
  const ita = new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff5a1f }));
  ita.position.copy(llToVec(-23.21, -45.87, 1.006));
  earth.add(ita);
  const itaRing = new THREE.Mesh(
    new THREE.RingGeometry(0.02, 0.026, 48),
    new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
  );
  itaRing.position.copy(ita.position);
  itaRing.lookAt(ita.position.clone().multiplyScalar(2));
  earth.add(itaRing);

  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 96, 64),
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uSun: { value: sunDir } },
      vertexShader: /* glsl */ `
        varying vec3 vN; varying vec3 vW;
        void main() { vN = normalize(normalMatrix * normal); vW = normalize((modelMatrix * vec4(position,0.)).xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uSun; varying vec3 vN; varying vec3 vW;
        void main() {
          float i = pow(max(0.0, 0.62 - dot(vN, vec3(0., 0., 1.))), 5.0);
          float lit = smoothstep(-0.5, 0.7, dot(vW, uSun));
          vec3 col = mix(vec3(0.25, 0.30, 0.55), vec3(0.62, 0.74, 1.0), lit);
          gl_FragColor = vec4(col, 1.0) * i * (0.9 + 1.6 * lit);
        }`,
    }),
  );
  atmo.scale.setScalar(1.13);
  world.add(atmo);

  // stars
  {
    const n = 1400, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(40 + Math.random() * 40);
      p.set([v.x, v.y, v.z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9aa3b5, size: 0.09, sizeAttenuation: true, transparent: true, opacity: 0.55 })));
  }

  // ---- spacecraft ----
  const TRAIL = 520;
  const crafts: Craft[] = [];
  const mkCraft = (name: string, s: State, hex: number, withDot: boolean): Craft => {
    const trail = new Float32Array(TRAIL * 3);
    const trailColors = new Float32Array(TRAIL * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(trail, 3));
    g.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
    g.setDrawRange(0, 0);
    const line = new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    world.add(line);
    const rn = Math.hypot(...s.r), vn = Math.hypot(...s.v);
    const a = 1 / (2 / rn - (vn * vn) / MU);
    const c: Craft = { name, s, color: new THREE.Color(hex), trail, trailColors, head: 0, count: 0, line, period: 2 * Math.PI * Math.sqrt((a * a * a) / MU) };
    if (withDot) {
      c.dot = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 12), new THREE.MeshBasicMaterial({ color: hex }));
      world.add(c.dot);
    }
    // faint full orbit ring, propagated one period ahead
    const ring: THREE.Vector3[] = [];
    let st = s;
    const steps = 360, h = c.period / steps;
    for (let k = 0; k <= steps; k++) {
      ring.push(toScene(st.r, new THREE.Vector3()));
      st = rk4(st, h);
    }
    const rl = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ring),
      new THREE.LineDashedMaterial({ color: hex, transparent: true, opacity: 0.22, dashSize: 0.02, gapSize: 0.025, depthWrite: false }),
    );
    rl.computeLineDistances();
    world.add(rl);
    crafts.push(c);
    return c;
  };

  // Matsumoto-2: sun-synchronous, 620 km, i = 97.8°
  const m2 = mkCraft('MATSUMOTO-2', fromElements(RE + 620, 0.001, 97.8 * D2R, 40 * D2R, 0, 300 * D2R), 0xff5a1f, false);
  // a space-station-like orbit, 420 km at 51.6°
  mkCraft('LEO', fromElements(RE + 420, 0.0005, 51.6 * D2R, 200 * D2R, 0, 20 * D2R), 0x9fb4ff, true);
  // a highly elliptical orbit: watch it race through perigee and crawl at apogee (Kepler II)
  mkCraft('HEO', fromElements(RE * 2.45, 0.56, 63.4 * D2R, 290 * D2R, 270 * D2R, 160 * D2R), 0xe9e4d8, true);

  // ground track of Matsumoto-2, in the Earth-fixed frame so it turns with the planet
  const GT = 700;
  const gtPos = new Float32Array(GT * 3);
  const gtGeo = new THREE.BufferGeometry();
  gtGeo.setAttribute('position', new THREE.BufferAttribute(gtPos, 3));
  gtGeo.setDrawRange(0, 0);
  earth.add(new THREE.Points(gtGeo, new THREE.PointsMaterial({ color: 0xff5a1f, size: 0.012, transparent: true, opacity: 0.75, depthWrite: false })));
  let gtCount = 0, gtHead = 0, gtClock = 0;

  // the satellite model and its side-looking radar swath
  const sat = new THREE.Group();
  world.add(sat);
  const beam = new THREE.Mesh(
    new THREE.ConeGeometry(0.035, 0.1, 32, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xff5a1f, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
  );
  beam.geometry.translate(0, -0.05, 0); // apex at the satellite, opening toward Earth
  const beamPivot = new THREE.Group();
  beamPivot.add(beam);
  beamPivot.rotation.x = 0.5; // ~30° off nadir, to one side
  sat.add(beamPivot);
  // fallback marker until the model arrives
  const satDot = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 12), new THREE.MeshBasicMaterial({ color: 0xff5a1f }));
  sat.add(satDot);
  new GLTFLoader().load(
    '/3d/satellite.glb',
    (gltf) => {
      const m = gltf.scene;
      m.scale.setScalar(0.0115);
      sat.add(m);
      satDot.visible = false;
    },
    undefined,
    () => {},
  );

  // ---- simulation clock ----
  const WARP = 420; // sim seconds per real second
  let simT = 0;
  let theta = 0; // Earth rotation angle
  let orbits = 0;
  let lastNuSign = 0;

  const tmp = new THREE.Vector3();
  const vtmp = new THREE.Vector3();
  const pushTrail = (c: Craft) => {
    toScene(c.s.r, tmp);
    c.trail.copyWithin(3, 0, (TRAIL - 1) * 3);
    c.trail[0] = tmp.x; c.trail[1] = tmp.y; c.trail[2] = tmp.z;
    c.count = Math.min(TRAIL, c.count + 1);
  };
  const paintTrail = (c: Craft) => {
    for (let i = 0; i < c.count; i++) {
      const f = Math.pow(1 - i / c.count, 1.6);
      c.trailColors[i * 3] = c.color.r * f;
      c.trailColors[i * 3 + 1] = c.color.g * f;
      c.trailColors[i * 3 + 2] = c.color.b * f;
    }
    const g = c.line.geometry;
    g.setDrawRange(0, c.count);
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
  };

  let trailClock = 0;
  const step = (simDt: number) => {
    const H = 6;
    let left = simDt;
    while (left > 0) {
      const h = Math.min(H, left);
      for (const c of crafts) c.s = rk4(c.s, h);
      left -= h;
      simT += h;
      trailClock += h;
      gtClock += h;
      if (trailClock >= 14) {
        trailClock = 0;
        for (const c of crafts) pushTrail(c);
      }
      if (gtClock >= 22) {
        gtClock = 0;
        const [x, y, z] = m2.s.r;
        const rn = Math.hypot(x, y, z);
        const lat = Math.asin(z / rn) / D2R;
        const lon = (Math.atan2(y, x) - theta) / D2R;
        const v = llToVec(lat, lon, 1.006);
        gtPos.set([v.x, v.y, v.z], gtHead * 3);
        gtHead = (gtHead + 1) % GT;
        gtCount = Math.min(GT, gtCount + 1);
        gtGeo.setDrawRange(0, gtCount);
        gtGeo.attributes.position.needsUpdate = true;
      }
      // count orbits by ascending-node crossings
      const sgn = Math.sign(m2.s.r[2]);
      if (lastNuSign < 0 && sgn > 0) orbits++;
      lastNuSign = sgn;
    }
    theta = (theta + OMEGA_E * simDt) % (Math.PI * 2);
    earth.rotation.y = theta;
  };

  // warm up so trails exist on first paint
  for (let i = 0; i < 160; i++) step(14);
  for (const c of crafts) paintTrail(c);

  // ---- layout ----
  let W = 1, Hh = 1, wide = true;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    Hh = Math.max(1, r.height);
    wide = W > 900;
    renderer.setSize(W, Hh, false);
    camera.aspect = W / Hh;
    camera.clearViewOffset();
    if (wide) camera.setViewOffset(W, Hh, -W * 0.19, -Hh * 0.02, W, Hh);
    camera.updateProjectionMatrix();
    dotMat.uniforms.uScale.value = Math.min(1.4, Math.max(0.8, Hh / 820));
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ---- interaction: drag to turn the world, with inertia ----
  let dragging = false, px = 0, py = 0, vx = 0, vy = 0;
  const targetTilt = { x: 0.32 };
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; px = e.clientX; py = e.clientY;
    canvas.setPointerCapture(e.pointerId);
    opts.host.classList.add('grabbing');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - px, dy = e.clientY - py;
    px = e.clientX; py = e.clientY;
    vx = dx * 0.005; vy = dy * 0.003;
    world.rotation.y += vx;
    targetTilt.x = THREE.MathUtils.clamp(targetTilt.x + vy, -0.6, 0.9);
  });
  const end = () => { dragging = false; opts.host.classList.remove('grabbing'); };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  // ---- scroll: dolly toward the satellite as the hero leaves ----
  let scrollP = 0;
  const onScroll = () => {
    const r = opts.host.getBoundingClientRect();
    scrollP = THREE.MathUtils.clamp(-r.top / Math.max(1, r.height), 0, 1);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- frame ----
  const camBase = new THREE.Vector3(0, 0.2, 7.6);
  const camZ = () => (wide ? 7.6 : 6.6);
  const satPos = new THREE.Vector3();
  const xAxis = new THREE.Vector3(), yAxis = new THREE.Vector3(), zAxis = new THREE.Vector3();
  const basis = new THREE.Matrix4();
  let last = performance.now();
  let telClock = 0;
  let visible = true;
  let raf = 0;

  const frame = (now: number) => {
    // rAF timestamps can predate `last` on the first frame; never step backwards
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000));
    last = now;
    if (!opts.reduced) step(dt * WARP);

    if (!dragging) {
      world.rotation.y += vx + (opts.reduced ? 0 : 0.0006);
      vx *= 0.94;
    }
    world.rotation.x += (targetTilt.x - world.rotation.x) * 0.08;

    for (const c of crafts) {
      if (c.dot) toScene(c.s.r, c.dot.position);
    }
    if (trailClock === 0) for (const c of crafts) paintTrail(c);

    // satellite pose: +X along track, +Y away from Earth (radar looks down)
    toScene(m2.s.r, satPos);
    sat.position.copy(satPos);
    yAxis.copy(satPos).normalize();
    toScene(m2.s.v, vtmp);
    xAxis.copy(vtmp).addScaledVector(yAxis, -vtmp.dot(yAxis)).normalize();
    zAxis.crossVectors(xAxis, yAxis);
    basis.makeBasis(xAxis, yAxis, zAxis);
    sat.quaternion.setFromRotationMatrix(basis);

    itaRing.scale.setScalar(1 + ((now / 1600) % 1) * 1.6);
    (itaRing.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - ((now / 1600) % 1));

    // camera: dolly in on scroll
    const s = scrollP;
    camera.position.set(camBase.x, camBase.y + s * 0.5, camZ() - s * 3.2);
    camera.lookAt(0, s * 0.25, 0);

    renderer.render(scene, camera);

    // label follows the satellite
    if (opts.label) {
      const p = sat.getWorldPosition(tmp).project(camera);
      const behind = sat.getWorldPosition(new THREE.Vector3()).applyMatrix4(camera.matrixWorldInverse).z > 0;
      const occluded = (() => {
        const sp = sat.getWorldPosition(new THREE.Vector3());
        const toCam = camera.position.clone().sub(sp);
        // ray from satellite to camera hits the Earth sphere?
        const b = sp.dot(toCam.clone().normalize());
        const c = sp.lengthSq() - 1;
        return b < 0 && b * b - c > 0;
      })();
      const x = (p.x * 0.5 + 0.5) * W, y = (-p.y * 0.5 + 0.5) * Hh;
      opts.label.style.transform = `translate3d(${(x + canvas.offsetLeft).toFixed(1)}px, ${(y + canvas.offsetTop).toFixed(1)}px, 0)`;
      opts.label.classList.toggle('hidden', behind || occluded);
    }

    telClock += dt;
    if (opts.onTelemetry && (telClock > 0.1 || opts.reduced)) {
      telClock = 0;
      const [x, y, z] = m2.s.r;
      const rn = Math.hypot(x, y, z);
      let lon = (Math.atan2(y, x) - theta) / D2R;
      lon = ((lon + 540) % 360) - 180;
      const h = [y * m2.s.v[2] - z * m2.s.v[1], z * m2.s.v[0] - x * m2.s.v[2], x * m2.s.v[1] - y * m2.s.v[0]];
      const inc = Math.acos(h[2] / Math.hypot(...h)) / D2R;
      opts.onTelemetry({ t: simT, alt: rn - RE, vel: Math.hypot(...m2.s.v), lat: Math.asin(z / rn) / D2R, lon, orbit: orbits + 1, inc });
    }

    if (visible && !opts.reduced) raf = requestAnimationFrame(frame);
  };

  const vis = new IntersectionObserver(([e]) => {
    const was = visible;
    visible = e.isIntersecting;
    if (visible && !was && !opts.reduced) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  });
  vis.observe(opts.host);
  raf = requestAnimationFrame(frame);
  if (opts.reduced) {
    // one still frame; redraw when the model and land data arrive
    setTimeout(() => requestAnimationFrame(frame), 600);
    setTimeout(() => requestAnimationFrame(frame), 1800);
  }
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    vis.disconnect();
    renderer.dispose();
  };
}
