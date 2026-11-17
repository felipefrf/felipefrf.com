// Scroll-scrubbed films: a Blender render exported as numbered webp frames
// (3d/film_*.py), drawn on a canvas as the reader scrolls through a tall
// section. film.json carries each label's projected position per frame, so the
// labels are plain HTML (crisp, translated) that ride on the 3D anchors.
type FilmData = {
  count: number;
  w: number;
  h: number;
  /** frame widths rendered (folders under the film); absent: just `w` */
  sizes?: number[];
  labels: Record<string, ([number, number] | null)[]>;
  meta?: { origin?: string; dest?: string; beyond?: string; direct?: number; found?: number; currency?: string };
};

// the film's height can change once it knows whether it scrubs or sits still;
// a resize makes the scroll-driven reveals below it recompute their positions
const relayout = () => requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));

export function startFilm(root: HTMLElement, reduced: boolean) {
  const base = root.dataset.film!.replace(/\/?$/, '/');
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const steps = [...root.querySelectorAll<HTMLElement>('[data-film-step]')];
  const labels = new Map([...root.querySelectorAll<HTMLElement>('[data-film-label]')].map((el) => [el.dataset.filmLabel!, el]));
  const bar = root.querySelector<HTMLElement>('[data-film-bar]');
  const stage = root.querySelector<HTMLElement>('.film-stage')!;
  const view = root.querySelector<HTMLElement>('.film-view')!;
  const copy = root.querySelector<HTMLElement>('.film-copy');

  fetch(base + 'film.json')
    .then((r) => r.json())
    .then((d: FilmData) => {
      const N = d.count;
      // the label texts: airport codes and prices come from the render's meta
      const m = d.meta || {};
      const lang = root.dataset.filmLang === 'pt' ? 'pt-BR' : 'en';
      const money = (v?: number) =>
        v == null ? '' : new Intl.NumberFormat(lang, { style: 'currency', currency: m.currency || 'BRL', maximumFractionDigits: 0 }).format(v);
      const text: Record<string, string> = {
        origin: m.origin || '',
        dest: m.dest || '',
        beyond: m.beyond || '',
        direct: money(m.direct),
        found: money(m.found),
        saving: m.direct != null && m.found != null ? '−' + money(m.direct - m.found) : '',
      };
      // meta-driven labels (codes, prices) get their value; a meta label with no
      // value is dropped. Other films' labels are plain captions, left as they are.
      if (d.meta) {
        for (const [id, el] of labels) {
          if (!(id in text)) continue;
          const b = el.querySelector('b');
          if (b) b.textContent = text[id];
          if (!text[id]) labels.delete(id), el.remove();
        }
      }
      // the smallest rendered size that covers the canvas as displayed (CSS
      // pixels x devicePixelRatio), else the largest there is
      const sizes = (d.sizes?.length ? [...d.sizes] : [d.w]).sort((a, b) => a - b);
      const shownW = canvas.getBoundingClientRect().width || view.clientWidth || d.w;
      const need = shownW * (window.devicePixelRatio || 1);
      const fw = sizes.find((s) => s >= need) ?? sizes[sizes.length - 1];
      const fh = Math.round((fw * d.h) / d.w);
      canvas.width = fw;
      canvas.height = fh;
      const frames: (HTMLImageElement | null)[] = new Array(N).fill(null);
      const name = (i: number) => `${base}${fw}/${String(i + 1).padStart(4, '0')}.webp`;

      // narrow screens get the short label text where there is one
      const setTexts = () => {
        const narrow = view.clientWidth < 560;
        for (const el of labels.values()) {
          const sm = el.querySelector('small');
          if (!sm || !el.dataset.short) continue;
          el.dataset.long ??= sm.textContent || '';
          sm.textContent = narrow ? el.dataset.short : el.dataset.long;
        }
      };
      setTexts();

      // keep every label whole: inside the film (and the screen), clear of the copy column
      const clamp = () => {
        const on = [...labels.values()].filter((el) => el.classList.contains('on'));
        if (!on.length) return;
        on.forEach((el) => (el.style.translate = '0px 0px'));
        const v = view.getBoundingClientRect();
        let lo = Math.max(v.left, 0) + 6;
        const hi = Math.min(v.right, document.documentElement.clientWidth) - 6;
        if (copy) {
          const c = copy.getBoundingClientRect();
          // the copy column beside the film (desktop), not under it (phones)
          if (c.width && c.right <= v.left + v.width / 2 && c.bottom > v.top && c.top < v.bottom) lo = Math.max(lo, c.right + 12);
        }
        const rects = on.map((el) => el.getBoundingClientRect());
        on.forEach((el, i) => {
          const r = rects[i];
          const dx = r.left < lo ? lo - r.left : r.right > hi ? hi - r.right : 0;
          el.style.translate = `${dx.toFixed(1)}px 0px`;
        });
      };
      let want = reduced ? N - 1 : Math.min(N - 1, +(root.dataset.filmFrom || 0));
      let shown = -1;

      const draw = () => {
        // nearest frame we already have, so a fast scroll never shows a blank
        let k = want;
        for (let o = 0; o < N; o++) {
          if (frames[want - o]) { k = want - o; break; }
          if (frames[want + o]) { k = want + o; break; }
        }
        const img = frames[k];
        if (img && k !== shown) {
          ctx.drawImage(img, 0, 0, fw, fh);
          shown = k;
        }
        for (const [id, el] of labels) {
          const pt = d.labels[id]?.[want];
          if (pt) {
            el.style.setProperty('--x', (pt[0] * 100).toFixed(2) + '%');
            el.style.setProperty('--y', (pt[1] * 100).toFixed(2) + '%');
            el.classList.add('on');
          } else el.classList.remove('on');
        }
        clamp();
      };

      // load coarse first (every 8th), then fill in, so scrubbing works at once
      const order: number[] = [];
      for (const step of [8, 4, 2, 1]) for (let i = 0; i < N; i += step) if (!order.includes(i)) order.push(i);
      if (!order.includes(N - 1)) order.unshift(N - 1);
      let started = false;
      const load = () => {
        if (started) return;
        started = true;
        let next = 0;
        const pump = () => {
          if (next >= order.length) return;
          const i = order[next++];
          const im = new Image();
          im.decoding = 'async';
          im.onload = () => {
            frames[i] = im;
            if (Math.abs(i - want) < 8 || shown < 0) draw();
            pump();
          };
          im.onerror = pump;
          im.src = name(i);
        };
        for (let c = 0; c < 6; c++) pump();
      };
      new IntersectionObserver((es) => es[0].isIntersecting && load(), { rootMargin: '600px' }).observe(root);

      // compact films play on their own while in view (6 s through, 3 s hold)
      if (root.dataset.filmMode === 'loop' && !reduced) {
        let playing = false;
        let t0 = 0;
        const RUN = 6000, HOLD = 3000;
        const tick = (now: number) => {
          if (!playing) return;
          const t = (now - t0) % (RUN + HOLD);
          want = Math.min(N - 1, Math.round((t / RUN) * (N - 1)));
          if (bar) bar.style.transform = `scaleX(${want / (N - 1)})`;
          draw();
          requestAnimationFrame(tick);
        };
        new IntersectionObserver(
          (es) => {
            const on = es[0].isIntersecting;
            if (on && !playing) {
              playing = true;
              t0 = performance.now() - (want / (N - 1)) * RUN;
              requestAnimationFrame(tick);
            } else if (!on) playing = false;
          },
          { threshold: 0.35 },
        ).observe(root);
        return;
      }
      if (reduced) {
        root.classList.add('static');
        steps.forEach((s) => s.classList.add('on'));
        relayout();
        return;
      }
      // the stage is as tall as its content and pins under the nav, centred
      // when the screen has room; the film plays while it is pinned
      let pinTop = 0;
      let stageH = 0;
      const measure = () => {
        stageH = stage.offsetHeight;
        // side by side: centred in the screen; stacked (phones, tall screens):
        // right under the nav, so the film is not adrift in an empty screen
        const stacked = !!copy && copy.getBoundingClientRect().top >= view.getBoundingClientRect().bottom - 1;
        pinTop = stacked ? 72 : Math.max(72, Math.round((window.innerHeight - stageH) / 2));
        stage.style.top = pinTop + 'px';
        setTexts();
      };
      measure();
      let raf = 0;
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = root.getBoundingClientRect();
          const total = r.height - stageH;
          const p = Math.min(1, Math.max(0, (pinTop - r.top) / Math.max(1, total)));
          const from = Math.min(N - 1, +(root.dataset.filmFrom || 0));
          want = Math.round(from + p * (N - 1 - from));
          if (bar) bar.style.transform = `scaleX(${p})`;
          const n = steps.length;
          steps.forEach((s, i) => s.classList.toggle('on', p >= i / n - 0.001 && (p < (i + 1) / n || i === n - 1)));
          draw();
        });
      };
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', () => {
        measure();
        onScroll();
      });
      onScroll();
    })
    .catch(() => {
      root.classList.add('static');
      relayout();
    });
}
