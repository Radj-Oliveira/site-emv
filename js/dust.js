/* Hero title exit: "Comunicação que se vê" breaks into particles that fly off like the TV's,
   driven by scroll progress (0 = intact text, 1 = gone).
   Kept light on purpose: plain 2D canvas, particles sampled once, and it only draws when the
   scroll progress changes (no animation loop running in the background). */

const GRAD = ['#1f6bff', '#00a8ff', '#2edb4b', '#a8f03a'], STOPS = [0, .45, .8, 1];   // same as --grad

export function createDust(title, canvas) {
  const ctx = canvas.getContext('2d');
  const small = matchMedia('(max-width:700px)').matches;
  const STEP = small ? 3 : 3;              // sampling grid (CSS px): one particle every STEP px of ink
  const MAX = small ? 2600 : 6000;          // hard cap on particle count
  let parts = null, dpr = 1, W = 0, H = 0, last = -1;

  // draw the title letter by letter (exact DOM positions, so letter-spacing and line breaks match) and sample it
  function build() {
    const box = canvas.getBoundingClientRect();
    W = box.width; H = box.height; dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const tr = title.getBoundingClientRect(), pad = 30, y0 = (window.gsap && +gsap.getProperty(title, 'y')) || 0;
    const ox = tr.left - box.left - pad, oy = tr.top - box.top - pad - y0;   // base position; the title's own y is added when drawing
    const cw = Math.ceil(tr.width + pad * 2), ch = Math.ceil(tr.height + pad * 2);
    const off = document.createElement('canvas'); off.width = cw; off.height = ch;
    const o = off.getContext('2d', { willReadFrequently: true });
    const cs = getComputedStyle(title);
    o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    o.textBaseline = 'alphabetic';
    const asc = o.measureText('Hg').fontBoundingBoxAscent || parseFloat(cs.fontSize) * .9;

    const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT), range = document.createRange();
    for (let node; (node = walker.nextNode());) {
      const gt = node.parentElement.closest('.gt');
      if (gt) {   // gradient across the whole "se vê" span, like background-clip:text
        const g = gt.getBoundingClientRect(), lg = o.createLinearGradient(g.left - tr.left + pad, 0, g.right - tr.left + pad, 0);
        GRAD.forEach((c, i) => lg.addColorStop(STOPS[i], c)); o.fillStyle = lg;
      } else o.fillStyle = '#f2f4f5';
      const s = node.textContent;
      for (let i = 0; i < s.length; i++) {
        if (!s[i].trim()) continue;
        range.setStart(node, i); range.setEnd(node, i + 1);
        const r = range.getBoundingClientRect(); if (!r.width) continue;
        o.fillText(s[i], r.left - tr.left + pad, r.top - tr.top + pad + asc);
      }
    }

    const d = o.getImageData(0, 0, cw, ch).data, list = [];
    for (let y = 0; y < ch; y += STEP) for (let x = 0; x < cw; x += STEP) {
      const k = (y * cw + x) * 4; if (d[k + 3] < 110) continue;
      list.push([x, y, d[k], d[k + 1], d[k + 2]]);
    }
    // thin out evenly if over the cap
    const keep = Math.min(1, MAX / list.length);
    parts = [];
    for (const [x, y, r, g, b] of list) {
      if (keep < 1 && Math.random() > keep) continue;
      const nx = x / cw;
      parts.push({
        x: ox + x, y: oy + y, c: `rgb(${r},${g},${b})`,
        d: nx * .55 + Math.random() * .25,                 // left letters go first, like the signal being swept away
        vx: 160 + Math.random() * 380,                     // fly right, toward the TV
        vy: -60 - Math.random() * 220 + (Math.random() - .5) * 80,
        w: Math.random() * 6.283, s: .9 + Math.random() * .9,
      });
    }
    // group by colour so the canvas changes fillStyle as little as possible
    parts.sort((a, b) => (a.c < b.c ? -1 : a.c > b.c ? 1 : 0));
    last = -1;
  }

  function render(p) {
    if (p === last) return; last = p;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    if (p <= 0) return;
    const shift = (window.gsap && +gsap.getProperty(title, 'y')) || 0;   // follow the title wherever it has glided to
    const show = Math.min(1, p / .06);   // particles fade in over the crisp text, then break apart
    let cur = '';
    for (const q of parts) {
      const t = Math.min(1, Math.max(0, (p * 1.5 - q.d) / .55)), e = t * t;
      const a = show * (1 - t) * (t > 0 ? 1 : .95); if (a <= .01) continue;
      if (q.c !== cur) { ctx.fillStyle = cur = q.c; }
      ctx.globalAlpha = a;
      const sz = q.s * (1.6 - t * .9);
      ctx.fillRect(q.x + q.vx * e + Math.sin(q.w + t * 6) * 6 * t - sz / 2, q.y + shift + q.vy * e - sz / 2, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  return {
    update(p) {
      if (p > 0 && !parts) build();
      title.style.opacity = p > 0 ? String(Math.max(0, 1 - p / .06)) : '';   // crisp text hands over to particles
      if (parts) render(p);
    },
    reset() { parts = null; last = -1; ctx.clearRect(0, 0, canvas.width, canvas.height); },
  };
}
