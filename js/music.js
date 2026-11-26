/* EMV — original background music, generated live in the browser (Web Audio API).
   No audio file, no sample, no third-party track: every note is synthesised here, so there are
   no copyright or licensing issues. Style: calm "tech ambient" — warm pad, soft arpeggio with echo,
   deep sub bass and a light shaker. It only starts when the visitor clicks the "Som" button. */

const BPM = 92, STEP = 60 / BPM / 4;                 // 16th-note length in seconds
// A-minor progression (Am9 · Fmaj7 · Cmaj7 · G6), 2 bars each — MIDI note numbers
const CHORDS = [
  { root: 45, pad: [57, 60, 64, 67, 71] },   // Am9
  { root: 41, pad: [53, 57, 60, 64, 67] },   // Fmaj7(9)
  { root: 48, pad: [55, 60, 64, 67, 71] },   // Cmaj7
  { root: 43, pad: [55, 59, 62, 64, 67] },   // G6
];
const ARP = [0, 2, 1, 3, 2, 4, 3, 1, 0, 2, 4, 3, 1, 2, 3, 4];   // pattern over the chord tones
const hz = (n) => 440 * Math.pow(2, (n - 69) / 12);

export function createMusic() {
  let ctx = null, master, bus, verb, delay, timer = 0, step = 0, next = 0, playing = false;

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);
    bus = ctx.createGain(); bus.gain.value = 1; bus.connect(master);
    // reverb: generated impulse (decaying noise) — nothing downloaded
    verb = ctx.createConvolver();
    const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb.buffer = ir; const vg = ctx.createGain(); vg.gain.value = .42; verb.connect(vg).connect(master);
    // echo (dotted eighth) for the arpeggio
    delay = ctx.createDelay(1); delay.delayTime.value = STEP * 3;
    const fb = ctx.createGain(); fb.gain.value = .32; const dg = ctx.createGain(); dg.gain.value = .35;
    delay.connect(fb).connect(delay); delay.connect(dg).connect(master); dg.connect(verb);
  }

  /* --- instruments --- */
  function pad(notes, t, dur) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = .7;
    f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(1500, t + dur * .5); f.frequency.linearRampToValueAtTime(600, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + 1.6); g.gain.setValueAtTime(.05, t + dur - 1.2); g.gain.linearRampToValueAtTime(0, t + dur + .8);
    f.connect(g); g.connect(bus); g.connect(verb);
    notes.forEach(n => [-7, 7].forEach(det => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(n); o.detune.value = det;
      o.connect(f); o.start(t); o.stop(t + dur + 1);
    }));
  }
  function pluck(n, t, vel) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(n);
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(600, t + .35);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.055 * vel, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + .5);
    o.connect(f).connect(g); g.connect(bus); g.connect(delay); g.connect(verb);
    o.start(t); o.stop(t + .55);
  }
  function sub(n, t, dur) {
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = hz(n - 12);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .08); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(bus); o.start(t); o.stop(t + dur + .05);
  }
  let noiseBuf = null;
  function shaker(t, vel) {
    if (!noiseBuf) { noiseBuf = ctx.createBuffer(1, ctx.sampleRate * .2, ctx.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = ctx.createGain(); g.gain.setValueAtTime(.018 * vel, t); g.gain.exponentialRampToValueAtTime(.0001, t + .06);
    s.connect(f).connect(g).connect(bus); s.start(t); s.stop(t + .07);
  }

  /* --- sequencer (schedules a little ahead so timing stays tight) --- */
  function schedule() {
    while (next < ctx.currentTime + .15) {
      const bar = Math.floor(step / 16), inBar = step % 16, ch = CHORDS[Math.floor(bar / 2) % CHORDS.length];
      if (inBar === 0 && bar % 2 === 0) pad(ch.pad, next, STEP * 32);
      if (inBar === 0 || inBar === 10) sub(ch.root, next, STEP * (inBar === 0 ? 9 : 5));
      if (bar >= 2) {                                   // arpeggio enters after two bars
        const k = ARP[inBar], oct = (inBar % 8 > 5) ? 12 : 0;
        if (inBar % 2 === 0 || Math.random() < .35) pluck(ch.pad[k] + oct, next, inBar % 4 === 0 ? 1 : .6);
      }
      if (bar >= 4 && inBar % 4 === 2) shaker(next, inBar === 6 || inBar === 14 ? 1 : .6);
      next += STEP; step++;
    }
  }

  return {
    get playing() { return playing; },
    play() {
      if (!ctx) build();
      ctx.resume();
      if (!playing) { playing = true; next = ctx.currentTime + .05; timer = setInterval(schedule, 25); }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(.55, ctx.currentTime, .8);    // gentle fade-in
    },
    pause() {
      if (!ctx || !playing) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, .35);     // fade-out, then stop the sequencer
      playing = false; clearInterval(timer);
      setTimeout(() => { if (!playing) ctx.suspend(); }, 1600);
    },
  };
}
