/* Particle TV (Three.js): TV static → EMV logo → giant retro TV.
   All three shapes live in one point cloud; uniforms uA / uB morph between them. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { TV_TELA } from './config.js';

const BARS = ['#1f6bff', '#00a8ff', '#2edb4b', '#a8f03a', '#f2f4f5', '#00a8ff', '#2edb4b'].map(h => new THREE.Color(h));
const BODY = new THREE.Color(0.80, 0.87, 0.94), EDGE = new THREE.Color(0.92, 0.95, 1), WOOD = new THREE.Color(0.75, 0.62, 0.45);
const R = (a, b) => a + Math.random() * (b - a);
const MAIN_TIP = [-1.75, 6.9, .1];   // tip of the main antenna (TV model units)

/* ---------- retro TV point model (units ≈ metres, floor at y=0) ---------- */
function buildTV(q) {
  const pos = [], col = [], alp = [], screen = [];   // screen: [pointIndex, u, v] for the CRT picture
  const add = (x, y, z, c, a) => { pos.push(x, y, z); col.push(c.r, c.g, c.b); alp.push(a); };
  const n = (k) => Math.round(k * q);
  const X0 = -2.3, X1 = 2.3, Y0 = 2.0, Y1 = 5.3, Z0 = -1.6, Z1 = 1.0;

  for (let i = 0; i < n(6000); i++) add(R(X0, X1), Y1, R(Z0, Z1), BODY, .32);
  for (let i = 0; i < n(2500); i++) add(R(X0, X1), Y0, R(Z0, Z1), BODY, .22);
  for (let i = 0; i < n(5000); i++) add(X0, R(Y0, Y1), R(Z0, Z1), BODY, .28);
  for (let i = 0; i < n(5000); i++) add(X1, R(Y0, Y1), R(Z0, Z1), BODY, .28);
  for (let i = 0; i < n(2000); i++) add(R(X0, X1), R(Y0, Y1), Z0, BODY, .14);
  for (let i = 0; i < n(8000); i++) { const x = R(X0, X1), y = R(Y0, Y1); if (!(x > -2 && x < 1.05 && y > 2.3 && y < 5)) add(x, y, Z1, BODY, .38); }

  const edge = (a, b, k, c = EDGE, al = .95) => { for (let i = 0; i < n(k); i++) { const t = Math.random(); add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, c, al); } };
  const V = [[X0, Y0, Z0], [X1, Y0, Z0], [X1, Y1, Z0], [X0, Y1, Z0], [X0, Y0, Z1], [X1, Y0, Z1], [X1, Y1, Z1], [X0, Y1, Z1]];
  [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => edge(V[a], V[b], 800));
  edge([-2, 2.3, Z1], [1.05, 2.3, Z1], 600); edge([1.05, 2.3, Z1], [1.05, 5, Z1], 600); edge([1.05, 5, Z1], [-2, 5, Z1], 600); edge([-2, 5, Z1], [-2, 2.3, Z1], 600);

  // bulged CRT screen with colour bars
  for (let i = 0; i < n(24000); i++) {
    const u = R(-1, 1), v = R(-1, 1); if (Math.abs(u) > .94 && Math.abs(v) > .9) continue;
    screen.push([pos.length / 3, (u + 1) / 2, (1 - v) / 2]);
    add(-0.475 + u * 1.42, 3.65 + v * 1.24, Z1 + .02 + .16 * (1 - u * u * .8) * (1 - v * v * .8), BARS[Math.min(6, Math.floor((u + 1) / 2 * 7))], .9);
  }
  const disc = (cx, cy, r, k) => { for (let i = 0; i < n(k); i++) { const a = Math.random() * 6.283, rr = r * Math.sqrt(Math.random()); add(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, Z1 + .03, EDGE, .8); } };
  disc(1.65, 4.55, .22, 450); disc(1.65, 4.0, .22, 450); disc(1.65, 3.35, .3, 650);
  for (let k = 0; k < 9; k++) edge([1.3, 2.45 + k * .08, Z1 + .01], [2.0, 2.45 + k * .08, Z1 + .01], 110, EDGE, .7);
  // rabbit-ear antennas: one base on top of the cabinet (just behind the front edge, so nothing crosses the picture);
  // the main rod is long and leans back-left, the second one is short and discreet, leaning back-right.
  const rod = (a, b, k, tipR, tipK) => { edge(a, b, k, EDGE, .9); for (let i = 0; i < n(tipK); i++) add(b[0] + R(-tipR, tipR), b[1] + R(-tipR, tipR), b[2] + R(-tipR, tipR), EDGE, 1); };
  const B = [-.35, Y1 + .02, .97];
  for (let i = 0; i < n(500); i++) { const a = Math.random() * 6.283, rr = Math.sqrt(Math.random()), h = Math.random();   // small dome base
    add(B[0] + Math.cos(a) * rr * .32, Y1 + h * .14 * (1 - rr * rr), B[2] + Math.sin(a) * rr * .22, EDGE, .75); }
  rod(B, MAIN_TIP, 900, .07, 110);
  rod(B, [.55, 6.3, .45], 450, .05, 60);
  const leg = (t0, b0) => { for (let i = 0; i < n(1200); i++) { const t = Math.random(), r = .09 * (1 - t * .6), a = Math.random() * 6.283;
      add(t0[0] + (b0[0] - t0[0]) * t + Math.cos(a) * r, t0[1] + (b0[1] - t0[1]) * t, t0[2] + (b0[2] - t0[2]) * t + Math.sin(a) * r, WOOD, .55); } };
  leg([-1.8, Y0, .6], [-2.3, 0, 1.2]); leg([1.8, Y0, .6], [2.3, 0, 1.2]); leg([-1.8, Y0, -1.2], [-2.2, 0, -1.9]); leg([1.8, Y0, -1.2], [2.2, 0, -1.9]);

  return { pos, col, alp, screen };
}

/* ---------- sample the logo image into points ---------- */
function sampleLogo(img) {
  const W = 760, H = 270, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, out = [];
  for (let y = 0; y < H; y += 2) for (let X = 0; X < W; X += 2) {
    const o = (y * W + X) * 4; if (d[o + 3] > 120) out.push([X / W - .5, -(y / H - .5) * (H / W), d[o] / 255, d[o + 1] / 255, d[o + 2] / 255]);
  }
  return out;
}
// LED-panel texture: the client's logo sampled on a coarse grid of square cells (one cell = one "lamp").
const LED_COLS = 76;   // finer grid = crisper, more premium LED panel
function sampleLogoGrid(img) {
  const W = 760, H = 270, cell = W / LED_COLS, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data, out = [];
  for (let gy = 0; gy * cell < H; gy++) for (let gx = 0; gx < LED_COLS; gx++) {
    let n = 0, r = 0, g = 0, b = 0, tot = 0;
    for (let sy = 0; sy < cell; sy += 2) for (let sx = 0; sx < cell; sx += 2) {
      const X = Math.floor(gx * cell + sx), Y = Math.floor(gy * cell + sy); if (Y >= H) continue; tot++;
      const o = (Y * W + X) * 4; if (d[o + 3] > 120) { n++; r += d[o]; g += d[o + 1]; b += d[o + 2]; }
    }
    if (tot && n / tot > .38) out.push([(gx + .5) / LED_COLS - .5, -(((gy + .5) * cell) / H - .5) * (H / W), r / n / 255, g / n / 255, b / n / 255]);
  }
  return out;
}

const vert = /* glsl */`
  uniform float uA, uB, uTime, uScatter, uSize, uPR, uRot, uFade, uCell, uLogoA;
  uniform vec3 uOff;
  attribute vec3 pNoise; attribute vec3 pLogo; attribute vec3 cTV; attribute vec3 cLogo; attribute vec4 aR; attribute float aAlpha;
  varying vec3 vC; varying float vA; varying float vSq;
  void main(){
    vec3 tv = position; float c = cos(uRot), s = sin(uRot);
    tv.xz = vec2(c*tv.x + s*tv.z, -s*tv.x + c*tv.z); tv += uOff;
    vec3 nz = pNoise + vec3(sin(uTime*37. + aR.x*90.), cos(uTime*29. + aR.y*90.), 0.) * .05;
    float a = smoothstep(0., 1., clamp(uA*1.35 - aR.z*.35, 0., 1.));
    float b = smoothstep(0., 1., clamp(uB*1.45 - aR.w*.45, 0., 1.));
    vec3 p = mix(mix(nz, pLogo, a), tv, b);
    // scatter: particles fly outward from the TV centre (and a bit toward the camera) so they leave the screen
    vec3 outDir = normalize(vec3(aR.x - .5, aR.y - .5, (aR.z - .5) * .6 + .35));
    p += outDir * uScatter * uScatter * 9. * (.5 + aR.w);
    float lock = a * (1. - b) * (1. - min(uScatter, 1.));   // logo formed: no drift, pixel-exact lamps
    p += vec3(sin(uTime*.8 + aR.x*20.), cos(uTime*.7 + aR.y*20.), sin(uTime*.6 + aR.z*20.)) * .012 * (1. - lock);
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    float solid = max(a, b);
    vSq = lock;   // 1 while the logo is formed → square LED cells
    gl_PointSize = mix(uSize * uPR * (.55 + aR.y*.9) * mix(.55, 1., solid) / -mv.z, uCell * uPR, vSq);
    vec3 cn = vec3(.82, .88, 1.);
    vC = mix(mix(cn, cLogo, a), cTV, b);
    float flick = fract(sin(uTime*61. + aR.x*113.) * 43758.5);
    flick = step(.55, flick) * (.25 + .5 * aR.z);            // sparse TV snow
    vA = uFade * mix(mix(flick, uLogoA, a), aAlpha, b);   // many particles share one LED cell, so each one is faint
  }`;
const frag = /* glsl */`
  varying vec3 vC; varying float vA; varying float vSq;
  void main(){
    vec2 q = abs(gl_PointCoord - .5); float d = length(gl_PointCoord - .5);
    float rd = smoothstep(.5, .05, d) * step(d, .5);
    float sq = step(max(q.x, q.y), .36);   // crisp square lamp with a clean dark grid gap around it
    float a = mix(rd, sq, vSq); if (a <= 0.) discard;
    gl_FragColor = vec4(vC, a * vA); }`;

export async function createTV(canvas) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  const small = matchMedia('(max-width:700px)').matches;
  const PR = Math.min(devicePixelRatio, small ? 1.6 : 2);
  renderer.setPixelRatio(PR);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 200);
  const target = new THREE.Vector3(0, 3.7, 0);

  const tv = buildTV(small ? .45 : 1);
  const N = tv.pos.length / 3;

  const img = new Image(); img.src = 'assets/logo-emv.svg';
  await img.decode().catch(() => {});
  const logo = img.naturalWidth ? sampleLogoGrid(img) : [[0, 0, 1, 1, 1]];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(tv.pos, 3));
  geo.setAttribute('cTV', new THREE.Float32BufferAttribute(tv.col, 3));
  geo.setAttribute('aAlpha', new THREE.Float32BufferAttribute(tv.alp, 1));
  const aR = new Float32Array(N * 4); for (let i = 0; i < aR.length; i++) aR[i] = Math.random();
  geo.setAttribute('aR', new THREE.BufferAttribute(aR, 4));
  const pNoise = new Float32Array(N * 3), pLogo = new Float32Array(N * 3), cLogo = new Float32Array(N * 3);
  geo.setAttribute('pNoise', new THREE.BufferAttribute(pNoise, 3));
  geo.setAttribute('pLogo', new THREE.BufferAttribute(pLogo, 3));
  geo.setAttribute('cLogo', new THREE.BufferAttribute(cLogo, 3));

  const uniforms = {
    uA: { value: 0 }, uB: { value: 0 }, uTime: { value: 0 }, uScatter: { value: 0 }, uFade: { value: 1 },
    uSize: { value: small ? 30 : 26 }, uPR: { value: PR }, uCell: { value: 8 }, uLogoA: { value: Math.min(1, logo.length / N) }, uRot: { value: .62 }, uOff: { value: new THREE.Vector3() },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const points = new THREE.Points(geo, mat); points.frustumCulled = false;
  scene.add(points);

  // optional picture inside the CRT screen (config.js → TV_TELA). Only the screen area changes.
  if (TV_TELA) {
    const pic = new Image(); pic.src = TV_TELA;
    pic.decode().then(() => {
      const c = document.createElement('canvas'); c.width = 240; c.height = 180;
      const x = c.getContext('2d'), r = Math.max(240 / pic.naturalWidth, 180 / pic.naturalHeight);   // cover
      x.drawImage(pic, (240 - pic.naturalWidth * r) / 2, (180 - pic.naturalHeight * r) / 2, pic.naturalWidth * r, pic.naturalHeight * r);
      const d = x.getImageData(0, 0, 240, 180).data, col = geo.attributes.cTV;
      for (const [idx, u, v] of tv.screen) { const o = (Math.min(179, Math.floor(v * 180)) * 240 + Math.min(239, Math.floor(u * 240))) * 4; col.setXYZ(idx, d[o] / 255, d[o + 1] / 255, d[o + 2] / 255); }
      col.needsUpdate = true;
    }).catch(() => {});
  }

  // Static / logo are laid out on a plane in front of the camera, so they always face the viewer.
  let shiftX = 0, shiftY = 0, focal = 1;   // px the picture is shifted by the view offset; focal length in px
  function layoutFlat() {
    camera.updateMatrixWorld();
    const D = 8, k = D / focal, vw = canvas.clientWidth * k, vh = canvas.clientHeight * k;
    const cx = -shiftX * k, cy = -shiftY * k;                 // keep static + logo centred on screen
    // small, refined logo: each LED cell is a whole number of device pixels, so every lamp is equally sharp
    const cellPx = Math.max(2, Math.round(Math.min(canvas.clientWidth * .15, 300) / LED_COLS * PR)) / PR;
    const logoW = cellPx * LED_COLS * k, v = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      v.set(cx + R(-vw / 2, vw / 2) * 1.05, cy + R(-vh / 2, vh / 2) * 1.05, -D).applyMatrix4(camera.matrixWorld);
      pNoise.set([v.x, v.y, v.z], i * 3);
      const L = logo[i % logo.length];   // every LED cell gets the same number of particles → even brightness
      v.set(cx + L[0] * logoW, cy + L[1] * logoW, -D).applyMatrix4(camera.matrixWorld);
      pLogo.set([v.x, v.y, v.z], i * 3); cLogo.set([L[2], L[3], L[4]], i * 3);
    }
    uniforms.uCell.value = cellPx;   // one LED cell, in CSS px
    geo.attributes.pNoise.needsUpdate = geo.attributes.pLogo.needsUpdate = geo.attributes.cLogo.needsUpdate = true;
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const portrait = w / h < .9;
    if (!portrait) {
      // Same framing as the approved concept frame: TV seen from below, 3/4 pose, a bit right of centre,
      // sized by the screen width (focal = 0.833·width) and anchored near the top.
      focal = .74 * w;                         // v2: a bit smaller, so the title can wrap around it
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan((h / 2) / focal));
      target.set(0, 3.6, 0);
      camera.position.set(0, 3.6 - 10.5 * Math.sin(.22), 10.5 * Math.cos(.22));
      shiftX = .2 * w; shiftY = -.1 * h;      // v2: TV on the right, the title lives in the free left area
      camera.setViewOffset(w, h, -shiftX, shiftY, w, h);
      uniforms.uOff.value.set(0, 0, 0);
    } else {
      camera.clearViewOffset(); camera.fov = 38; shiftX = shiftY = 0;
      focal = (h / 2) / Math.tan(THREE.MathUtils.degToRad(19));
      target.set(0, 3.7, 0); camera.position.set(0, .9, 21);
      uniforms.uOff.value.set(0, 2.3, 0);   // portrait: smaller TV, higher up, the title sits below it
    }
    camera.lookAt(target);
    camera.updateProjectionMatrix();
    layoutFlat();
  }
  resize();
  addEventListener('resize', resize);

  // mouse parallax
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', (e) => { mouse.tx = e.clientX / innerWidth - .5; mouse.ty = e.clientY / innerHeight - .5; });

  let running = false, raf = 0, base = { rot: .62 };
  const clock = new THREE.Clock();
  function frame() {
    raf = requestAnimationFrame(frame);
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    uniforms.uRot.value = base.rot + mouse.x * .25 * uniforms.uB.value;
    renderer.render(scene, camera);
    if (api.onFrame) api.onFrame();
  }
  // screen position (CSS px, canvas-relative) of the main antenna tip — same transform as the vertex shader
  const tipV = new THREE.Vector3();
  function tip() {
    const r = uniforms.uRot.value, c = Math.cos(r), s = Math.sin(r), [x, y, z] = MAIN_TIP, o = uniforms.uOff.value;
    tipV.set(c * x + s * z + o.x, y + o.y, -s * x + c * z + o.z).project(camera);
    return { x: (tipV.x + 1) / 2 * canvas.clientWidth, y: (1 - tipV.y) / 2 * canvas.clientHeight };
  }
  const api = {
    uniforms, base, tip, onFrame: null,
    start() { if (!running) { running = true; clock.start(); frame(); } },
    stop() { running = false; cancelAnimationFrame(raf); },
  };
  return api;
}
