/* "Canais no ar agora" — 3D ring of glass screens (Three.js), based on the approved showcase reference.
   Portrait screens stand up, wide screens (isWide) lie down. No contact shadow. Centered, a screen ≈ 50% of the
   viewport height. Scroll turns the ring (it snaps to the nearest screen), drag/swipe turns it too, click opens the
   player with the video (same player as before). Renders only while the section is on screen. */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export async function createRing3D({ stage, items, isWide, onOpen, onActive, onZoom }) {
  const canvas = document.createElement('canvas'); canvas.className = 'ring3d'; stage.appendChild(canvas);
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { canvas.remove(); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  await (document.fonts ? document.fonts.ready : Promise.resolve());

  const N = items.length, STEP = Math.PI * 2 / N;
  const PH = 2.03, PW = 1, LW = 1.75, LH = .98;           // portrait 1 : 2.03 · landscape ≈ 16:9
  const RAD = .045, DEPTH = .045, BEV = .01, BEZEL = .028;
  const RING = (N * 1.95) / (Math.PI * 2);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  scene.add(new THREE.AmbientLight(0xffffff, .55));
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(2, 3, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0x8fb8ff, .8); rim.position.set(-3, 1, -2); scene.add(rim);

  /* ---- the picture on each screen: the same look as the old cards (CH, headline, name) ---- */
  function poster(p, i, wide) {
    const c = document.createElement('canvas'), W = wide ? 760 : 380, H = wide ? 426 : 772; c.width = W; c.height = H;
    const x = c.getContext('2d'), pad = W * (wide ? .045 : .07);
    x.fillStyle = p.fundo; x.fillRect(0, 0, W, H);
    x.fillStyle = p.texto; x.textBaseline = 'top';
    x.font = `500 ${wide ? 17 : 15}px "JetBrains Mono", monospace`;
    x.fillText(`CH ${String(i + 1).padStart(2, '0')}`, pad, pad); x.textAlign = 'right'; x.fillText('●', W - pad, pad); x.textAlign = 'left';
    const lines = p.chamada.split(/<br\s*\/?>/i), fs = wide ? 64 : 58;
    x.font = `700 ${fs}px "Inter Tight", system-ui, sans-serif`;
    const y0 = H / 2 - (lines.length * fs * 1.02) / 2;
    lines.forEach((l, k) => x.fillText(l, pad, y0 + k * fs * 1.02));
    x.font = `500 ${wide ? 15 : 13}px "JetBrains Mono", monospace`; x.textBaseline = 'bottom';
    x.fillText(p.nome.toUpperCase(), pad, H - pad); x.textAlign = 'right'; x.fillText('00:15', W - pad, H - pad);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return { tex: t, aspect: W / H };
  }

  /* ---- device body + rounded glass screen ---- */
  function rounded(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
  }
  const geo = {};
  const geoFor = (w, h) => geo[w + 'x' + h] || (geo[w + 'x' + h] = (() => {
    const body = new THREE.ExtrudeGeometry(rounded(w, h, RAD), { depth: DEPTH, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelSegments: 4, curveSegments: 16 });
    body.translate(0, 0, -DEPTH / 2);
    return { body, screen: new THREE.PlaneGeometry(w - BEZEL * 2, h - BEZEL * 2) };
  })());
  const FRONT_Z = DEPTH / 2 + BEV + .0015;
  const vert = `varying vec2 vUv; varying vec3 vN; varying vec3 vView;
    void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.); vN = normalize(mat3(modelMatrix) * normal);
      vView = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`;
  const frag = `uniform sampler2D map; uniform vec2 size; uniform float radius, imgAspect, opacity, bright;
    varying vec2 vUv; varying vec3 vN; varying vec3 vView;
    float sdR(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q,0.)) + min(max(q.x,q.y),0.) - r; }
    void main(){ vec2 p = (vUv - .5) * size; float d = sdR(p, size * .5, radius); if (d > 0.) discard;
      float pa = size.x / size.y; vec2 uv = vUv;
      if (imgAspect > pa) uv.x = (uv.x - .5) * pa / imgAspect + .5; else uv.y = (uv.y - .5) * imgAspect / pa + .5;
      vec3 c = texture2D(map, uv).rgb * bright;
      c = mix(c, vec3(.05), smoothstep(-.009, -.004, d) * .9);
      float fres = pow(1. - clamp(dot(vN, vView), 0., 1.), 2.);
      float f = fract(vUv.x * .7 + vUv.y * .35 + vN.x * .9), band = smoothstep(.35, .5, f) * (1. - smoothstep(.5, .75, f));
      c += .07 * band + .12 * fres;
      gl_FragColor = vec4(c, opacity); }`;

  const ring = new THREE.Group(); scene.add(ring);
  const cards = items.map((p, i) => {
    const wide = isWide(i), w = wide ? LW : PW, h = wide ? LH : PH, g = geoFor(w, h), m = poster(p, i, wide);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0d0f12, metalness: .35, roughness: .32, transparent: true });
    const screenMat = new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, transparent: true,
      uniforms: { map: { value: m.tex }, size: { value: new THREE.Vector2(w - BEZEL * 2, h - BEZEL * 2) }, radius: { value: RAD - BEZEL * .6 },
        imgAspect: { value: m.aspect }, opacity: { value: 1 }, bright: { value: 1 } } });
    const group = new THREE.Group(), body = new THREE.Mesh(g.body, bodyMat), screen = new THREE.Mesh(g.screen, screenMat);
    screen.position.z = FRONT_Z; screen.userData.index = i;
    group.add(body, screen); ring.add(group);
    return { group, screen, bodyMat, screenMat, w, h, hover: 0 };
  });

  /* ---- motion: scroll target + drag, inertia and snap ---- */
  let offset = 0, target = 0, prog = 0, zoom = 0, drag = 0, prevOffset = 0, velocity = 0, lastInput = 0, intro = -1, visible = false, raf = 0;
  let dragging = false, lastX = 0, downX = 0, hovered = -1;
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const pick = (e) => {
    const r = canvas.getBoundingClientRect(); ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(cards.filter(c => c.group.visible && c.screenMat.uniforms.opacity.value > .5).map(c => c.screen), false)[0];
    return hit ? hit.object.userData.index : -1;
  };
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = downX = e.clientX; if (e.pointerType !== 'mouse') canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (dragging && (e.pointerType !== 'mouse' || e.buttons)) { const dx = e.clientX - lastX; lastX = e.clientX; drag -= dx * .0042 * (1400 / Math.max(innerWidth, 700)); lastInput = performance.now(); canvas.classList.add('dragging'); }
    hovered = pick(e); canvas.classList.toggle('hover', hovered >= 0);
    const cur = document.querySelector('.cursor'); cur && cur.classList.toggle('is-play', hovered >= 0);
  });
  canvas.addEventListener('pointerleave', () => { hovered = -1; const cur = document.querySelector('.cursor'); cur && cur.classList.remove('is-play'); });
  const end = (e) => {
    if (!dragging) return; dragging = false; canvas.classList.remove('dragging');
    if (Math.abs(e.clientX - downX) < 6) { const i = pick(e); if (i >= 0) onOpen(i, rectOf(i)); }
  };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', () => { dragging = false; });

  // screen rectangle of a card (for the player's grow-from-card animation)
  const rectOf = (i) => {
    const c = cards[i], v = new THREE.Vector3(), r = canvas.getBoundingClientRect(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      v.set(sx * c.w / 2, sy * c.h / 2, FRONT_Z); c.group.localToWorld(v); v.project(camera);
      const X = r.left + (v.x + 1) / 2 * r.width, Y = r.top + (1 - v.y) / 2 * r.height; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y);
    }
    return { left: x0, top: y0, width: x1 - x0, height: y1 - y0, right: x1, bottom: y1 };
  };

  // camera framing: "far" shows the whole ring (lower in the frame, under the centred title); "near" fills the frame
  let tanH = 1, far = 10, near = 6, shiftFar = 0;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const wideView = w > 900;
    far = Math.max((PH / (wideView ? .4 : .5)) / 2 / tanH, (LW * 2.1) / 2 / tanH / camera.aspect);
    shiftFar = wideView ? -.11 * h : 0;                       // ring sits a bit lower while the title is on screen
    near = Math.max((PH / .8) / 2 / tanH, (LW / .37) / 2 / tanH / camera.aspect);   // close view: a standing screen ≈ 80% of the height
  }
  addEventListener('resize', resize); resize();

  const ease = (x) => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const clamp01 = (x) => Math.min(1, Math.max(0, x)), lerp = (a, b, t) => a + (b - a) * t;
  const clock = new THREE.Clock(); let active = -1;

  function tick() {
    raf = requestAnimationFrame(tick);
    const now = performance.now(), dt = Math.min(clock.getDelta(), .1), damp = (f) => 1 - Math.pow(1 - f, dt * 60);
    if (intro < 0) intro = now;
    const k = ease(clamp01((now - intro) / 1600));            // intro: small thumbnails in a line open into the ring
    // scroll script: first the opening view (whole ring + title); then the camera moves in ONCE to a close view
    // (front screen big in the middle, neighbours large at the sides) and from there the scroll turns the screens
    const zoomGoal = ease(clamp01(prog / .1));
    zoom += (zoomGoal - zoom) * damp(.1);
    const turn = clamp01((prog - .1) / .9) * (N - 1);           // one screen after another, with a soft snap
    const goal = (Math.floor(turn) + ease(clamp01((turn - Math.floor(turn) - .35) / .4))) * STEP + drag;
    if (!dragging && now - lastInput > 160) { const snap = Math.round(drag / STEP) * STEP; drag += (snap - drag) * damp(.08); }
    target = goal;
    offset += (target - offset) * damp(.1);
    camera.position.set(0, lerp(.08, 0, zoom), lerp(far, near, zoom * k));
    camera.lookAt(0, lerp(-.02, 0, zoom), 0);
    const sh = shiftFar * (1 - zoom);
    if (sh) camera.setViewOffset(canvas.clientWidth, canvas.clientHeight, 0, sh, canvas.clientWidth, canvas.clientHeight); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    onZoom && onZoom(zoom);
    velocity = lerp(velocity, (offset - prevOffset) / Math.max(dt * 60, .01), damp(.25)); prevOffset = offset;
    const tilt = THREE.MathUtils.clamp(velocity * 6, -.35, .35);
    cards.forEach((c, i) => {
      const a = wrap(i * STEP - offset), front = Math.cos(a);
      const ix = (a / STEP) * .14;
      c.group.position.set(lerp(ix, Math.sin(a) * RING, k), 0, lerp(0, Math.cos(a) * RING - RING, k));
      c.group.rotation.y = lerp(0, a, k) + tilt * .6 * k; c.group.rotation.z = -tilt * .12 * k;
      c.hover += ((hovered === i && !dragging ? 1 : 0) - c.hover) * damp(.12);
      const s = lerp(.065, 1, k) * (1 + c.hover * .035); c.group.scale.set(s * (1 - Math.abs(tilt) * .08), s, s);
      const vis = lerp(1, clamp01((front + .05) / .55), k);
      c.bodyMat.opacity = vis; c.screenMat.uniforms.opacity.value = vis; // only the screen in focus (centre) is fully "on"; the others are softly dimmed. As a screen reaches the centre it
      // "switches on": the light comes up with a short glow while it arrives
      const f = ease(clamp01((front - .82) / .18)); c.on = (c.on || 0) + (f - (c.on || 0)) * damp(.1);
      c.screenMat.uniforms.bright.value = lerp(1, .42 + .58 * c.on + Math.max(0, f - c.on) * .6, k);
      c.group.visible = vis > .01; c.group.renderOrder = Math.round(front * 100);
    });
    const idx = ((Math.round(offset / STEP) % N) + N) % N; if (idx !== active) { active = idx; onActive && onActive(idx); }
    renderer.render(scene, camera);
  }
  return {
    setScroll(p) { prog = p; },   // the page scroll drives the camera (opening view → close view → turn the screens)
    start() { if (!visible) { visible = true; clock.getDelta(); tick(); } },
    stop() { visible = false; cancelAnimationFrame(raf); },
  };
}
