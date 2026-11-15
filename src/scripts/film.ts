// Scroll-scrubbed films: a Blender render exported as numbered webp frames
// (3d/film_*.py), drawn on a canvas as the reader scrolls through a tall
// section. film.json carries each label's projected position per frame, so the
// labels are plain HTML (crisp, translated) that ride on the 3D anchors.
type FilmData = {
  count: number;
  w: number;
  h: number;
  labels: Record<string, ([number, number] | null)[]>;
  meta?: { origin?: string; dest?: string; beyond?: string; direct?: number; found?: number; currency?: string };
};

export function startFilm(root: HTMLElement, reduced: boolean) {
  const base = root.dataset.film!.replace(/\/?$/, '/');
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const steps = [...root.querySelectorAll<HTMLElement>('[data-film-step]')];
  const labels = new Map([...root.querySelectorAll<HTMLElement>('[data-film-label]')].map((el) => [el.dataset.filmLabel!, el]));
  const bar = root.querySelector<HTMLElement>('[data-film-bar]');

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
      for (const [id, el] of labels) {
        const b = el.querySelector('b');
        if (b) b.textContent = text[id] ?? '';
        if (!text[id]) labels.delete(id), el.remove();
      }
      canvas.width = d.w;
      canvas.height = d.h;
      const frames: (HTMLImageElement | null)[] = new Array(N).fill(null);
      const name = (i: number) => `${base}${d.w}/${String(i + 1).padStart(4, '0')}.webp`;
      let want = reduced ? N - 1 : 0;
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
          ctx.drawImage(img, 0, 0, d.w, d.h);
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

      if (reduced) {
        root.classList.add('static');
        steps.forEach((s) => s.classList.add('on'));
        return;
      }
      let raf = 0;
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = root.getBoundingClientRect();
          const total = r.height - window.innerHeight;
          const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
          want = Math.round(p * (N - 1));
          if (bar) bar.style.transform = `scaleX(${p})`;
          const n = steps.length;
          steps.forEach((s, i) => s.classList.toggle('on', p >= i / n - 0.001 && (p < (i + 1) / n || i === n - 1)));
          draw();
        });
      };
      addEventListener('scroll', onScroll, { passive: true });
      addEventListener('resize', onScroll);
      onScroll();
    })
    .catch(() => root.classList.add('static'));
}
