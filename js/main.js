// Sindu Shah — Portfolio scripts

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#yr').textContent = new Date().getFullYear();

// ---------- Theme ----------
const root = document.documentElement;
const setMeta = () => $('meta[name="theme-color"]').setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim());
setMeta();
$('#themeToggle').addEventListener('click', () => {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  setMeta();
  silk && silk.recolor();
});

// ---------- Mobile menu ----------
const links = $('#navLinks'), menuBtn = $('#menuBtn');
menuBtn.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
$$('#navLinks a').forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); }));

// ---------- Header state, progress, active link ----------
const header = $('header'), bar = $('#progress');
const sections = $$('main section[id]');
function onScroll() {
  const h = document.documentElement, y = h.scrollTop;
  header.classList.toggle('scrolled', y > 10);
  bar.style.width = (y / (h.scrollHeight - h.clientHeight) * 100) + '%';
  let cur = '';
  sections.forEach(s => { if (y + 140 >= s.offsetTop) cur = s.id; });
  $$('#navLinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// ---------- Rotating word ----------
(() => {
  const words = ['thoughtful design', 'clean code', 'honest guidance', 'smart marketing', 'creative artistry'];
  const el = $('#swap'); let i = 0;
  if (reduce) return;
  setInterval(() => {
    el.classList.add('out');
    setTimeout(() => { i = (i + 1) % words.length; el.textContent = words[i]; el.classList.remove('out'); }, 350);
  }, 2600);
})();

// ---------- Silk flow-field background (hero) ----------
const silk = (() => {
  const c = $('#silk'); if (!c) return null;
  const x = c.getContext('2d');
  let W, H, P = [], cols = [], t = 0, running = true, raf;
  const m = { x: -9999, y: -9999, active: false };
  const css = v => getComputedStyle(root).getPropertyValue(v).trim();
  const hexRgb = h => { h = h.replace('#', ''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  function recolor() {
    const a = hexRgb(css('--accent')), b = hexRgb(css('--accent-2'));
    const mid = a.map((v, k) => Math.round((v + b[k]) / 2));
    cols = [a, mid, b].map(rgb => rgb.join(','));
    x.clearRect(0, 0, W, H);
  }
  function spawn(p) {
    p.x = Math.random() * W; p.y = Math.random() * H;
    p.life = 120 + Math.random() * 220; p.age = 0;
    p.c = cols[Math.random() * cols.length | 0];
    p.w = Math.random() < .14 ? 1.8 : .9;
    return p;
  }
  function size() {
    const d = Math.min(devicePixelRatio || 1, 2), r = c.getBoundingClientRect();
    W = r.width; H = r.height; c.width = W * d; c.height = H * d;
    x.setTransform(d, 0, 0, d, 0, 0);
    const n = Math.min(900, Math.floor(W * H / 1400));
    P = Array.from({ length: n }, () => spawn({}));
    recolor();
  }
  function angle(px, py) {
    const s = 0.0022;
    let a = Math.sin(px * s + t * 0.6) * 1.4 + Math.cos(py * s * 1.3 - t * 0.4) * 1.2 + Math.sin((px + py) * s * 0.6 + t * 0.3);
    if (m.active) {
      const dx = px - m.x, dy = py - m.y, d2 = dx * dx + dy * dy, R = 170;
      if (d2 < R * R) { const k = 1 - Math.sqrt(d2) / R; a = a * (1 - k) + (Math.atan2(dy, dx) + Math.PI / 2) * k; }
    }
    return a;
  }
  function frame() {
    t += 0.0035;
    x.globalCompositeOperation = 'destination-out';
    x.fillStyle = 'rgba(0,0,0,0.045)';
    x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'source-over';
    for (const p of P) {
      const a = angle(p.x, p.y), nx = p.x + Math.cos(a) * 1.3, ny = p.y + Math.sin(a) * 1.3;
      const fade = Math.sin(Math.PI * p.age / p.life);
      x.strokeStyle = `rgba(${p.c},${0.85 * fade})`;
      x.lineWidth = p.w;
      x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(nx, ny); x.stroke();
      p.x = nx; p.y = ny;
      if (++p.age > p.life || nx < -10 || nx > W + 10 || ny < -10 || ny > H + 10) spawn(p);
    }
  }
  function loop() { if (running) { frame(); raf = requestAnimationFrame(loop); } }
  size();
  if (reduce) { for (let i = 0; i < 260; i++) frame(); }
  else {
    loop();
    new IntersectionObserver(([e]) => {
      running = e.isIntersecting;
      if (running) { cancelAnimationFrame(raf); loop(); }
    }).observe(c);
  }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(size, 150); });
  const hero = $('.hero');
  hero.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; m.active = true; });
  hero.addEventListener('pointerleave', () => { m.active = false; });
  return { recolor };
})();

// ---------- Scroll reveal ----------
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => {
  const sib = el.parentElement ? [...el.parentElement.children].filter(n => n.classList.contains('reveal')) : [];
  el.style.transitionDelay = Math.min(sib.indexOf(el), 5) * 70 + 'ms';
  io.observe(el);
});

// ---------- Card spotlight ----------
$$('.card').forEach(card => card.addEventListener('pointermove', e => {
  const b = card.getBoundingClientRect();
  card.style.setProperty('--mx', (e.clientX - b.left) + 'px');
  card.style.setProperty('--my', (e.clientY - b.top) + 'px');
}));

// ---------- Certification filter ----------
$$('.filter').forEach(btn => btn.addEventListener('click', () => {
  $$('.filter').forEach(b => b.classList.toggle('on', b === btn));
  const f = btn.dataset.filter;
  $$('.cert').forEach(c => {
    const show = f === 'all' || c.dataset.cat === f;
    c.classList.toggle('hide', !show);
    if (show) c.classList.add('in');
  });
}));

// ---------- Copy email ----------
$('#copyEmail').addEventListener('click', async e => {
  const b = e.currentTarget;
  try { await navigator.clipboard.writeText('sindushah99@gmail.com'); b.textContent = 'Copied ✓'; }
  catch { b.textContent = 'sindushah99@gmail.com'; }
  setTimeout(() => b.textContent = 'Copy email address', 2000);
});
