# felipefrf.com

Personal site of Felipe Ribeiro: projects, experience and honors.

Static [Astro](https://astro.build) site, deployed to GitHub Pages on every push to `main`, served at [felipefrf.com](https://felipefrf.com).

## Editing

The site is in English (`/`) and Brazilian Portuguese (`/pt/`).

- Content (projects, jobs, honors, trajectory) lives in [`src/data/site.ts`](src/data/site.ts) and its translation [`src/data/site.pt.ts`](src/data/site.pt.ts); the system diagrams in `src/data/systems.ts` / `systems.pt.ts`. Keep each pair in the same shape.
- Interface copy for both languages is in [`src/i18n/ui.ts`](src/i18n/ui.ts).
- The home page is `src/components/Home.astro`, rendered by `src/pages/index.astro` and `src/pages/pt/index.astro`. `/penpad/` is English only.
- Visitors are routed in `src/layouts/Base.astro`: a saved choice from the EN | PT switch wins; otherwise a Portuguese browser goes to `/pt/`. If the domain is proxied through Cloudflare (orange cloud), visitors from Portuguese-speaking countries are also sent to `/pt/`, read from `/cdn-cgi/trace`.
- Keep `public/llms.txt` in sync when the content changes.

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
