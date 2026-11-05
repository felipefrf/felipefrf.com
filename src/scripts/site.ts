// Shared page behaviour: nav shadow, reveal-on-scroll, copy buttons, counters,
// in-view video playback, medal tilt and the self-writing penpad page.
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const nav = document.getElementById('nav');
const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  },
  { rootMargin: '0px 0px -40px 0px', threshold: 0 },
);
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy ?? '');
      btn.dataset.copied = 'true';
      setTimeout(() => (btn.dataset.copied = 'false'), 1800);
    } catch {
      /* clipboard blocked: the text stays selectable on the page */
    }
  });
});

// Count-up numbers: <span data-count="1800" data-suffix="+">1,800+</span>
const fmt = new Intl.NumberFormat('en-US');
const counterIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      counterIO.unobserve(e.target);
      const el = e.target as HTMLElement;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix ?? '';
      if (reduced || !target) continue;
      const t0 = performance.now();
      const dur = 1600;
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt.format(Math.round(target * eased)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  },
  { threshold: 0.6 },
);
document.querySelectorAll('[data-count]').forEach((el) => counterIO.observe(el));

// Videos play only while on screen.
const videoIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting && !reduced) v.play().catch(() => {});
      else v.pause();
    }
  },
  { threshold: 0.25 },
);
document.querySelectorAll<HTMLVideoElement>('video[data-inview]').forEach((v) => videoIO.observe(v));

// Medals tilt toward the pointer.
if (!reduced) {
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    const target = card.querySelector<HTMLElement>('.medal-wrap') ?? card;
    card.addEventListener('pointermove', (ev) => {
      const r = card.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width - 0.5;
      const y = (ev.clientY - r.top) / r.height - 0.5;
      target.style.transform = `perspective(700px) rotateY(${x * 18}deg) rotateX(${-y * 14}deg)`;
    });
    card.addEventListener('pointerleave', () => (target.style.transform = ''));
  });
}

// penpad page that writes itself.
type Line = { y0: number; y1: number; x0: number; x1: number };
function initHandwriting(el: HTMLElement) {
  const lines: Line[] = JSON.parse(el.dataset.lines ?? '[]');
  const W = Number(el.dataset.w);
  const H = Number(el.dataset.h);
  const img = el.querySelector('img');
  const cv = el.querySelector('canvas');
  const pen = el.querySelector<HTMLElement>('.hw-pen');
  const replay = el.querySelector<HTMLButtonElement>('.hw-replay');
  const ctx = cv?.getContext('2d');
  if (!img || !cv || !ctx || !lines.length || reduced) return;

  const src = new Image();
  src.decoding = 'async';
  src.src = img.getAttribute('src') ?? '';
  let raf = 0;
  let played = false;

  const grid = () => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#cfcfd1';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = 38; x < W; x += 38.67) {
      ctx.moveTo(Math.round(x) + 0.5, 0);
      ctx.lineTo(Math.round(x) + 0.5, H);
    }
    for (let y = 30; y < H; y += 38.67) {
      ctx.moveTo(0, Math.round(y) + 0.5);
      ctx.lineTo(W, Math.round(y) + 0.5);
    }
    ctx.stroke();
  };

  const play = () => {
    cancelAnimationFrame(raf);
    played = true;
    if (replay) replay.hidden = true;
    el.classList.add('hw-on', 'hw-writing');
    grid();
    const speed = 1.15; // source px per ms
    let i = 0;
    let x = lines[0].x0;
    let last = performance.now();
    let pauseUntil = 0;
    const step = (t: number) => {
      const dt = Math.min(40, t - last);
      last = t;
      if (t >= pauseUntil) {
        const L = lines[i];
        const nx = Math.min(L.x1, x + dt * speed);
        const w = Math.max(1, nx - x + 1);
        ctx.drawImage(src, x, L.y0, w, L.y1 - L.y0, x, L.y0, w, L.y1 - L.y0);
        x = nx;
        if (pen) {
          pen.style.left = `${(x / W) * 100}%`;
          pen.style.top = `${(((L.y0 + L.y1) / 2) / H) * 100}%`;
        }
        if (x >= L.x1) {
          i += 1;
          if (i >= lines.length) {
            ctx.drawImage(src, 0, 0);
            el.classList.remove('hw-writing');
            if (replay) replay.hidden = false;
            return;
          }
          x = lines[i].x0;
          pauseUntil = t + 200;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  replay?.addEventListener('click', play);
  const start = () => {
    const hwIO = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !played) play();
          // Leaving the screen re-arms it, so the next visit writes again.
          if (!e.isIntersecting && played && !el.classList.contains('hw-writing')) played = false;
        }
      },
      { threshold: 0.35 },
    );
    hwIO.observe(el);
  };
  if (src.complete) start();
  else src.addEventListener('load', start, { once: true });
}
document.querySelectorAll<HTMLElement>('[data-hw]').forEach(initHandwriting);
