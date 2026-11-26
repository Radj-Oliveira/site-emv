/* EMV — sound effect for the VHS chapters in "Nossa história", synthesised live (Web Audio API): no files, no licences.
   Browsers only allow sound after the visitor's first click/tap/key, so the effects start from there.
   Kept quiet and short on purpose; each sound has a minimum gap so it never piles up. */

let ctx = null, out = null, noise = null, armed = false;
const last = {};

function boot() {
  if (ctx) return;
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  out = ctx.createGain(); out.gain.value = .9;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4;
  out.connect(comp).connect(ctx.destination);
  noise = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
  const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}
const arm = () => { armed = true; boot(); ctx && ctx.state === 'suspended' && ctx.resume(); };
['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, arm, { passive: true }));

/* --- building blocks --- */
function tone(type, f0, f1, dur, vol, t = 0) {
  const s = ctx.currentTime + t, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, s); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, s + dur);
  g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(vol, s + .006); g.gain.exponentialRampToValueAtTime(.0001, s + dur);
  o.connect(g).connect(out); o.start(s); o.stop(s + dur + .02);
}
function hiss(dur, vol, fType, f0, f1, q = 1, t = 0) {
  const s = ctx.currentTime + t, src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noise; src.loop = true; f.type = fType; f.Q.value = q;
  f.frequency.setValueAtTime(f0, s); f.frequency.exponentialRampToValueAtTime(f1, s + dur);
  g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(vol, s + Math.min(.03, dur / 3)); g.gain.exponentialRampToValueAtTime(.0001, s + dur);
  src.connect(f).connect(g).connect(out); src.start(s, Math.random() * .5); src.stop(s + dur + .02);
}

/* --- the sound: only in "Nossa história" — the VHS tape passing from one chapter to the next.
   Built to be clearly different from the music: a mechanical click, a burst of tape hiss that sweeps
   (like the tracking band crossing the screen) and a low motor wobble. --- */
const SOUNDS = {
  tape: { gap: 250, play: () => {
    tone('square', 180, 110, .045, .05);                         // "chk" of the tape head
    hiss(.5, .07, 'bandpass', 4200, 700, 1.4, .02);              // "shhhh" sweeping down with the tracking band
    hiss(.42, .035, 'highpass', 6000, 3000, .7, .04);            // fine crackle on top
    tone('sawtooth', 62, 55, .45, .03, .03);                     // motor wobble underneath
  } },
};

export function sfx(name) {
  if (!armed || !ctx || ctx.state !== 'running') return;
  const s = SOUNDS[name]; if (!s) return;
  const now = performance.now(); if (now - (last[name] || 0) < s.gap) return; last[name] = now;
  try { s.play(); } catch (e) { /* never break the page for a sound */ }
}
