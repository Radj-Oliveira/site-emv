/* Team cards: a particle "mannequin" that turns into the real photo on hover.
   - resting: particles form a still head-and-shoulders silhouette in the brand colour
   - hover:   the same particles travel to the photo's pixels (real colours) and get pushed by the mouse
   - leave:   they go back to the silhouette
   Rendering writes straight into an ImageData buffer, so thousands of particles stay smooth. */

const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const BG = [5, 7, 11];

class MemberFX {
  constructor(canvas) {
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.col = hex(canvas.dataset.col || '#00a8ff');
    this.t = 0; this.target = 0; this.raf = 0; this.mx = -1e4; this.my = -1e4; this.ready = false;
    this.img = new Image(); this.img.src = canvas.dataset.photo;
    this.img.decode().then(() => { this.build(); this.render(); }).catch(() => {});

    const card = canvas.closest('.member') || canvas;
    const pos = (e) => { const r = canvas.getBoundingClientRect(); this.mx = e.clientX - r.left; this.my = e.clientY - r.top; };
    card.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { this.target = 1; pos(e); this.loop(); } });
    card.addEventListener('pointermove', (e) => { pos(e); this.loop(); });
    card.addEventListener('pointerleave', () => { this.target = 0; this.mx = this.my = -1e4; this.loop(); });
    card.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { this.target = this.target ? 0 : 1; pos(e); this.loop(); } });   // tap on phones
    let to; new ResizeObserver(() => { clearTimeout(to); to = setTimeout(() => { if (this.ready) { this.build(); this.render(); } }, 150); }).observe(canvas);
  }

  build() {
    const dpr = Math.min(devicePixelRatio, 2), W = this.c.clientWidth, H = this.c.clientHeight; if (!W || !H) return;
    this.W = W; this.H = H; this.dpr = dpr;
    this.c.width = Math.round(W * dpr); this.c.height = Math.round(H * dpr);
    this.buf = this.ctx.createImageData(this.c.width, this.c.height);
    this.px32 = new Uint32Array(this.buf.data.buffer);

    // photo, fitted into the card (bottom aligned, ~96% of the height)
    const off = document.createElement('canvas'); off.width = W; off.height = H; const o = off.getContext('2d');
    const s = Math.min((W * .98) / this.img.naturalWidth, (H * .96) / this.img.naturalHeight);
    const iw = this.img.naturalWidth * s, ih = this.img.naturalHeight * s;
    o.drawImage(this.img, (W - iw) / 2, H - ih, iw, ih);
    this.fit = { x: (W - iw) / 2, y: H - ih, w: iw, h: ih };   // where the sharp photo is drawn at the end
    const d = o.getImageData(0, 0, W, H).data;
    const step = Math.max(2, Math.round(Math.sqrt((W * H) / 11000)));
    this.step = step;
    const photo = [];
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
      const i = (y * W + x) * 4; if (d[i + 3] > 110) photo.push([x, y, d[i], d[i + 1], d[i + 2]]);
    }
    const N = photo.length;

    // still silhouette (head + neck + shoulders), same number of particles
    const cx = W / 2, hy = H * .34, hr = W * .16, home = [];
    while (home.length < N) {
      const x = Math.random() * W, y = Math.random() * H;
      const head = ((x - cx) / hr) ** 2 + ((y - hy) / (hr * 1.22)) ** 2 < 1;
      const neck = y > hy + hr * .9 && y < H * .62 && Math.abs(x - cx) < hr * .5;
      const sh = y > H * .6 && Math.abs(x - cx) < W * .44 * Math.min(1, (y - H * .55) / (H * .22));
      if (head || neck || sh) home.push([x, y]);
    }
    // pair particles by height so the morph flows top-to-bottom
    photo.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    home.sort((a, b) => a[1] - b[1] || a[0] - b[0]);

    this.N = N;
    this.hx = new Float32Array(N); this.hy = new Float32Array(N); this.pX = new Float32Array(N); this.pY = new Float32Array(N);
    this.dx = new Float32Array(N); this.dy = new Float32Array(N); this.vx = new Float32Array(N); this.vy = new Float32Array(N);
    this.hc = new Uint8Array(N * 3); this.pc = new Uint8Array(N * 3); this.jit = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const p = photo[i], h = home[i];
      this.hx[i] = h[0]; this.hy[i] = h[1]; this.pX[i] = p[0]; this.pY[i] = p[1];
      const rim = Math.max(0, (h[0] - cx) / (W * .4));             // light comes from the right
      const k = .22 + Math.random() * .35 + rim * .5;
      this.hc[i * 3] = Math.min(255, 70 + (this.col[0] - 70) * k * 1.4); this.hc[i * 3 + 1] = Math.min(255, 76 + (this.col[1] - 76) * k * 1.4); this.hc[i * 3 + 2] = Math.min(255, 86 + (this.col[2] - 86) * k * 1.4);
      this.pc[i * 3] = p[2]; this.pc[i * 3 + 1] = p[3]; this.pc[i * 3 + 2] = p[4];
      this.jit[i] = Math.random();
    }
    this.ready = true;
  }

  loop() { if (!this.raf && this.ready) this.raf = requestAnimationFrame(() => this.frame()); }

  frame() {
    this.raf = 0;
    this.t += (this.target - this.t) * .07;
    const e = ease(Math.min(1, Math.max(0, this.t)));
    let moving = Math.abs(this.target - this.t) > .002;
    const R = Math.max(50, this.W * .2), R2 = R * R;
    for (let i = 0; i < this.N; i++) {
      // staggered morph: each particle starts a little later
      const ei = Math.min(1, Math.max(0, e * 1.35 - this.jit[i] * .35));
      const bx = this.hx[i] + (this.pX[i] - this.hx[i]) * ei, by = this.hy[i] + (this.pY[i] - this.hy[i]) * ei;
      const x = bx + this.dx[i], y = by + this.dy[i];
      const ddx = x - this.mx, ddy = y - this.my, d2 = ddx * ddx + ddy * ddy;
      if (d2 < R2) { const d = Math.sqrt(d2) || 1, f = (1 - d / R) * 2.2; this.vx[i] += ddx / d * f; this.vy[i] += ddy / d * f; }
      this.vx[i] = (this.vx[i] - this.dx[i] * .07) * .82; this.vy[i] = (this.vy[i] - this.dy[i] * .07) * .82;
      this.dx[i] += this.vx[i]; this.dy[i] += this.vy[i];
      if (!moving && (Math.abs(this.vx[i]) > .05 || Math.abs(this.dx[i]) > .3)) moving = true;
    }
    this.render(e);
    if (moving || this.target) this.raf = requestAnimationFrame(() => this.frame());
  }

  render(e = ease(this.t)) {
    if (!this.ready) return;
    const px = this.px32, cw = this.c.width, ch = this.c.height, dpr = this.dpr;
    px.fill((255 << 24) | (BG[2] << 16) | (BG[1] << 8) | BG[0]);
    const size = Math.max(1, Math.round((1.3 + (this.step - 1.3) * e) * dpr));
    for (let i = 0; i < this.N; i++) {
      const ei = Math.min(1, Math.max(0, e * 1.35 - this.jit[i] * .35));
      const x = Math.round((this.hx[i] + (this.pX[i] - this.hx[i]) * ei + this.dx[i]) * dpr);
      const y = Math.round((this.hy[i] + (this.pY[i] - this.hy[i]) * ei + this.dy[i]) * dpr);
      if (x < 0 || y < 0 || x >= cw || y >= ch) continue;
      const r = this.hc[i * 3] + (this.pc[i * 3] - this.hc[i * 3]) * ei;
      const g = this.hc[i * 3 + 1] + (this.pc[i * 3 + 1] - this.hc[i * 3 + 1]) * ei;
      const b = this.hc[i * 3 + 2] + (this.pc[i * 3 + 2] - this.hc[i * 3 + 2]) * ei;
      const c = (255 << 24) | (b << 16) | (g << 8) | r;
      const s = ei > .5 ? size : Math.max(1, Math.round(1.3 * dpr));
      for (let yy = 0; yy < s && y + yy < ch; yy++) { const row = (y + yy) * cw + x; for (let xx = 0; xx < s && x + xx < cw; xx++) px[row + xx] = c; }
    }
    this.ctx.putImageData(this.buf, 0, 0);

    // once the particles have formed the person, the real photo fades in on top — faces stay sharp
    const sharp = Math.min(1, Math.max(0, (e - .72) / .25));
    if (sharp > 0) {
      const x = this.ctx, f = this.fit;
      x.save(); x.globalAlpha = sharp; x.imageSmoothingQuality = 'high';
      x.drawImage(this.img, f.x * dpr, f.y * dpr, f.w * dpr, f.h * dpr);
      // mouse movement shows as light particles flying over the photo (the photo itself is never distorted)
      x.globalCompositeOperation = 'lighter';
      for (let i = 0; i < this.N; i++) {
        const m = Math.abs(this.dx[i]) + Math.abs(this.dy[i]); if (m < .8) continue;
        const a = Math.min(.45, m / 22) * sharp;
        x.fillStyle = `rgba(${this.pc[i * 3]},${this.pc[i * 3 + 1]},${this.pc[i * 3 + 2]},${a})`;
        x.fillRect((this.pX[i] + this.dx[i]) * dpr, (this.pY[i] + this.dy[i]) * dpr, 2 * dpr, 2 * dpr);
        x.fillStyle = `rgba(0,168,255,${a * .5})`;
        x.fillRect((this.pX[i] + this.dx[i] * 1.6) * dpr, (this.pY[i] + this.dy[i] * 1.6) * dpr, 1.2 * dpr, 1.2 * dpr);
      }
      x.restore();
    }
  }
}

export function initTeam() {
  const list = [...document.querySelectorAll('canvas.member__fx')].map(c => new MemberFX(c));
  if (location.search.includes('skip')) window.__team = list;   // dev only (screenshots)
}
