/* Stylised map of Remanso — BA (Lago de Sobradinho) drawn with lines and particles.
   It is an illustration, not an interactive map. progress (0..1) is driven by scroll. */
export function createMap(canvas) {
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, S = 1, progress = 0, raf = 0, running = false, t0 = performance.now();
  const lake = [];
  for (let a = 0; a < Math.PI * 2; a += .02) {
    const r = 1 + .18 * Math.sin(a * 3 + 1) + .1 * Math.sin(a * 7) + .06 * Math.sin(a * 13);
    lake.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  // roads in normalised coords (0..1)
  const roads = [[[.2, .16], [.41, .39], [.52, .95]], [[.41, .39], [.1, .67]], [[.41, .39], [.6, .1]], [[.41, .39], [.78, .55]]];
  const travellers = Array.from({ length: 26 }, () => ({ r: Math.floor(Math.random() * roads.length), t: Math.random(), v: .0006 + Math.random() * .0012 }));

  function resize() {
    const dpr = Math.min(devicePixelRatio, 2);
    W = canvas.clientWidth; H = canvas.clientHeight; S = dpr;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const P = (x, y) => [x * W, y * H];
  const lerpPath = (pts, t) => {
    const seg = pts.length - 1, f = Math.min(seg - 1e-6, t * seg), i = Math.floor(f), k = f - i;
    return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
  };

  function draw(now) {
    const t = (now - t0) / 1000, p = progress, mobile = W < 700;
    ctx.clearRect(0, 0, W, H);
    // dot grid
    ctx.fillStyle = 'rgba(242,244,245,.07)';
    for (let y = 18; y < H; y += 22) for (let x = 18; x < W; x += 22) ctx.fillRect(x, y, 1.2, 1.2);

    // desktop: the text is on the left, so the map content shifts right
    ctx.save(); ctx.translate(mobile ? 0 : W * .14, 0);
    // lake contours (appear one by one with progress)
    const cx = W * (mobile ? .62 : .66), cy = H * .55, rx = W * (mobile ? .55 : .3), ry = H * .15, rot = -.32;
    const rings = 16, shown = Math.floor(rings * Math.min(1, p * 1.4));
    for (let i = 0; i < shown; i++) {
      const s = 1 - i * .055;
      ctx.strokeStyle = `rgba(0,168,255,${.07 + i * .04})`; ctx.lineWidth = i === 0 ? 1.6 : .8;
      ctx.beginPath();
      lake.forEach(([x, y], j) => {
        const X = x * rx * s + Math.sin(t * .6 + i + j * .05) * 1.2, Y = y * ry * s;
        const px = cx + X * Math.cos(rot) - Y * Math.sin(rot), py = cy + X * Math.sin(rot) + Y * Math.cos(rot);
        j ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      });
      ctx.closePath(); ctx.stroke();
    }

    // river (dashed), roads and travelling particles
    ctx.setLineDash([5, 7]); ctx.strokeStyle = `rgba(0,168,255,${.35 * p})`; ctx.lineWidth = 1.2;
    ctx.beginPath(); const r0 = P(.39, .31), r1 = P(.31, .04); ctx.moveTo(...r0); ctx.bezierCurveTo(r0[0] - 30, r0[1] - 60, r1[0] + 40, r1[1] + 50, ...r1); ctx.stroke();
    ctx.setLineDash([]);
    const rp = Math.min(1, Math.max(0, p * 1.6 - .2));
    ctx.strokeStyle = 'rgba(242,244,245,.22)'; ctx.lineWidth = 1;
    roads.forEach(r => { ctx.beginPath(); const steps = 40; for (let k = 0; k <= steps * rp; k++) { const q = P(...lerpPath(r, k / steps)); k ? ctx.lineTo(...q) : ctx.moveTo(...q); } ctx.stroke(); });
    if (rp > .95) travellers.forEach(o => { o.t = (o.t + o.v) % 1; const q = P(...lerpPath(roads[o.r], o.t)); ctx.fillStyle = 'rgba(168,240,58,.85)'; ctx.fillRect(q[0] - 1, q[1] - 1, 2, 2); });

    // towns
    ctx.font = '500 11px "JetBrains Mono", monospace'; ctx.textBaseline = 'middle';
    [['PILÃO ARCADO', .1, .67], ['CASA NOVA', .78, .55], ['RIO SÃO FRANCISCO', .31, .03]].forEach(([n, x, y], i) => {
      const [X, Y] = P(x, y); ctx.globalAlpha = p;
      if (i < 2) { ctx.fillStyle = 'rgba(242,244,245,.55)'; ctx.beginPath(); ctx.arc(X, Y, 3, 0, 7); ctx.fill(); }
      ctx.fillStyle = 'rgba(242,244,245,.42)'; ctx.fillText(n, X + 10, Y + (i === 2 ? 12 : 0)); ctx.globalAlpha = 1;
    });
    ctx.globalAlpha = p; ctx.fillStyle = 'rgba(0,168,255,.55)'; ctx.fillText('LAGO DE SOBRADINHO', cx - 40, cy + 6); ctx.globalAlpha = 1;

    // Remanso pin
    const [X, Y] = P(.41, .39), pin = Math.min(1, Math.max(0, p * 2 - .6));
    if (pin > 0) {
      for (let k = 0; k < 3; k++) { const ph = ((t * .6 + k / 3) % 1); ctx.strokeStyle = `rgba(46,219,75,${(1 - ph) * .7 * pin})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X, Y, 8 + ph * 70, 0, 7); ctx.stroke(); }
      const g = ctx.createRadialGradient(X, Y, 0, X, Y, 90); g.addColorStop(0, `rgba(46,219,75,${.3 * pin})`); g.addColorStop(1, 'rgba(46,219,75,0)'); ctx.fillStyle = g; ctx.fillRect(X - 90, Y - 90, 180, 180);
      ctx.fillStyle = '#a8f03a'; ctx.beginPath(); ctx.arc(X, Y, 5 * pin, 0, 7); ctx.fill();
      ctx.globalAlpha = pin; ctx.font = '500 13px "JetBrains Mono", monospace'; ctx.fillStyle = '#f2f4f5'; ctx.fillText('REMANSO — BA', X + 20, Y - 8);
      ctx.font = '400 11px "JetBrains Mono", monospace'; ctx.fillStyle = 'rgba(242,244,245,.5)'; ctx.fillText('09°37′S  42°05′W', X + 20, Y + 10); ctx.globalAlpha = 1;
    }
    ctx.restore();
    // north arrow
    ctx.strokeStyle = 'rgba(242,244,245,.3)'; ctx.beginPath(); ctx.moveTo(W - 48, 70); ctx.lineTo(W - 48, 108); ctx.stroke();
    ctx.fillStyle = 'rgba(242,244,245,.5)'; ctx.fillText('N', W - 52, 56);
  }
  function loop(now) { raf = requestAnimationFrame(loop); draw(now); }
  resize(); addEventListener('resize', resize);
  return {
    setProgress(v) { progress = v; },
    drawNow() { draw(performance.now()); },   // single frame (used to export a still image)
    start() { if (!running) { running = true; raf = requestAnimationFrame(loop); } },
    stop() { running = false; cancelAnimationFrame(raf); },
  };
}
