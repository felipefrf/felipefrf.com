// Home page motion: hero simulation boot, split-line headings, scroll progress,
// parallax, magnetic buttons, card spotlights, the MedAlvo stage (phone you can
// answer, Claude connector run) and the Império screen carousel.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0); // keep intros on wall-clock time even when the GPU is busy
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = window.matchMedia('(pointer: fine)').matches;
const lang = document.documentElement.lang || 'en';
const nf = (d: number) => new Intl.NumberFormat(lang, { minimumFractionDigits: d, maximumFractionDigits: d });
const f0 = nf(0), f2 = nf(2), f1 = nf(1), f3 = nf(3);

// ---------- hero ----------
const host = document.querySelector<HTMLElement>('[data-orbit-host]');
if (host) {
  requestAnimationFrame(() => host.classList.add('hero-on'));
  const canvas = host.querySelector<HTMLCanvasElement>('canvas')!;
  const tel = (k: string) => host.querySelector<HTMLElement>(`[data-tel="${k}"]`);
  const T = { t: tel('t'), alt: tel('alt'), vel: tel('vel'), inc: tel('inc'), lat: tel('lat'), lon: tel('lon'), orbit: tel('orbit') };
  const hms = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60);
    return [h, m, x].map((n) => String(n).padStart(2, '0')).join(':');
  };
  const boot = () =>
    import('./orbit').then(({ startOrbit, NIGHT }) => {
      try {
        // the light identity: a white clay globe in ink dots, the orbit in the accent
        const day = document.documentElement.classList.contains('day');
        const hex = (v: string) => parseInt(v.trim().replace('#', ''), 16);
        const css = getComputedStyle(document.documentElement);
        const palette = day
          ? {
              ...NIGHT,
              light: true,
              bg: hex(css.getPropertyValue('--paper')) || 0xfcfcfa,
              core: 0xffffff,
              dayDot: [0.055, 0.06, 0.07] as [number, number, number],
              nightDot: [0.62, 0.63, 0.65] as [number, number, number],
              dotAlpha: [0.55, 0.95] as [number, number],
              ring: 0x0e0f11,
              ringOpacity: 0.08,
              atmoLo: [0.8, 0.82, 0.86] as [number, number, number],
              atmoHi: [0.9, 0.91, 0.93] as [number, number, number],
              atmoStrength: 0.35,
              stars: 0x0e0f11,
              starOpacity: 0,
              accent: hex(css.getPropertyValue('--accent')) || 0xff4f00,
              leo: 0x0e0f11,
              heo: 0x8a8d93,
            }
          : undefined;
        startOrbit(canvas, {
          reduced,
          host,
          palette,
          label: host.querySelector('[data-sat-label]'),
          onTelemetry: (d) => {
            if (T.t) T.t.textContent = hms(d.t);
            if (T.alt) T.alt.textContent = f1.format(d.alt);
            if (T.vel) T.vel.textContent = f3.format(d.vel);
            if (T.inc) T.inc.textContent = f2.format(d.inc);
            if (T.lat) T.lat.textContent = f2.format(d.lat);
            if (T.lon) T.lon.textContent = f2.format(d.lon);
            if (T.orbit) T.orbit.textContent = f0.format(d.orbit);
          },
        });
        requestAnimationFrame(() => host.classList.add('ready'));
      } catch {
        /* no WebGL: the copy stands on its own */
      }
    });
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(boot, { timeout: 600 });
  else setTimeout(boot, 120);
}

// ---------- split headings into lines that rise ----------
function splitLines(el: HTMLElement) {
  // wrap each word (keeping inline markup) then group by offsetTop
  const walk = (node: Node, out: Node[]) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const parts = (child.textContent ?? '').split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const p of parts) {
          if (!p) continue;
          if (/^\s+$/.test(p)) frag.append(document.createTextNode(p));
          else {
            const s = document.createElement('span');
            s.className = 'w';
            s.style.display = 'inline-block';
            s.textContent = p;
            frag.append(s);
            out.push(s);
          }
        }
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && (child as Element).tagName !== 'BR') {
        const e = child as HTMLElement;
        if (e.classList.contains('serif')) {
          // gradient/italic phrases move as one piece, so background-clip text keeps working
          e.style.display = 'inline-block';
          out.push(e);
        } else if (e.tagName === 'SPAN') {
          walk(e, out);
        }
      }
    }
  };
  const words: Node[] = [];
  walk(el, words);
  return words as HTMLElement[];
}

if (!reduced) {
  document.querySelectorAll<HTMLElement>('.orbit-hero h1 [data-split]').forEach((line, li) => {
    const words = splitLines(line);
    gsap.from(words, { yPercent: 110, opacity: 0, rotate: 4, duration: 1.1, ease: 'expo.out', stagger: 0.06, delay: 0.15 + li * 0.18 });
    line.style.overflow = 'hidden';
    line.style.paddingBottom = '0.1em';
    line.style.marginBottom = '-0.1em';
  });

  document.querySelectorAll<HTMLElement>('.sec-head h2, .contact h2').forEach((h) => {
    const words = splitLines(h);
    gsap.set(h, { overflow: 'hidden', paddingBottom: '0.12em' });
    gsap.from(words, {
      yPercent: 105,
      opacity: 0,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.035,
      scrollTrigger: { trigger: h, start: 'top 88%' },
    });
  });

  // parallax
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    const k = Number(el.dataset.parallax) || 0.05;
    gsap.fromTo(el, { y: () => -k * 400 }, { y: () => k * 400, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // phones and big visuals tilt in as they arrive
  document.querySelectorAll<HTMLElement>('.cos-phone .phone, .imp-browser').forEach((el) => {
    gsap.from(el, { rotateX: 14, y: 60, opacity: 0, transformPerspective: 1200, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  document.querySelectorAll<HTMLElement>('.v-stats > div').forEach((el, i) => {
    gsap.from(el, { y: 30, opacity: 0, duration: 1, delay: (i % 4) * 0.08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
}

// ---------- scroll progress & active nav ----------
const bar = document.createElement('div');
bar.className = 'progress';
document.body.append(bar);
const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('.nav-links a[href^="#"]')];
const sections = navLinks.map((a) => document.querySelector<HTMLElement>(a.getAttribute('href')!)).filter(Boolean) as HTMLElement[];
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.setProperty('--p', String(max > 0 ? scrollY / max : 0));
  let cur = -1;
  sections.forEach((s, i) => {
    if (s.getBoundingClientRect().top < innerHeight * 0.35) cur = i;
  });
  navLinks.forEach((a, i) => a.classList.toggle('active', i === cur));
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- magnetic buttons & spotlight cards ----------
if (fine && !reduced) {
  document.querySelectorAll<HTMLElement>('.magnetic, .btn-primary').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.4, ease: 'power3.out' });
    });
    b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' }));
  });
  document.querySelectorAll<HTMLElement>('.stage, .feature, .apice, .medal-card, .sys, .honor-mini, .mcp-chat, .imp-cols > div').forEach((c) => {
    c.classList.add('spot');
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// ---------- MedAlvo stage ----------
const stage = document.querySelector<HTMLElement>('[data-stage]');
if (stage) {
  const tabs = [...stage.querySelectorAll<HTMLButtonElement>('[data-stage-tab]')];
  const panes = [...stage.querySelectorAll<HTMLElement>('[data-pane]')];
  // per tab: the site tour runs ~30 s; the Claude run and the phone need time to play out
  const DUR = panes.map((p) => (p.querySelector('video') ? 31000 : p.querySelector('[data-chat]') ? 15000 : p.querySelector('[data-ma-phone]') ? 14000 : 10000));
  let cur = 0;
  let timer = 0;
  let inView = false;
  let userPicked = false;

  const show = (i: number) => {
    cur = i;
    tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
    panes.forEach((p, k) => {
      p.hidden = k !== i;
      p.classList.toggle('active', k === i);
    });
    stage.style.setProperty('--tab-ms', `${DUR[i]}ms`);
    // restart the progress animation
    const prog = tabs[i].querySelector<HTMLElement>('.tab-progress');
    if (prog) {
      prog.style.animation = 'none';
      void prog.offsetWidth;
      prog.style.animation = '';
    }
    panes[i].querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
      v.preload = 'auto';
      if (!reduced) v.play().catch(() => {});
    });
    if (panes[i].querySelector('[data-chat]')) runChat();
    schedule();
  };
  const schedule = () => {
    clearTimeout(timer);
    if (userPicked || reduced || !inView) {
      stage.classList.add('paused');
      return;
    }
    stage.classList.remove('paused');
    timer = window.setTimeout(() => show((cur + 1) % tabs.length), DUR[cur]);
  };
  tabs.forEach((t, i) =>
    t.addEventListener('click', () => {
      userPicked = true;
      show(i);
    }),
  );
  stage.addEventListener('keydown', (e) => {
    if (!(e.target as HTMLElement).matches('[data-stage-tab]')) return;
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    userPicked = true;
    show((cur + d + tabs.length) % tabs.length);
    tabs[cur].focus();
  });
  stage.addEventListener('pointerdown', (e) => {
    if ((e.target as HTMLElement).closest('.ma-opt')) {
      userPicked = true;
      schedule();
    }
  });
  new IntersectionObserver(([e]) => {
    const was = inView;
    inView = e.isIntersecting;
    if (inView && !was) show(cur);
    if (!inView) clearTimeout(timer);
  }, { threshold: 0.35 }).observe(stage);

  // the phone: answer the question
  const phone = stage.querySelector<HTMLElement>('[data-ma-phone]');
  if (phone) {
    const fb = phone.querySelector<HTMLElement>('[data-ma-feedback]')!;
    const xpEl = phone.querySelector<HTMLElement>('[data-ma-xp]')!;
    const xpPill = xpEl.closest<HTMLElement>('.ma-xp')!;
    const ring = phone.querySelector<SVGCircleElement>('[data-ma-ring]')!;
    const done = phone.querySelector<HTMLElement>('[data-ma-done]')!;
    const left = phone.querySelector<HTMLElement>('[data-ma-left]')!;
    const today = phone.querySelector<HTMLElement>('[data-ma-today]');
    const widget = document.querySelector<HTMLElement>('[data-ma-widget]');
    const opts = [...phone.querySelectorAll<HTMLButtonElement>('[data-ma-opt]')];
    let answered = false;
    const countTo = (from: number, to: number) => {
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 700);
        xpEl.textContent = new Intl.NumberFormat(lang).format(Math.round(from + (to - from) * p));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const reset = () => {
      answered = false;
      opts.forEach((o) => {
        o.disabled = false;
        o.classList.remove('right', 'wrong');
      });
      fb.textContent = '';
      fb.className = 'ma-feedback';
      ring.style.strokeDasharray = '19 20';
      done.textContent = '19';
      xpEl.textContent = new Intl.NumberFormat(lang).format(1960);
      today?.classList.remove('done');
      if (widget) widget.textContent = '19/20';
    };
    opts.forEach((o) =>
      o.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const right = o.hasAttribute('data-right');
        opts.forEach((x) => (x.disabled = true));
        o.classList.add(right ? 'right' : 'wrong');
        if (!right) opts.find((x) => x.hasAttribute('data-right'))?.classList.add('right');
        fb.textContent = right ? fb.dataset.correct! : fb.dataset.wrong!;
        fb.className = `ma-feedback ${right ? 'ok' : 'bad'}`;
        ring.style.strokeDasharray = '20 20';
        done.textContent = '20';
        left.textContent = lang.startsWith('pt') ? 'Meta fechada!' : 'Goal done!';
        today?.classList.add('done');
        if (widget) widget.textContent = '20/20';
        xpPill.classList.remove('bump');
        void xpPill.offsetWidth;
        xpPill.classList.add('bump');
        countTo(1960, right ? 1970 : 1962);
        if (right && !reduced) confetti(o);
        setTimeout(reset, 6500);
      }),
    );
    // autoplay a tap when nobody touches it
    let auto = 0;
    const autoTap = () => {
      clearTimeout(auto);
      auto = window.setTimeout(() => {
        if (!userPicked && panes[cur].contains(phone) && inView && !answered && !reduced) opts.find((x) => x.hasAttribute('data-right'))?.click();
      }, 5200);
    };
    new MutationObserver(autoTap).observe(phone.closest<HTMLElement>('[data-pane]')!, { attributes: true, attributeFilter: ['class'] });
    autoTap();
  }

  // the Claude run
  const chat = stage.querySelector<HTMLElement>('[data-chat]');
  let chatRun = 0;
  async function runChat() {
    if (!chat) return;
    const id = ++chatRun;
    const steps = [...chat.querySelectorAll<HTMLElement>('[data-step]')];
    steps.forEach((s) => s.classList.remove('on', 'done'));
    chat.removeAttribute('data-answered');
    const wait = (ms: number) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
    const gaps = [400, 900, 1300, 1500, 900, 1200, 900];
    for (let i = 0; i < steps.length; i++) {
      await wait(gaps[i]);
      if (id !== chatRun) return;
      steps[i].classList.add('on');
      if (steps[i - 1]?.classList.contains('cm-tool')) steps[i - 1].classList.add('done');
      if (i === 3) chat.setAttribute('data-answered', '');
    }
    await wait(900);
    if (id === chatRun) steps[steps.length - 1].classList.add('done');
  }
}

function confetti(from: HTMLElement) {
  const r = from.getBoundingClientRect();
  const colors = ['#3a4ccb', '#e3704d', '#1c7f52', '#9aa5fa', '#f2c75a'];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('i');
    p.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;width:6px;height:9px;border-radius:2px;z-index:300;pointer-events:none;background:${colors[i % colors.length]}`;
    document.body.append(p);
    const a = Math.random() * Math.PI * 2;
    const v = 70 + Math.random() * 120;
    gsap.to(p, {
      x: Math.cos(a) * v,
      y: Math.sin(a) * v - 60,
      rotate: Math.random() * 540,
      duration: 0.9,
      ease: 'power3.out',
      onComplete: () => {
        gsap.to(p, { y: '+=120', opacity: 0, duration: 0.7, ease: 'power1.in', onComplete: () => p.remove() });
      },
    });
  }
}

// ---------- Império field app: one step at a time ----------
document.querySelectorAll<HTMLElement>('[data-walk]').forEach((root) => {
  const btns = [...root.querySelectorAll<HTMLButtonElement>('[data-walk-step]')];
  const imgs = [...root.querySelectorAll<HTMLImageElement>('[data-walk-img]')];
  const STEP = 4600;
  let i = 0;
  let timer = 0;
  let vis = false;
  let hold = 0;
  const show = (k: number) => {
    i = k;
    btns.forEach((b, j) => {
      b.classList.toggle('on', j === k);
      b.setAttribute('aria-pressed', String(j === k));
      if (j === k) {
        const bar = b.querySelector<HTMLElement>('.bar');
        if (bar) {
          bar.style.animation = 'none';
          void bar.offsetWidth;
          bar.style.animation = '';
        }
      }
    });
    imgs.forEach((im, j) => im.classList.toggle('on', j === k));
    // preload the next screen so the swap never flashes
    const nx = imgs[(k + 1) % imgs.length];
    if (nx && nx.loading === 'lazy') nx.loading = 'eager';
  };
  const tick = () => {
    clearTimeout(timer);
    root.classList.toggle('paused', reduced || !vis || hold > performance.now());
    if (reduced || !vis) return;
    const wait = Math.max(STEP, hold - performance.now());
    timer = window.setTimeout(() => {
      if (hold <= performance.now()) show((i + 1) % btns.length);
      tick();
    }, wait);
  };
  btns.forEach((b, k) =>
    b.addEventListener('click', () => {
      hold = performance.now() + 12000;
      show(k);
      tick();
    }),
  );
  root.style.setProperty('--walk-ms', `${STEP}ms`);
  new IntersectionObserver(
    ([e]) => {
      vis = e.isIntersecting;
      if (vis) imgs.forEach((im) => (im.loading = 'eager'));
      tick();
    },
    { threshold: 0.35 },
  ).observe(root);
});

// ---------- medals: live 3D models, loaded when they come near ----------
{
  const cans = [...document.querySelectorAll<HTMLCanvasElement>('canvas[data-medal]')];
  if (cans.length) {
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        import('./medal3d').then(({ startMedal }) => cans.forEach((c) => startMedal(c, c.dataset.medal!, reduced)));
      },
      { rootMargin: '600px' },
    );
    cans.forEach((c) => io.observe(c));
  }
}

// ---------- medals turn toward the pointer a little, and play in view ----------
ScrollTrigger.refresh();

// ---------- Blender films scrubbed by scroll ----------
const films = document.querySelectorAll<HTMLElement>('[data-film]');
if (films.length) import('./film').then(({ startFilm }) => films.forEach((f) => startFilm(f, reduced)));
