/* EMV — v3 choreography.
   One text column that reveals with a mask (eyebrow rule → title → text), media on the other side,
   pinned scenes, horizontal galleries with layered parallax, giant intertitles, a colour curtain
   between chapters and an iris reveal at the end. The particle TV (Three.js) opens the page. */
import { CONTATO, PARCEIROS, HISTORIA, HISTORIA_QUADRO, HISTORIA_FUTURO, NUMEROS, PACOTES } from './config.js';
import { initChat, waLink } from './chat.js';
import { createMap } from './map.js';
import { initScenes } from './scenes.js';
import { createDust } from './dust.js';
import { sfx } from './sfx.js';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const touch = matchMedia('(hover: none)').matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);
const qs = new URLSearchParams(location.search);
const mobile = () => innerWidth <= 900;

/* ---------------- layout switch: cinema (dark) ⇄ clean (light) ---------------- */
{
  const tg = $('#themeTg');
  const apply = (clean) => { if (clean) document.documentElement.dataset.theme = 'clean'; else delete document.documentElement.dataset.theme; tg && tg.setAttribute('aria-pressed', String(clean)); };
  let saved = false; try { saved = localStorage.getItem('emv-theme') === 'clean'; } catch (e) {}
  apply(saved);
  tg && tg.addEventListener('click', () => { const c = document.documentElement.dataset.theme !== 'clean'; apply(c); try { localStorage.setItem('emv-theme', c ? 'clean' : 'cinema'); } catch (e) {} });
}

/* ---------------- music: original track generated in the browser (no files, no copyright) — only on click ---------------- */
{
  const tg = $('#soundTg'); let music = null;
  tg && tg.addEventListener('click', async () => {
    if (!music) music = (await import('./music.js')).createMusic();
    if (music.playing) music.pause(); else music.play();
    tg.setAttribute('aria-pressed', String(music.playing)); tg.classList.toggle('is-on', music.playing);
  });
}

/* ---------------- content from config ---------------- */
$$('[data-wa]').forEach(a => { a.href = waLink(a.dataset.wa === 'parceria' ? 'Olá! Tenho um estabelecimento e quero receber uma tela da EMV.' : CONTATO.mensagemPadrao); });
$$('[data-ig]').forEach(a => { a.href = CONTATO.instagram; });
$('#year').textContent = new Date().getFullYear();
$('.cta__in').classList.add('pnl');   // the CTA uses the same reveal as every text column

/* ring screens */
const ring = $('#ring');
const isWide = (i) => i % 3 === 1;
function screenContent(p, i, big) {
  const sc = document.createElement('div'); sc.className = big ? 'player__media' : 'sc'; sc.style.background = p.fundo; sc.style.color = p.texto;
  if (big && p.video) { const v = document.createElement('video'); Object.assign(v, { src: p.video, controls: true, autoplay: true, playsInline: true, loop: true }); v.setAttribute('playsinline', ''); sc.appendChild(v); return sc; }
  const top = document.createElement('div'); top.className = 'r m'; top.innerHTML = `<span>CH ${String(i + 1).padStart(2, '0')}</span><span>●</span>`;
  const h = document.createElement('h4'); h.innerHTML = p.chamada;   // chamada comes from our own config
  const bot = document.createElement('div'); bot.className = 'r m'; bot.innerHTML = '<span></span><span>00:15</span>'; bot.firstChild.textContent = p.nome;
  sc.append(top, h);
  if (big) { const s = document.createElement('span'); s.className = 'player__soon m'; s.textContent = '▶ Vídeo em breve'; sc.appendChild(s); }
  sc.appendChild(bot); return sc;
}
// the screens themselves are drawn in 3D by js/ring3d.js (see "05 telas" below)

/* enlarged screen (player) */
const player = $('#player'), pFrame = $('#playerFrame');
let playerFrom = null;
function openPlayer(p, i, fromEl) {
  playerFrom = fromEl;
  pFrame.className = 'player__frame ' + (isWide(i) ? 'h' : 'v');
  pFrame.textContent = ''; pFrame.appendChild(screenContent(p, i, true));
  $('#pCh').textContent = `CH ${String(i + 1).padStart(2, '0')} · No ar agora`;
  $('#pName').textContent = p.nome; $('#pSeg').textContent = p.segmento; $('#pTxt').textContent = p.info || '';
  player.hidden = false; document.body.style.overflow = 'hidden'; window.__lenisRef && window.__lenisRef.stop();
  if (window.gsap) {
    const a = fromEl.getBoundingClientRect(), b = pFrame.getBoundingClientRect();
    gsap.fromTo('#playerBg', { opacity: 0 }, { opacity: 1, duration: .5 });
    gsap.fromTo(pFrame, { x: a.left - b.left, y: a.top - b.top, scaleX: a.width / b.width, scaleY: a.height / b.height }, { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: .9, ease: 'expo.inOut' });
    gsap.fromTo('#playerInfo > *', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .06, delay: .5, ease: 'power3.out' });
  }
  $('#playerClose').focus({ preventScroll: true });
}
function closePlayer() {
  const done = () => { player.hidden = true; pFrame.textContent = ''; document.body.style.overflow = ''; window.__lenisRef && window.__lenisRef.start(); };
  if (!window.gsap || !playerFrom) return done();
  const a = playerFrom.getBoundingClientRect(), b = pFrame.getBoundingClientRect();
  gsap.to('#playerInfo > *', { opacity: 0, duration: .25 });
  gsap.to(pFrame, { x: a.left - b.left, y: a.top - b.top, scaleX: a.width / b.width, scaleY: a.height / b.height, duration: .6, ease: 'expo.inOut' });
  gsap.to('#playerBg', { opacity: 0, duration: .5, delay: .2, onComplete: done });
}
$('#playerClose').addEventListener('click', closePlayer);
$('#playerBg').addEventListener('click', closePlayer);
addEventListener('keydown', e => { if (e.key === 'Escape' && !player.hidden) closePlayer(); });

/* history: chapters of the VHS tape (story → years → what comes next) */
const vhsChs = $('#vhsChs');
const chapScene = [
  `<canvas class="scene" data-scene="tv" data-ry="-0.5" data-oy=".5" data-zoom=".95" data-alpha=".5"></canvas>`,
  `<canvas class="scene" data-scene="wall"></canvas>`,
  `<canvas class="scene" data-scene="tv" data-kinds="totem,flat" data-ry="0.45" data-oy=".5" data-zoom="1.15" data-alpha=".5"></canvas>`,
];
const VHS = [];   // { date } per chapter, for the on-screen display
const vhsChap = (kicker, title, paras, sig, scene, date) => {
  const el = document.createElement('article'); el.className = 'vhs__ch' + (scene != null ? ' has-scene' : '');
  el.innerHTML = `<div class="vhs__txt"><span class="m vhs__k"></span><h3></h3><div class="vhs__p"></div>${sig ? '<span class="m vhs__sig"></span>' : ''}</div>${scene != null ? `<div class="vhs__art">${chapScene[scene] || chapScene[0]}</div>` : ''}`;
  $('.vhs__k', el).textContent = kicker; $('h3', el).textContent = title;
  paras.forEach(t => { const p = document.createElement('p'); p.textContent = t; $('.vhs__p', el).appendChild(p); });
  if (sig) $('.vhs__sig', el).textContent = sig;
  vhsChs.appendChild(el); VHS.push({ date });
};
vhsChap('REC ● A nossa história', HISTORIA_QUADRO.titulo, HISTORIA_QUADRO.texto, HISTORIA_QUADRO.assinatura, null, 'JAN 2025');
HISTORIA.forEach(h => vhsChap(h.ano, h.titulo, [h.texto], '', h.cena, h.ano));
vhsChap('NEXT ▶ Expectativas', HISTORIA_FUTURO.titulo, HISTORIA_FUTURO.texto, HISTORIA_FUTURO.assinatura, null, '2027 →');

/* ad packages (step 02 of "Como funciona") — a quiet comparison table, from config.js */
{
  const box = $('#pacotes');
  if (box) {
    const t = document.createElement('div'); t.className = 'ptab';
    const head = document.createElement('div'); head.className = 'ptab__row ptab__head'; head.appendChild(document.createElement('span'));
    PACOTES.planos.forEach((pl, i) => {
      const c = document.createElement('div'); c.className = 'ptab__plan' + (pl.destaque ? ' is-hot' : '');
      c.innerHTML = `<span class="ptab__k m"></span><b class="ptab__n"></b><span class="ptab__r"></span><span class="ptab__p"><small class="m">a partir de</small><strong></strong><em></em></span>`;
      $('.ptab__k', c).textContent = `PLANO ${String(i + 1).padStart(2, '0')}${pl.destaque ? '  ·  MAIS PROCURADO' : ''}`;
      $('.ptab__n', c).textContent = pl.nome; $('.ptab__r', c).textContent = pl.resumo;
      $('strong', c).textContent = pl.preco; $('em', c).textContent = pl.periodo;
      head.appendChild(c);
    });
    t.appendChild(head);
    PACOTES.linhas.forEach((ln, r) => {
      const row = document.createElement('div'); row.className = 'ptab__row';
      const k = document.createElement('span'); k.className = 'ptab__l'; k.textContent = ln; row.appendChild(k);
      PACOTES.planos.forEach(pl => { const v = document.createElement('span'); v.className = 'ptab__v' + (pl.destaque ? ' is-hot' : ''); v.textContent = pl.valores[r] ?? '—'; row.appendChild(v); });
      t.appendChild(row);
    });
    box.appendChild(t);
  }
}

/* numbers */
$('#nums').innerHTML = NUMEROS.map(n => `<div><b data-count="${n.valor}" data-from="${n.de || 0}" data-pre="${n.prefixo}" data-suf="${n.sufixo}">${n.prefixo}${n.de || 0}${n.sufixo}</b><span class="m g2">${n.rotulo}</span></div>`).join('');

/* timecode */
const tc = $('#tc'); const t0 = performance.now();
(function tick() { const f = Math.floor((performance.now() - t0) / 1000 * 30), p = n => String(n).padStart(2, '0');
  tc.textContent = `${p(Math.floor(f / 108000))}:${p(Math.floor(f / 1800) % 60)}:${p(Math.floor(f / 30) % 60)}:${p(f % 30)}`; requestAnimationFrame(tick); })();

initChat();
initScenes();

/* split words (manifesto) */
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          const o = document.createElement('span'); o.className = 'wd'; o.textContent = w; frag.appendChild(o);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el); return $$('.wd', el);
}

/* mobile menu */
const burger = $('#burger'), mnav = $('#mnav');
burger.addEventListener('click', () => { const o = burger.getAttribute('aria-expanded') !== 'true'; burger.setAttribute('aria-expanded', String(o)); mnav.classList.toggle('open', o); });
$$('#mnav a').forEach(a => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); mnav.classList.remove('open'); }));

/* particle TV (Three.js) */
const tvReady = (qs.has('notv') ? Promise.resolve({ createTV: () => null }) : import('./tv.js')).then(m => m.createTV($('#tv'))).then(t => { if (!t) document.documentElement.classList.add('no-webgl'); return t; })
  .catch(() => { document.documentElement.classList.add('no-webgl'); return null; });

const pctEl = $('#loaderPct'), barEl = $('#loaderBar');
const finishLoad = () => document.body.classList.remove('is-loading');

if (!hasGsap) {
  $('#loader').remove(); finishLoad(); $$('.pnl').forEach(p => p.classList.add('is-in'));
  tvReady.then(t => { if (t) { t.uniforms.uA.value = 1; t.uniforms.uB.value = 1; t.start(); } });
} else {
  gsap.registerPlugin(ScrollTrigger);
  runSite();
}

/* a horizontal track inside a sticky section: section height = viewport + sideways distance */
function horizontal(section, track, fadeIntro = true) {
  // the gallery holds still for a moment (so the intro is read whole), then slides; its intro fades as it leaves
  const dist = () => Math.max(0, track.scrollWidth - innerWidth), hold = () => innerHeight * .35;
  const size = () => { section.style.height = `${innerHeight + hold() + dist()}px`; };
  size(); ScrollTrigger.addEventListener('refreshInit', size);
  const tween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: section, start: () => `top+=${hold()} top`, end: 'bottom bottom', scrub: .8, invalidateOnRefresh: true } });
  const intro = track.firstElementChild;
  if (fadeIntro) gsap.to(intro, { opacity: 0, ease: 'none', scrollTrigger: { trigger: intro, containerAnimation: tween, start: 'left 5%', end: 'right 35%', scrub: true } });
  return { dist, tween };
}
/* stacked text columns that swap in place */
function stack(root) {
  const items = $$(':scope > .pnl', root); let cur = -1;
  return (k) => { if (k === cur) return; cur = k; items.forEach((p, i) => { const on = i === k; p.classList.toggle('is-on', on); if (!on) p.classList.remove('is-in'); });
    const el = items[k]; if (!el) return; void el.offsetWidth; el.classList.add('is-in'); };   // reflow, then reveal (mask) the new text
}

function runSite() {
  if (qs.has('skip')) gsap.globalTimeline.timeScale(60);

  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    lenis.stop(); window.__lenisRef = lenis;
    if (qs.has('skip')) window.__lenis = lenis;   // dev only
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return; const el = $(id); if (!el) return;
    e.preventDefault(); lenis ? lenis.scrollTo(el, { offset: 0, duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* every single text column reveals when its part arrives (and again when you come back) */
  $$('.pnl').forEach(p => { if (!p.closest('.pnl-stack')) p.classList.remove('is-in'); });
  $$('.pnl').forEach(p => {
    if (p.closest('.pnl-stack') || p.classList.contains('pnl--hero')) return;
    const sec = p.closest('section');
    ScrollTrigger.create({ trigger: p.closest('.perks__track, .hist__track') ? sec : (p.classList.contains('cta__in') ? sec : p), start: 'top 70%', onEnter: () => p.classList.add('is-in'), onLeaveBack: () => p.classList.remove('is-in') });
  });

  /* ---------- intro: static → logo → TV ---------- */
  const counter = { v: 0 };
  gsap.set(['#hdr', '.hero__meta'], { autoAlpha: 0 });
  tvReady.then(t => {
    const U = t && t.uniforms;
    if (t) t.start();
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, onComplete: () => { gsap.globalTimeline.timeScale(1); finishLoad(); lenis && lenis.start(); ScrollTrigger.refresh(); } });
    tl.to(counter, { v: 100, duration: reduce ? .3 : 3.4, ease: 'power1.inOut', onUpdate: () => { pctEl.textContent = Math.round(counter.v) + '%'; barEl.style.width = counter.v + '%'; } }, 0);
    if (U && !reduce) {
      tl.to(U.uA, { value: 1, duration: 1.3 }, .9)
        .to(U.uB, { value: 1, duration: 1.8, ease: 'power3.inOut' }, 2.7)
        .fromTo(t.base, { rot: -.9 }, { rot: .62, duration: 2.2, ease: 'power3.out' }, 2.7);
    } else if (U) { U.uA.value = 1; U.uB.value = 1; }
    if (U && qs.has('logo')) { tl.pause(); U.uA.value = 1; U.uB.value = 0; }
    tl.to('#loader', { autoAlpha: 0, duration: .6 }, reduce ? .3 : 3.4)
      .add(() => $('.pnl--hero').classList.add('is-in'), reduce ? .3 : 3.5)
      .to(['#hdr', '.hero__meta'], { autoAlpha: 1, duration: .9, stagger: .08 }, reduce ? .4 : 3.9);
    if (U) {
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 1 } })
        .fromTo(U.uScatter, { value: 0 }, { value: 1.6, ease: 'power2.in', duration: .7, immediateRender: false }, 0)
        .fromTo(t.base, { rot: .62 }, { rot: 1.6, ease: 'none', immediateRender: false }, 0)
        .fromTo(U.uFade, { value: 1 }, { value: 0, ease: 'power1.inOut', duration: .45, immediateRender: false }, .2)
        .to({}, { duration: .3 });
      ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onToggle: s => s.isActive ? t.start() : t.stop() });
    }
  });
  // title exit: "Comunicação que se vê" turns into particles as you scroll (js/dust.js)
  const dust = !reduce && $('#heroDust') ? createDust($('#heroTitle'), $('#heroDust')) : null, dustP = { v: 0 };
  if (dust) addEventListener('resize', () => { dust.reset(); dust.update(dustP.v); });
  // 1) the other texts of the block vanish  2) the title glides to the middle of the block  3) it turns into particles
  const heroPnl = $('.pnl--hero'), heroTtl = $('#heroTitle');
  const toCentre = () => { const p = heroPnl.getBoundingClientRect(), t = heroTtl.getBoundingClientRect(), y = +gsap.getProperty(heroTtl, 'y') || 0;
    return (p.top + p.height / 2) - (t.top - y + t.height / 2); };
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true } })
    .fromTo(heroPnl, { '--fo': 1 }, { '--fo': 0, ease: 'power1.out', duration: .09, immediateRender: false }, 0)
    .fromTo(heroTtl, { y: 0 }, { y: toCentre, ease: 'power2.inOut', duration: .14, immediateRender: false }, .01)
    .fromTo(dustP, { v: 0 }, { v: 1, ease: 'none', duration: .72, immediateRender: false, onUpdate: () => dust && dust.update(dustP.v) }, .14)
    .to('.hero__meta', { opacity: 0, duration: .4 }, 0)
    .to({}, { duration: .3 });

  /* header · nav · HUD chapters and rail */
  const chaps = $$('[data-chap]');
  const ticks = $('#railTicks');
  chaps.forEach((s, i) => { const t = document.createElement('i'); t.style.top = `${(i / (chaps.length - 1)) * 100}%`; ticks.appendChild(t); });
  const tickEls = $$('i', ticks);
  chaps.forEach((s, i) => {
    const [n, name] = s.dataset.chap.split('|');
    const set = () => { $('#hudN').textContent = n; $('#hudName').textContent = name; tickEls.forEach((t, k) => t.classList.toggle('on', k <= i)); };
    ScrollTrigger.create({ trigger: s, start: 'top 50%', end: 'bottom 50%', onEnter: set, onEnterBack: set });
  });
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => {
    $('#railFill').style.transform = `scaleY(${s.progress})`;
    // first screen: full header · after it: only the menu button (three lines) stays
    // (it folds as soon as the title exit starts)
    $('#hdr').classList.toggle('is-compact', s.scroll() > ($('.hero').offsetHeight - innerHeight) * .02);
  } });
  // also on any scroll (e.g. the page reloaded half-way down), so the header is never stuck open below the first screen
  addEventListener('scroll', () => $('#hdr').classList.toggle('is-compact', scrollY > ($('.hero').offsetHeight - innerHeight) * .02), { passive: true });
  // the section on screen lights its link — inside a list, the list's button lights up too
  const dds = $$('.nav__dd');
  $$('.nav a[href^="#"]').forEach(a => { const sec = $(a.getAttribute('href')); if (sec) ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => {
    a.classList.toggle('on', s.isActive); dds.forEach(d => d.classList.toggle('on', !!d.querySelector('a.on'))); } }); });
  // lists: open on hover (computer) or on tap/click; close after choosing a section, on Esc or clicking elsewhere
  dds.forEach(d => {
    const b = $('.nav__btn', d), set = (o) => { d.classList.toggle('open', o); b.setAttribute('aria-expanded', String(o)); };
    b.addEventListener('click', () => { const o = !d.classList.contains('open'); dds.forEach(x => x !== d && x.classList.remove('open')); set(o); });
    d.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) { dds.forEach(x => { if (x !== d) { x.classList.remove('open'); $('.nav__btn', x).setAttribute('aria-expanded', 'false'); } }); set(true); } });
    d.addEventListener('mouseleave', () => set(false));
    $$('a', d).forEach(a => a.addEventListener('click', () => { set(false); b.blur(); a.blur(); }));
  });
  document.addEventListener('click', e => { if (!e.target.closest('.nav__dd')) dds.forEach(d => d.classList.remove('open')); });
  addEventListener('keydown', e => { if (e.key === 'Escape') dds.forEach(d => d.classList.remove('open')); });

  /* ---------- intertitles: giant words cross the screen in opposite directions ---------- */
  $$('.inter').forEach(sec => {
    gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: .6 } })
      .fromTo($('.inter__a', sec), { x: () => innerWidth * .45 }, { x: () => -innerWidth * .55, ease: 'none' }, 0)
      .fromTo($('.inter__b', sec), { x: () => -innerWidth * .45 }, { x: () => innerWidth * .4, ease: 'none' }, 0);
  });

  /* ---------- 02 manifesto: words light up ---------- */
  const words = splitWords($('#manifesto'));
  words.forEach(w => { if (w.closest('.k')) w.classList.add('hl'); });
  gsap.to(words, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.mani', start: 'top 30%', end: 'bottom bottom', scrub: true } });
  gsap.from('.facts > div', { y: 24, opacity: 0, stagger: .08, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.mani', start: 'top 20%' } });

  /* ---------- 03 totem: frames follow the scroll; the text column swaps in place ---------- */
  {
    const FRAMES = 190, seq = $('#totemSeq'), sx = seq.getContext('2d'), imgs = new Array(FRAMES), stage = $('.totem__stage');
    let want = 0, drawn = -1;
    const src = (i) => `assets/totem/f${String(i).padStart(3, '0')}.webp`;
    function sizeSeq() { const r = stage.getBoundingClientRect(), d = Math.min(devicePixelRatio, 2); seq.width = r.width * d; seq.height = r.height * d; drawn = -1; draw(); }
    function draw() {
      let i = want; while (i > 0 && !(imgs[i] && imgs[i].complete && imgs[i].naturalWidth)) i--;
      const im = imgs[i]; if (!im || !im.naturalWidth || i === drawn) return; drawn = i;
      const W = seq.width, H = seq.height, s = Math.min(W / im.naturalWidth, H / im.naturalHeight);
      sx.clearRect(0, 0, W, H);
      sx.drawImage(im, (W - im.naturalWidth * s) / 2, (H - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
    }
    const load = (i) => new Promise(res => { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => { res(); if (Math.abs(i - want) < 3) { drawn = -1; draw(); } }; im.src = src(i); imgs[i] = im; });
    load(0).then(() => { sizeSeq(); (async () => { for (let i = 1; i < FRAMES; i += 6) await Promise.all(Array.from({ length: 6 }, (_, k) => i + k < FRAMES && load(i + k))); })(); });
    addEventListener('resize', sizeSeq);
    // the animation now plays on its own like a video (it no longer follows the scroll): it runs while the section is
    // on screen and stops when you leave it. The scroll still moves the texts and the progress bar.
    // If assets/totem/totem.mp4 exists, that video (with sound, via the button) plays instead of the frames.
    const tvid = $('#totemVid'), tsnd = $('#totemSnd');
    let useVid = false, onScreen = false, raf = 0, t0 = 0;
    tvid.addEventListener('loadeddata', () => { useVid = true; tvid.hidden = false; seq.hidden = true; tsnd.hidden = false; if (onScreen) tvid.play().catch(() => {}); }, { once: true });
    tvid.src = 'assets/totem/totem.mp4';
    tsnd.addEventListener('click', () => { tvid.muted = !tvid.muted; tsnd.textContent = tvid.muted ? '🔊 Ativar som' : '🔇 Tirar som'; tvid.play().catch(() => {}); });
    const FPS = 24, frameLoop = (now) => {
      raf = requestAnimationFrame(frameLoop);
      const n = Math.floor((now - t0) / 1000 * FPS) % (FRAMES * 2 - 2);   // plays forward, then back (opens and closes)
      want = n < FRAMES ? n : FRAMES * 2 - 2 - n; draw();
    };
    const play = () => { if (onScreen) return; onScreen = true; if (useVid) tvid.play().catch(() => {}); else { t0 = performance.now() - (want / FPS) * 1000; raf = requestAnimationFrame(frameLoop); } };
    const pause = () => { if (!onScreen) return; onScreen = false; tvid.pause(); cancelAnimationFrame(raf); };
    ScrollTrigger.create({ trigger: '.totem', start: 'top 85%', end: 'bottom 15%', onToggle: t => t.isActive ? play() : pause() });
    const setK = stack($('.totem .pnl-stack'));
    ScrollTrigger.create({ trigger: '.totem', start: 'top 60%', end: 'bottom bottom', onEnter: () => setK(0) });
    ScrollTrigger.create({ trigger: '.totem', start: 'top top', end: 'bottom bottom', scrub: .6, onUpdate: s => {
      setK(Math.min(2, Math.floor(s.progress * 3 + .02)));
      $('#totemBar').style.transform = `scaleX(${s.progress})`;
    } });
  }

  /* ---------- 04 vantagens: horizontal gallery, cards rise in as they arrive ---------- */
  {
    // optional picture inside each card: drop assets/vantagens/anunciante-01.webp (or .jpg/.png) etc. — missing files are simply skipped
    let perkTween = null; const waiting = [];
    // the picture rises from the bottom edge of its own frame (it never comes from outside the card)
    const rise = (im, card) => gsap.fromTo(im, { yPercent: 105, scale: 1.25 }, { yPercent: 0, scale: 1, ease: 'power2.out',
      scrollTrigger: { trigger: card, containerAnimation: perkTween, start: 'left 105%', end: 'left 45%', scrub: .8 } });
    $$('.perk[data-img]').forEach(card => {
      const tryExt = (list) => { if (!list.length) return; const im = new Image(); im.className = 'perk__img'; im.alt = ''; im.decoding = 'async';
        im.onload = () => { card.classList.add('has-img'); const fr = document.createElement('div'); fr.className = 'perk__frame'; fr.appendChild(im); card.insertBefore(fr, card.children[1]);
          perkTween ? rise(im, card) : waiting.push([im, card]); };
        im.onerror = () => tryExt(list.slice(1)); im.src = `${card.dataset.img}.${list[0]}`; };
      tryExt(['webp', 'jpg', 'png']);
    });
    const { tween } = horizontal($('.perks'), $('#perksTrack'), false);   // the intro text is pushed off to the left with the cards (no fade)
    perkTween = tween; waiting.forEach(([im, card]) => rise(im, card)); ScrollTrigger.refresh();
    $$('.perk').forEach(p => gsap.from(p, { y: 60, opacity: 0, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 100%', end: 'left 70%', scrub: true } }));
    gsap.to('#perksBar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.perks', start: 'top top', end: 'bottom bottom', scrub: true } });
  }

  /* ---------- 05 telas: 3D ring of glass screens (js/ring3d.js) ---------- */
  {
    const label = $('#ringLabel'), spnl = $$('.screens .pnl > *');
    import('./ring3d.js').then(m => m.createRing3D({
      stage: $('#ringStage'), items: PARCEIROS, isWide,
      onActive: (i) => { label.textContent = `${String(i + 1).padStart(2, '0')} — ${PARCEIROS[i].nome}`; },
      onOpen: (i, r) => openPlayer(PARCEIROS[i], i, { getBoundingClientRect: () => r }),
      onZoom: (z) => {   // as soon as the camera starts moving in, the title block slides up and is gone (never over the screens)
        const k = Math.min(1, z * 3.5), o = (1 - k).toFixed(3), y = `translateY(${(-k * 90).toFixed(1)}px)`;
        spnl.forEach(e => { e.style.transition = z > .001 ? 'none' : ''; e.style.opacity = z > .001 ? o : ''; if (!e.classList.contains('now')) e.style.transform = y; e.style.visibility = k >= 1 ? 'hidden' : ''; });
      },   // title steps aside while the camera is close
    })).then(r3 => {
      if (!r3) return;
      ScrollTrigger.create({ trigger: '.screens', start: 'top top', end: 'bottom bottom', scrub: true, onUpdate: s => r3.setScroll(s.progress) });
      ScrollTrigger.create({ trigger: '.screens', start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? r3.start() : r3.stop() });
    }).catch(() => {});
  }

  /* ---------- 06 equipe: cards rise in one after another + colour spotlight under the mouse ---------- */
  // the photos rise one at a time as you scroll, starting with the last one (Caio), then the middle, then the first
  {
    // smooth: shorter rise, softer easing, heavier scroll smoothing and overlapping entrances
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.team__grid', start: 'top 100%', end: 'top 20%', scrub: 1.6 } });
    [...document.querySelectorAll('.member')].reverse().forEach((m, k) => tl.fromTo(m.children, { y: 70, opacity: 0 }, { y: 0, opacity: 1, ease: 'sine.out', duration: 1.4, stagger: .2 }, k * .6));
  }
  $$('.member').forEach((m, i) => gsap.fromTo(m, { y: 40 * (i - 1) }, { y: -40 * (i - 1), ease: 'none', scrollTrigger: { trigger: '.team', start: 'top bottom', end: 'bottom top', scrub: true } }));
  $$('.member__pic').forEach(pic => {
    pic.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = pic.getBoundingClientRect();
      pic.style.setProperty('--mx', `${e.clientX - r.left}px`); pic.style.setProperty('--my', `${e.clientY - r.top}px`);
      pic.classList.add('is-hover');
    });
    pic.addEventListener('pointerleave', () => pic.classList.remove('is-hover'));
    pic.addEventListener('click', () => { if (touch) pic.classList.toggle('is-on'); });
  });

  /* ---------- 07 história: a VHS tape — the scroll plays it chapter by chapter, with tracking noise at each cut ---------- */
  {
    const chs = $$('.vhs__ch'), n = chs.length, screen = $('#vhsScreen'), track = $('#vhsTrack');
    const mode = $('#vhsMode'), date = $('#vhsDate'), tc = $('#vhsTc');
    let cur = -1, idle = 0;
    const show = (i) => { if (i === cur) return; if (cur >= 0) sfx('tape'); cur = i; chs.forEach((c, k) => c.classList.toggle('is-on', k === i)); date.textContent = VHS[i].date; };
    show(0);
    ScrollTrigger.create({ trigger: '.hist', start: 'top top', end: 'bottom bottom', onUpdate: s => {
      const cp = s.progress * n, i = Math.min(n - 1, Math.floor(cp)), b = Math.round(cp);
      show(i);
      // tracking noise around each cut between chapters
      const d = cp - b, k = b > 0 && b < n ? Math.max(0, 1 - Math.abs(d) / .09) : 0;
      track.style.opacity = k.toFixed(3); track.style.top = `${((d + .09) / .18 * 110 - 10).toFixed(1)}%`;
      screen.style.setProperty('--glitch', k.toFixed(3));
      screen.style.setProperty('--jx', `${((Math.random() - .5) * 14 * k).toFixed(1)}px`);
      const secs = Math.floor(s.progress * 754); tc.textContent = `0:${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
      mode.textContent = s.direction < 0 ? '◀◀ REW' : '▶ PLAY';
      clearTimeout(idle); idle = setTimeout(() => { mode.textContent = '❚❚ PAUSE'; }, 900);
    } });
    gsap.to('#histBar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.hist', start: 'top top', end: 'bottom bottom', scrub: true } });
  }

  /* ---------- 08 formatos: the screen turns; the text column swaps A → B ---------- */
  {
    const fs = $('#fmtScreen'), setK = stack($('.fmt .pnl-stack'));
    ScrollTrigger.create({ trigger: '.fmt', start: 'top 60%', onEnter: () => setK(0) });
    // three moments, all with the same morph: H (colour bars) → V (colour bars, holds) → C: the totem grows and the
    // ad video fades in. The video plays in a loop WITH sound while moment C is on screen, pauses when you scroll away
    // and resumes from where it stopped when you come back.
    const fsec = $('.fmt'), vid = $('#fmtVideo'), snd = $('#fmtSnd');
    // two screens in moment C: the totem and the lying screen on the left wall. Only ONE has sound at a time:
    // turning on the sound of one stops the other. Default: the totem has the sound, the wall screen plays silently.
    const wvid = $('#fmtWallVid'), wsnd = $('#fmtWallSnd');
    let inC = false, audio = 'totem', wallOk = false, picked = false;   // picked: the visitor chose which screen speaks
    wvid.addEventListener('loadeddata', () => { wallOk = true; $('#fmtWallSoon').hidden = true; wvid.classList.add('ok'); if (inC) apply(); }, { once: true });
    wvid.src = 'assets/formatos/tela2.mp4';
    const start = (v, btn) => { v.muted = false; v.play().catch(() => { v.muted = true; v.play().catch(() => {}); btn.hidden = false; }); };
    const apply = () => {
      if (!inC) return;
      if (audio === 'totem' || !wallOk) {
        start(vid, snd); snd.hidden = true;
        if (wallOk) { wvid.muted = true; if (picked) wvid.pause(); else wvid.play().catch(() => {}); } wsnd.hidden = !wallOk;   // before any choice the wall plays silently; after it, the other one stops
      } else {
        vid.pause(); snd.hidden = false;                       // the totem stops while the wall screen speaks
        start(wvid, wsnd); wsnd.hidden = true;
      }
    };
    const playVid = () => { if (inC) return; inC = true; apply(); };
    const stopVid = () => { if (!inC) return; inC = false; vid.pause(); wvid.pause(); };
    snd.addEventListener('click', () => { audio = 'totem'; picked = true; apply(); });
    wsnd.addEventListener('click', () => { audio = 'wall'; picked = true; apply(); });
    // running time next to the equaliser, following the video
    const tc = $('#fmtTc'), mmss = t => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    vid.addEventListener('timeupdate', () => { tc.textContent = `${mmss(vid.currentTime)} / ${mmss(vid.duration || 0)}`; });
    vid.addEventListener('loadedmetadata', () => { tc.textContent = `00:00 / ${mmss(vid.duration)}`; });
    const wV = () => mobile() ? Math.min(innerWidth * .42, 240, innerHeight * .3) : Math.min(innerWidth * .26, 420, innerHeight * .7 * 9 / 16);
    const wC = () => mobile() ? Math.min(innerWidth * .5, 290, innerHeight * .36) : Math.min(innerWidth * .28, 460, innerHeight * .76 * 9 / 16);
    gsap.timeline({ scrollTrigger: { trigger: '.fmt', start: 'top top', end: 'bottom bottom', scrub: 1, invalidateOnRefresh: true,
      onUpdate: s => { const c = s.progress > .7; setK(c ? 2 : s.progress > .3 ? 1 : 0); fsec.classList.toggle('is-ad', c); c && s.isActive ? playVid() : stopVid(); },
      onLeave: stopVid, onLeaveBack: stopVid } })
      // bigger screens: horizontal ≈ half the page width, vertical ≈ 70% of the page height
      .fromTo(fs, { width: () => mobile() ? Math.min(innerWidth * .86, 520, innerHeight * .5 * 16 / 9) : Math.min(innerWidth * .45, 860, innerHeight * .62 * 16 / 9), aspectRatio: '16 / 9' },
        { width: wV, aspectRatio: '9 / 16', ease: 'power2.inOut', duration: 1 }, .3)
      // the same kind of transformation into moment C: the totem grows while the video fades in over the colour bars
      .fromTo(fs, { width: wV }, { width: wC, ease: 'power2.inOut', duration: 1, immediateRender: false }, 1.9)
      .fromTo('#fmtAd', { opacity: 0 }, { opacity: 1, ease: 'power1.inOut', duration: .7, immediateRender: false }, 2.05)
      .to({}, { duration: .3 });
    ScrollTrigger.create({ trigger: '.fmt', start: 'top bottom', end: 'bottom top', onToggle: t => { if (!t.isActive) stopVid(); } });
  }

  /* ---------- 09 como funciona: a signal runs along the line; each station lights up and its step comes in ---------- */
  {
    const sts = $$('.how2__st'), steps = $$('.how2__step'), fill = $('#howFill'), pulse = $('#howPulse');
    let cur = -1;
    const go = (k) => { if (k === cur) return; cur = k;
      sts.forEach((el, i) => { el.classList.toggle('on', i <= k); el.classList.toggle('cur', i === k); });
      steps.forEach((el, i) => { el.classList.toggle('is-on', i === k); el.classList.toggle('is-past', i < k); }); };
    ScrollTrigger.create({ trigger: '.how', start: 'top 60%', onEnter: () => { $('.how2__head').classList.add('is-in'); go(0); } });
    ScrollTrigger.create({ trigger: '.how', start: 'top top', end: 'bottom bottom', onUpdate: s => {
      const p = s.progress, k = Math.min(2, Math.floor(p * 3));
      // the signal reaches station 1 at p = 0, station 2 at 1/3, station 3 at 2/3, and rests there
      const f = Math.min(1, p * 1.5); fill.style.transform = `scaleX(${f.toFixed(4)})`; pulse.style.left = `${(f * 100).toFixed(2)}%`;
      go(k); $('.how').classList.toggle('is-plan', k === 1);   // step 02: texts get smaller so the plans fit (the page doesn't move)
    } });
  }
  $$('[data-count]').forEach((b, k) => {
    const from = +b.dataset.from, end = +b.dataset.count, o = { v: from };
    const show = () => { b.textContent = b.dataset.pre + Math.round(o.v) + b.dataset.suf; };
    const run = () => gsap.fromTo(o, { v: from }, { v: end, duration: 2.2, delay: k * .12, ease: 'power3.out', onUpdate: show });
    ScrollTrigger.create({ trigger: '#nums', start: 'top 90%', end: 'bottom top', onEnter: run, onEnterBack: run });
    gsap.from(b.parentElement, { y: 30, opacity: 0, duration: 1, delay: k * .1, ease: 'power3.out', scrollTrigger: { trigger: '#nums', start: 'top 90%' } });
  });

  /* ---------- 10 map ---------- */
  const map = createMap($('#map'));
  ScrollTrigger.create({ trigger: '.find', start: 'top 85%', end: 'center center', scrub: true, onUpdate: s => map.setProgress(s.progress) });
  ScrollTrigger.create({ trigger: '.find', start: 'top bottom', end: 'bottom top', onToggle: s => s.isActive ? map.start() : map.stop() });

  /* ---------- 11 finale: "Sua marca no ar" comes down one piece at a time, out of a soft blur, following the scroll ---------- */
  {
    const items = [$('.cta__in .eye'), ...$$('.ttl--cta .ttl__in'), $('.cta__in .acts')];
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.cta', start: 'top 92%', end: 'top 12%', scrub: 1.6 } });
    items.forEach((el, k) => tl.fromTo(el, { y: -54, opacity: 0, filter: 'blur(12px)', scale: 1.04 },
      { y: 0, opacity: 1, filter: 'blur(0px)', scale: 1, ease: 'sine.out', duration: 1 }, k * .55));
  }

  // last screen: hide the chapter label ("11 — No ar") so the page ends clean on the final frame
  ScrollTrigger.create({ trigger: '.cta', start: 'top 55%', onToggle: t => $('.hud').classList.toggle('is-end', t.isActive), end: 'max' });

  /* ---------- 11 CTA: circular (iris) reveal ---------- */
  gsap.fromTo('#ctaIris', { clipPath: 'circle(14% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'top 15%', scrub: true } });

  /* ---------- colour curtain between chapters (not where a giant intertitle already makes the cut) ---------- */
  {
    const wa = $('.wipe__a'), wb = $('.wipe__b'), wt = $('#wipeT');
    const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
    // TV channel display (OSD) between sections: like changing the channel on an old TV, "CH 03 · Por que funciona"
    // shows up in the top-left corner in green, glowing, then fades. It sits in a corner, away from texts and images.
    wb.style.clipPath = 'inset(100% 0 0 0)'; wt.style.opacity = 0; wa.style.clipPath = 'none';
    const osd = document.createElement('div'); osd.className = 'osd m'; osd.setAttribute('aria-hidden', 'true');
    osd.innerHTML = '<b></b><span></span>'; document.body.appendChild(osd);
    const ease = t => t * t * (3 - 2 * t);
    const render = (p, top = innerHeight) => {
      osd.style.transform = `translateY(${Math.max(0, top - osd.offsetHeight - 22).toFixed(1)}px)`;   // rides just above the incoming section, bottom-left, in the empty gap
      const k = ease(seg(p, .05, .2)) * (1 - ease(seg(p, .75, .95)));
      osd.style.opacity = (k * (p < .2 ? (Math.sin(p * 160) > -.3 ? 1 : .35) : 1)).toFixed(3);   // a little flicker as it tunes in
    };
    render(0);
    ['.totem', '.perks', '.screens', '.team', '.fmt', '.how', '.find'].forEach(sel => {
      const sec = $(sel); if (!sec) return;
      const [n, name] = sec.dataset.chap.split('|');
      const label = () => { $('b', osd).textContent = `CH ${n}`; $('span', osd).textContent = name; };
      ScrollTrigger.create({ trigger: sec, start: 'top 85%', end: 'top 15%', onEnter: label, onEnterBack: label,
        onUpdate: s => render(s.progress, sec.getBoundingClientRect().top), onLeave: () => render(1), onLeaveBack: () => render(0) });
    });
  }

  /* cursor + magnetic buttons */
  if (!touch) {
    document.documentElement.classList.add('has-cursor');
    const cur = $('.cursor'), dot = $('.cursor__dot'), ringC = $('.cursor__ring');
    const xd = gsap.quickTo(dot, 'x', { duration: .08 }), yd = gsap.quickTo(dot, 'y', { duration: .08 });
    const xr = gsap.quickTo(ringC, 'x', { duration: .1, ease: 'power3' }), yr = gsap.quickTo(ringC, 'y', { duration: .1, ease: 'power3' });   // the arrow stays glued to the pointer
    document.addEventListener('pointerleave', () => cur.classList.remove('on'));
    addEventListener('pointermove', e => { cur.classList.add('on'); xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY); });
    addEventListener('scroll', () => cur.classList.remove('on'), { passive: true });   // hidden while scrolling; back as soon as the mouse moves
    document.addEventListener('pointerover', e => {
      cur.classList.toggle('is-link', !!e.target.closest('a,button,input'));
      const play = !!e.target.closest('.card'); cur.classList.toggle('is-play', play); if (play) cur.classList.remove('is-link');
    });
    $$('.magnetic').forEach(b => {
      const xm = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), ym = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); xm((e.clientX - r.left - r.width / 2) * .3); ym((e.clientY - r.top - r.height / 2) * .4); });
      b.addEventListener('pointerleave', () => { xm(0); ym(0); });
    });
  }

  /* "Dúvidas?" stops right above the footer */
  {
    const chat = $('#chat'), ftr = $('.ftr');
    const park = () => { const over = innerHeight - ftr.getBoundingClientRect().top; chat.style.transform = over > 0 ? `translateY(${-over}px)` : ''; };
    ScrollTrigger.create({ trigger: ftr, start: 'top bottom', end: 'bottom bottom', onUpdate: park, onLeave: park, onLeaveBack: () => { chat.style.transform = ''; }, onRefresh: park });
    addEventListener('resize', park);
  }

  /* background light rays (and the wave at the end) */
  if (!qs.has('notv')) import('./bg.js').then(({ createBG }) => {
    const bg = createBG($('#bg')); if (!bg) return;
    const parse = (s) => Object.fromEntries((s || '').split(',').filter(Boolean).map(kv => { const [k, v] = kv.split(':'); return [k.trim(), +v]; }));
    $$('[data-bg]').forEach(sec => ScrollTrigger.create({ trigger: sec, start: 'top 60%', end: 'bottom 40%', onEnter: () => bg.set(parse(sec.dataset.bg)), onEnterBack: () => bg.set(parse(sec.dataset.bg)), onLeave: () => bg.set({}), onLeaveBack: () => bg.set({}) }));
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: s => bg.scroll(s.progress, s.getVelocity() / 6000) });
    bg.start();
    if (qs.has('skip')) window.__bg = bg;
  });

  addEventListener('load', () => ScrollTrigger.refresh());
}

