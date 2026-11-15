# felipefrf.com

Personal site of Felipe Ribeiro: projects, experience and honors.

Static [Astro](https://astro.build) site, deployed to GitHub Pages on every push to `main`, served at [felipefrf.com](https://felipefrf.com).

## Editing

The site is in English (`/`) and Brazilian Portuguese (`/pt/`).

- Content (projects, jobs, honors, trajectory) lives in [`src/data/site.ts`](src/data/site.ts) and its translation [`src/data/site.pt.ts`](src/data/site.pt.ts). Keep the pair in the same shape.
- Interface copy for both languages is in [`src/i18n/ui.ts`](src/i18n/ui.ts).
- The home page is `src/components/Home.astro`, rendered by `src/pages/index.astro` and `src/pages/pt/index.astro`. `/penpad/` is English only.
- Visitors are routed in `src/layouts/Base.astro`: a saved choice from the EN | PT switch wins; otherwise a Portuguese browser goes to `/pt/`. If the domain is proxied through Cloudflare (orange cloud), visitors from Portuguese-speaking countries are also sent to `/pt/`, read from `/cdn-cgi/trace`.
- The MedAlvo and Império sections and the hero's words are in [`src/data/ventures.ts`](src/data/ventures.ts), both languages in one file.
- The home page uses the dark "night" identity (`src/styles/night.css`, loaded after `global.css` and `home.css`); `/penpad/` keeps the paper theme.
- Keep `public/llms.txt` in sync when the content changes.

## 3D and the simulation

- The hero (`src/scripts/orbit.ts`) integrates three orbits with RK4 under two-body gravity plus J2, in km and s, over a dotted Earth built from Natural Earth land polygons (`public/3d/land.bin`, int16 lat/lon × 100). three.js loads lazily after first paint.
- The satellite and the medals are made in Blender with Python, in [`3d/`](3d):

```sh
blender -b -P 3d/satellite.py -- public/3d          # satellite.glb (+ a check render)
# medals: one glTF per medal and language, then meshopt-compressed
blender -b -P 3d/medal_glb.py -- gold en /tmp/medal-gold-en.glb $PWD/3d/ribbon-gold.png
npx @gltf-transform/cli optimize /tmp/medal-gold-en.glb public/3d/medal-gold-en.glb \
  --compress meshopt --texture-compress webp --simplify-error 0.0004
```

The medals are rendered live by `src/scripts/medal3d.ts` (transparent, drag to turn). `3d/medal.py` is the older Cycles turntable, kept for stills.

- The Império walkthrough screens are in `public/media/imperio/app/`, captured from the field app's web preview with demo data; the copy is in `src/data/imperio-steps.ts`.
- The olympiad result crops in `public/img/olympiads/*-results.webp` come from the organizers' PDFs, linked under each one.

```sh
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # outputs dist/
```

Requires Node 22.23.4+ (see `.nvmrc`).

## Domain

`public/CNAME` sets the custom domain. DNS lives in Cloudflare:

| Type  | Name  | Target                 |
|-------|-------|------------------------|
| CNAME | `@`   | `felipefrf.github.io`  |
| CNAME | `www` | `felipefrf.github.io`  |

Keep them **DNS only** (grey cloud) until GitHub issues the HTTPS certificate. The `ssh` record used by the Cloudflare Tunnel is separate and stays untouched.
