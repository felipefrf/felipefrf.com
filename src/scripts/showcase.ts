// Showcase players (src/components/Showcase.astro): the selected feature's
// clip plays in its device; when it ends the next one starts, and a click
// jumps to any of them. Only the visible player plays.
export function startShowcase(root: HTMLElement, reduced: boolean) {
  const steps = [...root.querySelectorAll<HTMLButtonElement>('[data-sc-step]')];
  const items = [...root.querySelectorAll<HTMLElement>('[data-sc-item]')];
  let cur = 0;
  let visible = false;
  let timer = 0;
  let raf = 0;

  const media = (i: number) => items[i].querySelector<HTMLVideoElement>('video');
  const setBar = (i: number, p: number) => steps[i].style.setProperty('--p', String(Math.max(0, Math.min(1, p))));

  const stopAll = () => {
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    items.forEach((_, i) => media(i)?.pause());
  };
  const tick = () => {
    const v = media(cur);
    if (v && v.duration) setBar(cur, v.currentTime / v.duration);
    raf = requestAnimationFrame(tick);
  };
  const run = () => {
    stopAll();
    if (!visible || reduced) return;
    const v = media(cur);
    if (v) {
      v.preload = 'auto';
      v.currentTime = 0;
      v.play().catch(() => {});
      raf = requestAnimationFrame(tick);
      // preload the next clip while this one plays
      const n = media((cur + 1) % items.length);
      if (n) n.preload = 'auto';
    } else {
      const t0 = performance.now();
      const step = () => {
        setBar(cur, (performance.now() - t0) / 6000);
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      timer = window.setTimeout(() => go(cur + 1), 6000);
    }
  };
  const go = (i: number) => {
    setBar(cur, 0);
    cur = (i + items.length) % items.length;
    steps.forEach((s, k) => {
      s.classList.toggle('on', k === cur);
      s.setAttribute('aria-pressed', k === cur ? 'true' : 'false');
      if (k !== cur) setBar(k, 0);
    });
    items.forEach((it, k) => it.classList.toggle('on', k === cur));
    run();
  };

  // posters download only when the player comes near, not on first paint
  new IntersectionObserver(
    (es, io) => {
      if (!es[0].isIntersecting) return;
      root.querySelectorAll<HTMLVideoElement>('video[data-poster]').forEach((v) => (v.poster = v.dataset.poster!));
      io.disconnect();
    },
    { rootMargin: '700px 0px' },
  ).observe(root);
  items.forEach((_, i) => media(i)?.addEventListener('ended', () => i === cur && go(cur + 1)));
  steps.forEach((s, i) => s.addEventListener('click', () => go(i)));
  new IntersectionObserver(
    (es) => {
      const on = es[0].isIntersecting;
      if (on === visible) return;
      visible = on;
      on ? run() : stopAll();
    },
    { threshold: 0.3 },
  ).observe(root);
  if (reduced) steps.forEach((s) => s.classList.add('open'));
}
