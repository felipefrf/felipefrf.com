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

// ---------- animated system diagrams ----------
type Step = { edge: string; reverse?: boolean; log: string };
type EdgeRef = { id: string; from: string; to: string };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function initSystems(root: HTMLElement) {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-sys-tab]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-sys]')];
  let active = 0;
  let run = 0; // bumps on every tab change to cancel the previous loop
  let visible = false;
  let started = false;

  const untilVisible = async (token: number) => {
    while (!visible && token === run) await wait(250);
  };

  const animatePacket = (panel: HTMLElement, path: SVGPathElement, reverse: boolean, ms: number, token: number) =>
    new Promise<void>((resolve) => {
      const packet = panel.querySelector<SVGCircleElement>('.packet')!;
      const halo = panel.querySelector<SVGCircleElement>('.halo')!;
      const len = path.getTotalLength();
      const t0 = performance.now();
      const frame = (t: number) => {
        if (token !== run) return resolve();
        const p = Math.min(1, (t - t0) / ms);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const pt = path.getPointAtLength(len * (reverse ? 1 - e : e));
        packet.setAttribute('cx', String(pt.x));
        packet.setAttribute('cy', String(pt.y));
        halo.setAttribute('cx', String(pt.x));
        halo.setAttribute('cy', String(pt.y));
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });

  const play = async (i: number) => {
    const token = ++run;
    active = i;
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', j === i ? 'true' : 'false');
      t.classList.remove('running');
    });
    panels.forEach((p, j) => p.classList.toggle('active', j === i));
    const panel = panels[i];
    const steps: Step[] = JSON.parse(panel.dataset.steps ?? '[]');
    const edges: EdgeRef[] = JSON.parse(panel.dataset.edges ?? '[]');
    const log = panel.querySelector<HTMLOListElement>('.sys-log')!;
    const sysId = panel.dataset.sys;

    // reset, then build the graph
    panel.classList.remove('built');
    panel.querySelectorAll('.hot').forEach((el) => el.classList.remove('hot'));
    log.innerHTML = '';
    if (reduced) {
      panel.classList.add('built');
      steps.forEach((s) => {
        const li = document.createElement('li');
        li.textContent = s.log;
        log.append(li);
      });
      return;
    }
    await untilVisible(token);
    await wait(60);
    panel.classList.add('built');
    await wait(1300);
    const tab = tabs[i];
    tab.style.setProperty('--dur', `${steps.length * 1.55 + 2.2}s`);
    tab.classList.add('running');

    const t0 = performance.now();
    for (const s of steps) {
      if (token !== run) return;
      await untilVisible(token);
      const ref = edges.find((e) => e.id === s.edge);
      const path = panel.querySelector<SVGPathElement>(`#e-${sysId}-${s.edge}`);
      if (!ref || !path) continue;
      const fromId = s.reverse ? ref.to : ref.from;
      const toId = s.reverse ? ref.from : ref.to;
      panel.querySelectorAll('.node.hot, .edge.hot').forEach((el) => el.classList.remove('hot'));
      const fromEl = panel.querySelector<SVGGElement>(`[data-node="${fromId}"]`);
      fromEl?.classList.add('hot');
      path.classList.add('hot');
      panel.classList.add('moving');
      // On narrow screens the diagram scrolls inside its frame: follow the action.
      const graph = panel.querySelector<HTMLElement>('.sys-graph');
      const toEl = panel.querySelector<SVGGElement>(`[data-node="${toId}"]`);
      if (graph && toEl && graph.scrollWidth > graph.clientWidth + 4) {
        const node = toEl.getBoundingClientRect();
        const frame = graph.getBoundingClientRect();
        const target = graph.scrollLeft + node.left + node.width / 2 - (frame.left + graph.clientWidth / 2);
        graph.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
      }

      const li = document.createElement('li');
      const ts = ((performance.now() - t0) / 1000).toFixed(1).padStart(4, '0');
      li.innerHTML = `<span class="t">+${ts}s</span><span></span>`;
      (li.lastElementChild as HTMLElement).textContent = s.log;
      log.prepend(li);
      while (log.children.length > 5) log.lastElementChild?.remove();

      await animatePacket(panel, path, !!s.reverse, 950, token);
      if (token !== run) return;
      panel.querySelector(`[data-node="${toId}"]`)?.classList.add('hot');
      await wait(550);
    }
    panel.classList.remove('moving');
    await wait(2200);
    if (token === run) play((active + 1) % panels.length);
  };

  tabs.forEach((t, i) => t.addEventListener('click', () => play(i)));
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !started) {
        started = true;
        play(0);
      }
    },
    { threshold: 0.3 },
  ).observe(root);
}
document.querySelectorAll<HTMLElement>('[data-systems]').forEach(initSystems);

// ---------- Curo conversation ----------
function initChat(root: HTMLElement) {
  if (reduced) return;
  const items = [...root.querySelectorAll<HTMLElement>('[data-at]')];
  const times = [400, 1300, 2300, 3100, 3900, 5000];
  let visible = false;
  let running = false;
  root.classList.add('chat-js');
  const loop = async () => {
    if (running) return;
    running = true;
    while (visible) {
      items.forEach((el) => el.classList.remove('show'));
      let last = 0;
      for (let i = 0; i < times.length; i++) {
        await wait(times[i] - last);
        last = times[i];
        if (!visible) break;
        root.querySelectorAll<HTMLElement>(`[data-at="${i}"]`).forEach((el) => el.classList.add('show'));
        if (i === 5) root.querySelector('.typing')?.classList.remove('show');
      }
      await wait(4200);
    }
    running = false;
  };
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (visible) loop();
    },
    { threshold: 0.3 },
  ).observe(root);
}
document.querySelectorAll<HTMLElement>('[data-chat]').forEach(initChat);

// ---------- full medal list ----------
document.querySelectorAll<HTMLElement>('[data-medals]').forEach((card) => {
  const open = card.querySelector<HTMLButtonElement>('[data-medals-open]');
  const close = card.querySelector<HTMLButtonElement>('[data-medals-close]');
  const list = card.querySelector<HTMLElement>('.medal-list');
  if (!open || !close || !list) return;
  const set = (on: boolean) => {
    list.hidden = !on;
    open.setAttribute('aria-expanded', String(on));
    card.classList.toggle('listing', on);
    (on ? close : open).focus();
  };
  open.addEventListener('click', () => set(true));
  close.addEventListener('click', () => set(false));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !list.hidden) set(false);
  });
});

// ---------- language choice sticks ----------
document.querySelectorAll<HTMLAnchorElement>('[data-set-lang]').forEach((a) => {
  a.addEventListener('click', () => {
    try {
      localStorage.setItem('lang', a.dataset.setLang ?? 'en');
    } catch {
      /* storage blocked: the link still works */
    }
  });
});
