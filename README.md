# Sarath Menon Portfolio

A cinematic personal site for **Sarath Menon** — photographer, filmmaker, and poet.
The brief is a single, scroll-driven experience that moves through his work across
stills, cinema, and verse, wrapped in a warm "darkroom and paper" aesthetic
(cream, aged parchment, darkroom crimson, cinema-dark) with film-grain texture and
GSAP-choreographed motion.

> **Status:** clean slate / replanning. Only the **Preloader → Hero** intro is
> kept and considered good. Everything else (photography section, page
> transitions, work-detail pages) has been stripped pending a full design plan.
> About, Films, Poetry, Works remain as navigable "coming soon" placeholder
> pages; the home page below the hero is empty color-stub sections.

## Premise

The home page (`src/app/(site)/page.tsx` → `HomePage`) is one vertical scroll.
Currently built:

1. **Preloader** — crimson intro, gated on the hero showreel being ready.
2. **Hero** — full-bleed video showreel (Vimeo/YouTube) with photographer /
   filmmaker labels and an LFS credit line, animating into the showreel.

Below the hero, `about` / `films` / `contact` are background-color section stubs
awaiting design. The nav bar (`GhostBar`) appears after the hero completes; some
of its links point at sections not yet rebuilt.

Standalone routes: `/films`, `/about`, `/poetry`, `/works` are placeholder
"coming soon" pages. The Sanity Studio is embedded at `/studio`.

## Tech stack

> ⚠️ This repo pins a **non-standard build of Next.js (16.2.7)** with breaking
> changes vs. public docs. Before writing app code, read the relevant guide in
> `node_modules/next/dist/docs/` — see `AGENTS.md`.

- **Next.js 16 / React 19** — App Router, route groups `(site)` and `(studio)`.
- **Sanity v5** (`next-sanity`) — headless CMS, embedded Studio at `/studio`.
- **GSAP** + `@gsap/react` — scroll and reveal animation (`GSAPProvider`).
- **Lenis** — smooth scroll (`LenisProvider`).
- **Tailwind v4** + **styled-components** — utility classes alongside
  component-scoped CSS files.
- **Zustand** — available for client state (no active store at the moment).

## Content model (Sanity)

Defined in `src/sanity/schemaTypes/`. Singletons are managed under **Site** in the
Studio structure (`src/sanity/structure.ts`):

| Type            | Kind      | Purpose                                                            |
| --------------- | --------- | ----------------------------------------------------------------- |
| `siteSettings`  | singleton | Hero showreel, labels, contact details, socials, SEO/OG defaults  |
| `aboutTeaser`   | singleton | Portrait + bio copy for the home About teaser                     |
| `poetryTeaser`  | singleton | Excerpt lines + reference to a featured poem                      |
| `photoSeries`   | document  | Cover, gallery, category, year, `featured`, `order`               |
| `film`          | document  | Vimeo/YouTube video, role (director/DoP/screenwriter), award, year |
| `poem`          | document  | Body (line breaks preserved), year, image, `featured`             |

Featured items surface on the home page; `order` controls sequence. Queries live
in `src/sanity/lib/queries.ts`.

## Design tokens

`src/styles/tokens.css` is the **single source of truth** for color, type, and
spacing — do not hardcode values. The exact palette anchors:

- `--color-cream` `#F9F6F0`, `--color-parchment-aged` `#EDE4D3`
- `--color-crimson` `#8B1E1E` (never substitute another red)
- `--color-cinema-dark` `#120F0A` (warm brown-black, never pure `#000`)

Original section briefs live in `reference files/*-build-prompt.md`.

## Getting started

```bash
cp .env.local.example .env.local   # fill in Sanity project credentials
npm run setup                      # install (preferred over raw npm install)
npm run dev                        # http://localhost:3000  (Studio at /studio)
```

Required env (see `.env.local.example`): `NEXT_PUBLIC_SANITY_PROJECT_ID`,
`NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, and server-only
`SANITY_API_READ_TOKEN` / `SANITY_API_WRITE_TOKEN` for migration and previews.
When Sanity is unconfigured, the site falls back to placeholder content
(`src/lib/featuredSeries.ts`).

## Scripts

```bash
npm run dev | build | start | lint   # standard Next.js
npm run migrate                      # tsx scripts/migrate-from-legacy.ts
npm run repair:photos                # tsx scripts/repair-photo-series.ts
npm run repair:films                 # tsx scripts/repair-films-video.ts
```

## Dependencies

Use the project npm wrapper to avoid Cursor/sandbox `devdir` warnings and keep install output clean:

```bash
npm run setup          # install (preferred over raw npm install)
npm run npm -- install # explicit wrapper
npm run npm -- audit   # audit without devdir noise
```

Direct `npm install` may show `Unknown env config "devdir"` when run inside Cursor — that comes from the sandbox injecting `npm_config_devdir`, not this project.

## Overrides

- `uuid` pinned to v11 via npm overrides (Sanity transitive deps)
- `jsdom` pinned to v29 (drops deprecated `whatwg-encoding`)
- `react-use` removed (replaced with `src/hooks/useMedia.ts`) — fixes high-severity `js-cookie` advisory

Remaining moderate audit findings are in Sanity/Next transitive deps; fixing them requires breaking downgrades (`npm audit fix --force` is not safe).
