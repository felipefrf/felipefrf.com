# felipefrf.com

Personal site of Felipe Ribeiro: projects, experience and honors.

Static [Astro](https://astro.build) site, deployed to GitHub Pages on every push to `main`, served at [felipefrf.com](https://felipefrf.com).

## Editing

All copy (projects, jobs, honors, toolbox, trajectory waypoints) lives in [`src/data/site.ts`](src/data/site.ts). Layout is in `src/pages/index.astro`, styles in `src/styles/global.css`. Keep `public/llms.txt` in sync when the content changes.

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
