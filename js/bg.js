/* Cinematic tech background that lives behind the whole page.
   Layers (each one fades in/out per section, driven by scroll):
   - dust:  3D particle dust the camera travels through
   - wave:  a flowing particle "ocean" near the bottom
   - rings: thin glowing light rings / orbits (like a halo around a screen)
   - globe: a wireframe globe made of lines
   Everything is additive, low-opacity and sits under the content. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const BLUE = new THREE.Color('#1f6bff'), CYAN = new THREE.Color('#00a8ff'), GREEN = new THREE.Color('#2edb4b'), WHITE = new THREE.Color('#dfe8ff');

export function createBG(canvas) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' }); } catch (e) { return null; }
  const small = matchMedia('(max-width:700px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.3 : 1.6));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, .1, 200);
  camera.position.set(0, 0, 12);

  const U = { time: { value: 0 }, dust: { value: 0 }, wave: { value: 0 }, travel: { value: 0 }, pr: { value: renderer.getPixelRatio() } };

  /* ---- dust ---- */
  {
    const N = small ? 1400 : 3200, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), rnd = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos.set([(Math.random() - .5) * 60, (Math.random() - .5) * 40, -Math.random() * 60 + 8], i * 3);
      const c = [BLUE, CYAN, WHITE, GREEN][Math.random() < .08 ? 3 : Math.floor(Math.random() * 3)];
      col.set([c.r, c.g, c.b], i * 3); rnd[i] = Math.random();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('rnd', new THREE.BufferAttribute(rnd, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
      vertexShader: `uniform float time, travel, pr; attribute float rnd; varying vec3 vC; varying float vA;
        void main(){ vec3 p = position; p.z = mod(p.z + travel * 12. + time * .22 + 52., 60.) - 52.;   // drifts slowly toward you
          p.x += sin(time * .12 + rnd * 20.) * .5; p.y += cos(time * .1 + rnd * 17.) * .5;
          vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = (1. + rnd * 1.8) * pr * 17. / -mv.z; vC = color; vA = (.25 + .75 * (sin(time * .9 + rnd * 40.) * .5 + .5)) * smoothstep(-52., -30., p.z) * smoothstep(6., 2., p.z); }`,
      fragmentShader: `uniform float dust; varying vec3 vC; varying float vA;
        void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vC, smoothstep(.5, 0., d) * vA * dust * .7); }`,
    });
    scene.add(new THREE.Points(g, m));
  }

  /* ---- wave ---- */
  const waveMesh = (() => {
    const g = new THREE.PlaneGeometry(70, 36, small ? 110 : 190, small ? 50 : 80); g.rotateX(-Math.PI / 2);
    const m = new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `uniform float time, pr; varying float vA; varying float vX;
        void main(){ vec3 p = position;
          p.y += sin(p.x * .28 + time * .7) * .9 + sin(p.z * .35 + time * .5) * .7 + sin((p.x + p.z) * .12 + time * .3) * 1.2;
          vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
          gl_PointSize = pr * 22. / -mv.z; vA = smoothstep(-36., -6., -length(p.xz) * 1.6) ; vX = p.x / 70. + .5; }`,
      fragmentShader: `uniform float wave; varying float vA; varying float vX;
        void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard;
          vec3 c = mix(vec3(.12,.42,1.), vec3(.18,.86,.29), smoothstep(.35, .9, vX));
          gl_FragColor = vec4(c, smoothstep(.5, 0., d) * vA * wave * .9); }`,
    });
    const pts = new THREE.Points(g, m); pts.position.set(0, -7.5, -6); scene.add(pts); return pts;
  })();

  /* ---- light rings ---- */
  const rings = new THREE.Group(); scene.add(rings);
  const ringMats = [];
  [[7.5, .18, CYAN], [9.5, -.12, BLUE], [11.5, .26, GREEN]].forEach(([r, tilt, c], k) => {
    const pts = []; for (let i = 0; i <= 256; i++) { const a = i / 256 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r * .42)); }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    // brightness varies along the ring so it reads as a moving streak of light
    const al = new Float32Array(257); for (let i = 0; i <= 256; i++) al[i] = Math.pow(.5 + .5 * Math.sin(i / 256 * Math.PI * 2 * (1 + k)), 3);
    g.setAttribute('al', new THREE.BufferAttribute(al, 1));
    const m = new THREE.ShaderMaterial({ uniforms: { op: { value: 0 }, c: { value: c } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `attribute float al; varying float vA; void main(){ vA = al; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
      fragmentShader: `uniform float op; uniform vec3 c; varying float vA; void main(){ gl_FragColor = vec4(c, (.08 + vA * .9) * op); }` });
    const line = new THREE.Line(g, m); line.rotation.x = tilt; line.rotation.z = tilt * .6; rings.add(line); ringMats.push(m);
  });
  rings.position.set(4, 0, -4);

  /* ---- state ---- */
  const cur = { dust: 0, wave: 0, rings: 0 }, tgt = { ...cur };
  let scroll = 0, vel = 0, running = false, raf = 0;
  const clock = new THREE.Clock();
  function resize() {
    const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    rings.position.x = w < 900 ? 0 : 4;
  }
  resize(); addEventListener('resize', resize);

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
    for (const k in cur) cur[k] += (tgt[k] - cur[k]) * Math.min(1, dt * 2.2);
    U.time.value = t; U.dust.value = cur.dust; U.wave.value = cur.wave; U.travel.value = scroll;
    ringMats.forEach((m, k) => { m.uniforms.op.value = cur.rings * (k === 1 ? .75 : 1); });
    rings.rotation.y = t * .08 + scroll * 6; rings.children.forEach((l, k) => { l.rotation.y = t * (.1 + k * .05) * (k % 2 ? -1 : 1) + vel * 4; });
    camera.position.y = -scroll * 2; camera.rotation.z = vel * .4;
    waveMesh.position.z = -6 + Math.sin(scroll * 3) * 2;
    vel *= .9;
    renderer.render(scene, camera);
  }
  return {
    // v3: no light rings any more — only a very discreet light dust (always on); the wave only where a section asks for it (the final CTA)
    set(v) { Object.assign(tgt, { dust: 1, wave: v.wave || 0, rings: 0 }); },
    scroll(p, v) { scroll = p; vel += (v - vel) * .1; },
    start() { if (!running) { running = true; clock.start(); frame(); } },
    stop() { running = false; cancelAnimationFrame(raf); },
    snap() { Object.assign(cur, tgt); frame(); cancelAnimationFrame(raf); },   // dev: jump to the target look (screenshots)
  };
}