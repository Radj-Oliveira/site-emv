/* Static FAQ chat. No server, no storage: answers come from config.js.
   User text is only ever inserted with textContent (never innerHTML). */
import { CHAT, CONTATO } from './config.js';

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
export const waLink = (text) => `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(text || CONTATO.mensagemPadrao)}`;

function answer(q) {
  const t = ' ' + norm(q) + ' ';
  let best = null, score = 0;
  for (const r of CHAT.respostas) {
    let s = 0;
    for (const p of r.palavras) { const w = norm(p); if (t.includes(' ' + w + ' ') || (w.length > 4 && t.includes(w))) s += w.split(' ').length + (w.length > 6 ? 1 : 0); }
    if (s > score) { score = s; best = r; }
  }
  return best;
}

export function initChat() {
  const fab = document.getElementById('chatFab'), box = document.getElementById('chatBox'), close = document.getElementById('chatClose');
  const log = document.getElementById('chatLog'), chips = document.getElementById('chatChips'), form = document.getElementById('chatForm'), input = document.getElementById('chatIn');
  let started = false, busy = false, last = 0;

  const scroll = () => { log.scrollTop = log.scrollHeight; };
  function bubble(text, who, waText) {
    const d = document.createElement('div'); d.className = 'msg msg--' + who; d.textContent = text;
    if (waText !== undefined) {
      const a = document.createElement('a'); a.className = 'msg__wa'; a.href = waLink(waText); a.target = '_blank'; a.rel = 'noopener';
      a.textContent = 'Enviar no WhatsApp →'; d.appendChild(document.createElement('br')); d.appendChild(a);
    }
    log.appendChild(d); scroll(); return d;
  }
  function botSay(text, waText) {
    busy = true;
    const typing = document.createElement('div'); typing.className = 'msg msg--bot msg--typing'; typing.innerHTML = '<i></i><i></i><i></i>';
    log.appendChild(typing); scroll();
    setTimeout(() => { typing.remove(); bubble(text, 'bot', waText); busy = false; }, 550 + Math.min(900, text.length * 8));
  }
  function ask(q) {
    q = String(q).slice(0, 280).trim(); if (!q || busy) return;
    const now = Date.now(); if (now - last < 600) return; last = now;   // tiny flood guard
    bubble(q, 'me');
    const r = answer(q);
    if (r) botSay(r.texto, r.whatsapp ? `Olá! Vim pelo site da EMV. ${q}` : undefined);
    else botSay(CHAT.naoSei, `Olá! Vim pelo site da EMV e tenho uma dúvida: ${q}`);
  }
  function renderChips() {
    chips.textContent = '';
    CHAT.sugestoes.forEach(s => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s; b.addEventListener('click', () => ask(s)); chips.appendChild(b); });
  }
  function open(v) {
    box.hidden = !v; fab.setAttribute('aria-expanded', String(v));
    if (v && !started) { started = true; renderChips(); botSay(CHAT.saudacao); }
    if (v) { setTimeout(() => input.focus({ preventScroll: true }), 50); if (window.gsap) gsap.fromTo(box, { opacity: 0, y: 16, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .45, ease: 'power3.out' }); }
  }
  fab.addEventListener('click', () => open(box.hidden));
  close.addEventListener('click', () => open(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) open(false); });
  form.addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); input.value = ''; });
  // keep page scroll (Lenis) from hijacking the chat log
  log.setAttribute('data-lenis-prevent', '');
}
