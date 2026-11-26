/* Particle illustrations for "Quem somos" (until the real photos arrive):
   - install: EMV team mounting a screen on the wall
   - waiting: clients in a waiting room watching the screen               */
const BARS = ['#1f6bff', '#00a8ff', '#2edb4b', '#a8f03a', '#f2f4f5', '#00a8ff', '#2edb4b'];
const R = (a, b) => a + Math.random() * (b - a);
const rgba = (h, a) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`;

function dots(x, n, fn) { for (let i = 0; i < n; i++) { const p = fn(); if (p) { x.fillStyle = p[2]; x.fillRect(p[0], p[1], p[3] || 1.4, p[3] || 1.4); } } }
function line(x, ax, ay, bx, by, n, col) { dots(x, n, () => { const t = Math.random(); return [ax + (bx - ax) * t + R(-.6, .6), ay + (by - ay) * t + R(-.6, .6), col]; }); }

// a screen made of particles; content: 'bars' or 'ad'
function screen(x, cx, cy, w, h, content, s) {
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, w * .95);
  g.addColorStop(0, 'rgba(31,107,255,.32)'); g.addColorStop(1, 'rgba(31,107,255,0)'); x.fillStyle = g; x.fillRect(cx - w * 1.2, cy - w, w * 2.4, w * 2);
  x.globalCompositeOperation = 'lighter';
  const L = cx - w / 2, T = cy - h / 2, density = (w * h) / 6;
  dots(x, density, () => {
    const u = Math.random(), v = Math.random(); const px = L + u * w, py = T + v * h;
    if (content === 'bars') return [px, py, rgba(BARS[Math.min(6, Math.floor(u * 7))], R(.35, .9)), 1.3 * s];
    const c = v < .55 ? (u < .5 ? '#1f6bff' : '#00a8ff') : (u < .6 ? '#2edb4b' : '#a8f03a');
    return [px, py, rgba(c, R(.25, .8)), 1.3 * s];
  });
  const e = 'rgba(230,240,255,.9)';
  line(x, L - 6, T - 6, L + w + 6, T - 6, w * 1.4, e); line(x, L - 6, T + h + 6, L + w + 6, T + h + 6, w * 1.4, e);
  line(x, L - 6, T - 6, L - 6, T + h + 6, h * 1.4, e); line(x, L + w + 6, T - 6, L + w + 6, T + h + 6, h * 1.4, e);
  x.globalCompositeOperation = 'source-over';
  if (content === 'ad') {
    x.fillStyle = 'rgba(242,244,245,.92)'; x.font = `600 ${Math.round(h * .16)}px "Inter Tight", sans-serif`; x.textBaseline = 'top';
    x.fillText('Sua marca', L + w * .08, T + h * .2); x.fillText('aqui.', L + w * .08, T + h * .38);
    x.font = `500 ${Math.round(h * .055)}px "JetBrains Mono", monospace`; x.fillStyle = 'rgba(242,244,245,.7)'; x.fillText('CH 01 · EMV', L + w * .08, T + h * .8);
  }
}

function person(x, px, py, h, rim, pose = 'stand') {
  x.save(); x.translate(px, py);
  x.fillStyle = '#03050a'; x.strokeStyle = rim; x.lineWidth = 1.4;
  const head = () => { x.beginPath(); x.ellipse(0, -h * .86, h * .075, h * .09, 0, 0, 7); };
  const body = () => { x.beginPath(); x.moveTo(-h * .17, 0); x.quadraticCurveTo(-h * .19, -h * .7, 0, -h * .74); x.quadraticCurveTo(h * .19, -h * .7, h * .17, 0); };
  head(); x.fill(); body(); x.fill();
  if (pose === 'reach') { x.beginPath(); x.moveTo(h * .1, -h * .66); x.lineTo(h * .32, -h * 1.02); x.lineWidth = h * .055; x.strokeStyle = '#03050a'; x.stroke(); x.lineWidth = 1.4; x.strokeStyle = rim; }
  x.beginPath(); x.ellipse(0, -h * .86, h * .075, h * .09, 0, 3.4, 6.0); x.stroke();
  x.beginPath(); x.moveTo(-h * .16, -h * .3); x.quadraticCurveTo(-h * .19, -h * .7, 0, -h * .74); x.quadraticCurveTo(h * .19, -h * .7, h * .16, -h * .3); x.stroke();
  x.restore();
}

function draw(canvas) {
  const dpr = Math.min(devicePixelRatio, 2), W = canvas.clientWidth, H = canvas.clientHeight; if (!W || !H) return;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const x = canvas.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0);
  const s = Math.max(.8, W / 600), kind = canvas.dataset.scene;
  x.fillStyle = '#303632'; x.fillRect(0, 0, W, H);
  // wall dot grid + floor line
  x.fillStyle = 'rgba(242,244,245,.06)'; for (let yy = 12; yy < H; yy += 16) for (let xx = 12; xx < W; xx += 16) x.fillRect(xx, yy, 1, 1);
  const floor = H * .86; x.strokeStyle = 'rgba(0,168,255,.18)'; x.beginPath(); x.moveTo(0, floor); x.lineTo(W, floor); x.stroke();

  if (kind === 'install') {
    const w = W * .46, h = w * .5625, cx = W * .6, cy = H * .36;
    screen(x, cx, cy, w, h, 'bars', s);
    // wall bracket
    x.strokeStyle = 'rgba(242,244,245,.35)'; x.beginPath(); x.moveTo(cx - w * .2, cy); x.lineTo(cx + w * .2, cy); x.stroke();
    // dimension annotation
    x.strokeStyle = 'rgba(168,240,58,.7)'; x.beginPath(); x.moveTo(cx - w / 2, cy - h / 2 - 22); x.lineTo(cx + w / 2, cy - h / 2 - 22); x.stroke();
    [cx - w / 2, cx + w / 2].forEach(px => { x.beginPath(); x.moveTo(px, cy - h / 2 - 28); x.lineTo(px, cy - h / 2 - 16); x.stroke(); });
    x.fillStyle = '#a8f03a'; x.font = `500 ${11 * s}px "JetBrains Mono", monospace`; x.textAlign = 'center'; x.fillText('50″ · NÍVEL OK', cx, cy - h / 2 - 32); x.textAlign = 'left';
    // ladder
    const lx = cx - w / 2 - 40 * s, top = cy - h * .1;
    x.strokeStyle = 'rgba(242,244,245,.45)'; x.lineWidth = 1.5;
    x.beginPath(); x.moveTo(lx - 26 * s, floor); x.lineTo(lx - 8 * s, top); x.moveTo(lx + 26 * s, floor); x.lineTo(lx + 8 * s, top); x.stroke();
    for (let k = 1; k < 7; k++) { const t = k / 7, yy = floor + (top - floor) * t, hw = 26 * s - 18 * s * t; x.beginPath(); x.moveTo(lx - hw, yy); x.lineTo(lx + hw, yy); x.stroke(); }
    person(x, lx, top + (floor - top) * .45, H * .42, 'rgba(0,168,255,.85)', 'reach');
    person(x, cx + w * .32, floor, H * .5, 'rgba(46,219,75,.85)', 'reach');
    // toolbox
    x.strokeStyle = 'rgba(242,244,245,.4)'; x.strokeRect(cx + w * .02, floor - 18 * s, 40 * s, 18 * s);
  } else {
    const w = W * .5, h = w * .5625, cx = W * .5, cy = H * .3;
    // light cone from the screen
    const g = x.createLinearGradient(0, cy, 0, floor); g.addColorStop(0, 'rgba(0,168,255,.16)'); g.addColorStop(1, 'rgba(0,168,255,0)');
    x.fillStyle = g; x.beginPath(); x.moveTo(cx - w / 2, cy + h / 2); x.lineTo(cx + w / 2, cy + h / 2); x.lineTo(cx + w * .95, floor); x.lineTo(cx - w * .95, floor); x.closePath(); x.fill();
    screen(x, cx, cy, w, h, 'ad', s);
    // chairs + seated people seen from behind, looking up
    const seatY = floor - H * .02, n = W > 500 ? 5 : 4;
    for (let k = 0; k < n; k++) {
      const px = W * (.14 + k * (.72 / (n - 1)));
      x.strokeStyle = 'rgba(242,244,245,.25)'; x.strokeRect(px - 30 * s, seatY - 40 * s, 60 * s, 40 * s);
      if (k !== 2) person(x, px, seatY - 10 * s, H * (.36 + (k % 2) * .04), k % 2 ? 'rgba(46,219,75,.8)' : 'rgba(0,168,255,.85)');
    }
    x.fillStyle = 'rgba(242,244,245,.45)'; x.font = `500 ${10 * s}px "JetBrains Mono", monospace`; x.fillText('SALA DE ESPERA · 32 MIN', 18, 26);
  }
  // scanlines
  x.fillStyle = 'rgba(0,0,0,.18)'; for (let yy = 0; yy < H; yy += 3) x.fillRect(0, yy, W, 1);
}

/* ---------- 2D particle retro TV (same model as the hero, rendered once) ---------- */
const hex3 = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const BODY = [205, 222, 240], EDGE = [230, 240, 255], WOOD = [180, 150, 110];
const TVCACHE = {};
function tvModel(q) {
  if (TVCACHE[q]) return TVCACHE[q];
  const P = [], add = (x, y, z, c, a) => P.push([x, y, z, c, a]), n = k => Math.round(k * q);
  const X0 = -2.3, X1 = 2.3, Y0 = 2, Y1 = 5.3, Z0 = -1.6, Z1 = 1;
  for (let i = 0; i < n(7000); i++) add(R(X0, X1), Y1, R(Z0, Z1), BODY, .35);
  for (let i = 0; i < n(3500); i++) add(R(X0, X1), Y0, R(Z0, Z1), BODY, .25);
  for (let i = 0; i < n(6000); i++) add(X0, R(Y0, Y1), R(Z0, Z1), BODY, .3);
  for (let i = 0; i < n(6000); i++) add(X1, R(Y0, Y1), R(Z0, Z1), BODY, .3);
  for (let i = 0; i < n(9000); i++) { const x = R(X0, X1), y = R(Y0, Y1); if (!(x > -2 && x < 1.05 && y > 2.3 && y < 5)) add(x, y, Z1, BODY, .4); }
  const edge = (a, b, k, c = EDGE, al = .95) => { for (let i = 0; i < n(k); i++) { const t = Math.random(); add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, c, al); } };
  const V = [[X0, Y0, Z0], [X1, Y0, Z0], [X1, Y1, Z0], [X0, Y1, Z0], [X0, Y0, Z1], [X1, Y0, Z1], [X1, Y1, Z1], [X0, Y1, Z1]];
  [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => edge(V[a], V[b], 900));
  edge([-2, 2.3, Z1], [1.05, 2.3, Z1], 700); edge([1.05, 2.3, Z1], [1.05, 5, Z1], 700); edge([1.05, 5, Z1], [-2, 5, Z1], 700); edge([-2, 5, Z1], [-2, 2.3, Z1], 700);
  for (let i = 0; i < n(26000); i++) { const u = R(-1, 1), v = R(-1, 1); if (Math.abs(u) > .94 && Math.abs(v) > .9) continue;
    add(-.475 + u * 1.42, 3.65 + v * 1.24, Z1 + .02 + .16 * (1 - u * u * .8) * (1 - v * v * .8), hex3(BARS[Math.min(6, Math.floor((u + 1) / 2 * 7))]), .85); }
  const ring = (cx, cy, r, k) => { for (let i = 0; i < n(k); i++) { const a = Math.random() * 6.283, rr = r * Math.sqrt(Math.random()); add(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, Z1 + .03, EDGE, .8); } };
  ring(1.65, 4.55, .22, 500); ring(1.65, 4, .22, 500); ring(1.65, 3.35, .3, 700);
  for (let k = 0; k < 9; k++) edge([1.3, 2.45 + k * .08, Z1 + .01], [2, 2.45 + k * .08, Z1 + .01], 120, EDGE, .7);
  const ant = (a, b) => { edge(a, b, 900, [220, 235, 255], .9); for (let i = 0; i < n(120); i++) add(b[0] + R(-.07, .07), b[1] + R(-.07, .07), b[2] + R(-.07, .07), [255, 255, 255], 1); };
  ant([-1.2, Y1, .55], [-1.35, 8.1, .1]); ant([.45, Y1, .55], [1.6, 7.5, .05]); ant([.85, Y1, .55], [2.35, 7.2, .1]);
  const leg = (t0, b0) => { for (let i = 0; i < n(1400); i++) { const t = Math.random(), r = .09 * (1 - t * .6), a = Math.random() * 6.28; add(t0[0] + (b0[0] - t0[0]) * t + Math.cos(a) * r, t0[1] + (b0[1] - t0[1]) * t, t0[2] + (b0[2] - t0[2]) * t + Math.sin(a) * r, WOOD, .55); } };
  leg([-1.8, Y0, .6], [-2.3, 0, 1.2]); leg([1.8, Y0, .6], [2.3, 0, 1.2]); leg([-1.8, Y0, -1.2], [-2.2, 0, -1.9]); leg([1.8, Y0, -1.2], [2.2, 0, -1.9]);
  return (TVCACHE[q] = P);
}
/* other screen formats: flat TV (16:9 on feet) and vertical totem (9:16 on a pole) */
function screenBox(kind, q) {
  const key = kind + q; if (TVCACHE[key]) return TVCACHE[key];
  const P = [], add = (x, y, z, c, a) => P.push([x, y, z, c, a]), n = k => Math.round(k * q);
  const edge = (a, b, k, c = EDGE, al = .95) => { for (let i = 0; i < n(k); i++) { const t = Math.random(); add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, c, al); } };
  const flat = kind === 'flat';
  const W = flat ? 5.2 : 2.2, H = flat ? 2.95 : 3.9, D = .22, Y0 = flat ? 2.2 : 2.6, X0 = -W / 2, X1 = W / 2, Y1 = Y0 + H, Z0 = -D / 2, Z1 = D / 2;
  const V = [[X0, Y0, Z0], [X1, Y0, Z0], [X1, Y1, Z0], [X0, Y1, Z0], [X0, Y0, Z1], [X1, Y0, Z1], [X1, Y1, Z1], [X0, Y1, Z1]];
  [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => edge(V[a], V[b], 700));
  const m = .14;
  for (let i = 0; i < n(flat ? 22000 : 16000); i++) { const u = Math.random(), v = Math.random();
    add(X0 + m + u * (W - 2 * m), Y0 + m + v * (H - 2 * m), Z1 + .01, hex3(BARS[Math.min(6, Math.floor((flat ? u : v) * 7))]), .8); }
  if (flat) { edge([-1.6, Y0, 0], [-1.9, 0, .5], 500, WOOD, .6); edge([1.6, Y0, 0], [1.9, 0, .5], 500, WOOD, .6); edge([-1.6, Y0, 0], [-1.9, 0, -.5], 500, WOOD, .6); edge([1.6, Y0, 0], [1.9, 0, -.5], 500, WOOD, .6); }
  else { edge([0, Y0, 0], [0, .1, 0], 900, EDGE, .8); for (let i = 0; i < n(1500); i++) { const a = Math.random() * 6.28, r = .9 * Math.sqrt(Math.random()); add(Math.cos(a) * r, .05, Math.sin(a) * r * .6, EDGE, .45); } }
  return (TVCACHE[key] = P);
}
function project(p, c) {
  let x = p[0] - c.tx, y = p[1] - c.ty, z = p[2] - c.tz;
  const cy = Math.cos(c.ry), sy = Math.sin(c.ry); let X = x * cy + z * sy, Z = -x * sy + z * cy;
  const cx = Math.cos(c.rx), sx = Math.sin(c.rx); const Y = y * cx - Z * sx; Z = y * sx + Z * cx;
  const d = c.dist - Z; if (d < .2) return null; return [c.ox + c.f * X / d, c.oy - c.f * Y / d, d];
}
/* cam: {tx,ty,tz,ry,rx,dist,f,ox,oy} in CSS px of the canvas; size = particle size */
export function drawTV(x, cam, { size = 1.4, glow = true, q = .5, kind = 'crt', alpha = 1 } = {}) {
  if (glow) { const s = project([-.47, 3.65, 1.1], cam); const g = x.createRadialGradient(s[0], s[1], 0, s[0], s[1], cam.f * .55);
    g.addColorStop(0, `rgba(31,107,255,${.28 * alpha})`); g.addColorStop(.5, `rgba(0,168,255,${.08 * alpha})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, x.canvas.width, x.canvas.height); }
  x.globalCompositeOperation = 'lighter';
  for (const p of (kind === 'crt' ? tvModel(q) : screenBox(kind, q))) { const s = project(p, cam); if (!s) continue; const k = Math.min(1, 7 / s[2]);
    x.fillStyle = `rgba(${p[3][0]},${p[3][1]},${p[3][2]},${p[4] * k * .95 * alpha})`; const sz = size * k; x.fillRect(s[0], s[1], sz, sz); }
  x.globalCompositeOperation = 'source-over';
}
export function crowd(x, baseY, xs, h, rim) { xs.forEach((px, i) => person(x, px, baseY, h * (.85 + ((i * 37) % 10) / 40), rim)); }

/* particle portrait (head & shoulders) for the team cards */
function portrait(x, W, H, col) {
  x.fillStyle = '#303632'; x.fillRect(0, 0, W, H);
  const g = x.createRadialGradient(W * .5, H * .35, 0, W * .5, H * .35, W * .8); g.addColorStop(0, rgba(col, .28)); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'lighter';
  const cx = W / 2, hy = H * .4, hr = W * .17;
  dots(x, W * H / 9, () => {
    const px = R(0, W), py = R(0, H);
    const inHead = ((px - cx) / hr) ** 2 + ((py - hy) / (hr * 1.22)) ** 2 < 1;
    const sh = py > H * .62 && Math.abs(px - cx) < W * .42 * Math.min(1, (py - H * .55) / (H * .2));
    const neck = py > hy + hr && py < H * .66 && Math.abs(px - cx) < hr * .5;
    if (!(inHead || sh || neck)) return Math.random() < .015 ? [px, py, 'rgba(242,244,245,.25)'] : null;
    const rim = (px - cx) / (W * .4);                       // light from the right
    return [px, py, rgba(rim > .1 ? col : '#9aa1a8', R(.15, .55) + Math.max(0, rim) * .4), 1.3];
  });
  x.globalCompositeOperation = 'source-over';
  x.fillStyle = 'rgba(0,0,0,.2)'; for (let yy = 0; yy < H; yy += 3) x.fillRect(0, yy, W, 1);
}

export function initScenes() {
  const list = [...document.querySelectorAll('canvas.scene')];
  // TV scenes: t = time in seconds → each TV sways/turns gently in place (no position change)
  const drawTVScene = (c, t = 0) => {
    const W = c.clientWidth, H = c.clientHeight; if (!W) return;
    const x = c.getContext('2d'); const dpr = c.width / W; x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
    if (c.dataset.scene === 'tv') {
      const ry = +(c.dataset.ry || .62), zoom = +(c.dataset.zoom || 1), alpha = +(c.dataset.alpha || .55);
      const kinds = (c.dataset.kinds || 'crt').split(','), anim = c.closest('.hist') ? 1 : 0;
      kinds.forEach((kind, k) => {
        const ox = kinds.length === 1 ? +(c.dataset.ox || .5) : .22 + k * (.56 / (kinds.length - 1));
        const sway = anim * (Math.sin(t * .6 + k * 1.7) * .22), bob = anim * Math.sin(t * .9 + k) * H * .008;
        drawTV(x, { tx: 0, ty: 4, tz: 0, ry: ry - k * .25 + sway, rx: -.12 + anim * Math.sin(t * .45 + k) * .03, dist: (14 + (kinds.length - 1) * 5) / zoom, f: H * 1.05, ox: W * ox, oy: H * +(c.dataset.oy || .5) + bob },
          { size: anim ? 1.5 : 1.25, q: anim ? .12 : .35, kind, alpha, glow: k === 0 });
      });
    } else {
      const kinds = ['flat', 'crt', 'totem', 'crt', 'flat', 'totem'];
      for (let k = 0; k < 6; k++) drawTV(x, { tx: 0, ty: 3.9, tz: 0, ry: .55 - (k % 3) * .25 + Math.sin(t * .55 + k * 1.3) * .2, rx: -.1, dist: 21, f: H * 1.05,
        ox: W * (.2 + (k % 3) * .3), oy: H * (.22 + Math.floor(k / 3) * .3) + Math.sin(t * .8 + k) * H * .006 }, { size: 1.3, q: .08, glow: k === 1, kind: kinds[k], alpha: .55 });
    }
  };
  const size = (c) => { const dpr = Math.min(devicePixelRatio, 1.5), W = c.clientWidth, H = c.clientHeight; if (W) { c.width = W * dpr; c.height = H * dpr; } };
  const one = (c) => {
    if (c.dataset.scene === 'portrait') {
      const dpr = Math.min(devicePixelRatio, 2), W = c.clientWidth, H = c.clientHeight; if (!W) return;
      c.width = W * dpr; c.height = H * dpr; const x = c.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); portrait(x, W, H, c.dataset.col || '#00a8ff');
    } else if (c.dataset.scene === 'tv' || c.dataset.scene === 'wall') { size(c); drawTVScene(c, 0); }
    else draw(c);
  };
  const run = () => list.forEach(one);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(run);
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(run, 200); });

  // animate the TVs inside "Nossa história" while they are on screen (~30 fps)
  const anim = list.filter(c => c.closest('.hist') && (c.dataset.scene === 'tv' || c.dataset.scene === 'wall'));
  const visible = new Set();
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)), { threshold: 0 });
  anim.forEach(c => io.observe(c));
  let last = 0;
  const loop = (now) => { requestAnimationFrame(loop); if (!visible.size || now - last < 42) return; last = now; visible.forEach(c => drawTVScene(c, now / 1000)); };
  if (anim.length && !matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(loop);
}