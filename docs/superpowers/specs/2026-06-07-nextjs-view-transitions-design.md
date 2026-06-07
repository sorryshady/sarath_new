# Native View Transitions for Next 16 + Reusable Skill — Design

**Date:** 2026-06-07
**Status:** Approved (design), pending implementation plan
**Branch:** feat/photography-section

## Problem

The site's page transitions "don't work well." The current implementation hand-rolls
`document.startViewTransition()` around an async `router.push()` in the Next.js App
Router and waits only two `requestAnimationFrame`s before resolving the transition
callback:

```js
doc.startViewTransition(async () => {
  runTransition(variant);
  navigate();                    // router.push() — Next renders the new route ASYNCHRONOUSLY
  await new Promise(rAF → rAF);   // 2 frames — NOT enough for the new DOM to commit
});
```

`router.push()` returns before the destination page has rendered. Two rAFs do not wait
for it, so the browser snapshots the "new" state while the old page is still on screen,
producing a broken/janky transition. A parallel GSAP-portal path fakes the polaroid →
work-hero "shared element" morph because doing it natively across an async route is hard,
and a `waitForWorkHeroMorph` MutationObserver helper exists but is not wired into the VT
path.

## Decisive finding

This project runs **Next 16.2.7 + React 19.2.4**, which ship a **first-party, declarative
`<ViewTransition>` component from React** (documented in
`node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`). It is a strict
superset of the `next-view-transitions` library that the reference site used:

- The page transition fires automatically on navigation (route navigations are React
  transitions), and React waits for the new route to commit via its Suspense/transitions
  integration — **this fixes the root timing bug for free**.
- The root page animation is expressed as **CSS keyframes** (the transcript's technique)
  instead of JS WAAPI in `onTransitionReady` — functionally identical to the reference's
  `slideInOut`.
- It additionally provides declarative **shared-element morphs** (`name=`), **Suspense
  reveals**, **directional transition types**, and **same-route crossfades** — which the
  library has no clean answer for.

`AGENTS.md` mandated checking the bundled Next docs before writing code; that check is
what surfaced this. The earlier decision to adopt `next-view-transitions` was made before
this was known and has been **reversed**: we use React's native `<ViewTransition>`.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Deliverable | Fix the site **and** ship a reusable skill | User wants both |
| Engine | React native `<ViewTransition>` (`experimental.viewTransition: true`) | Superset of the library; fixes the bug; idiomatic for Next 16; least code |
| Shared morph | Native `view-transition-name` via `<ViewTransition name>` | The real CSS shared-element transition; deletes the GSAP portal |
| Skill home | Global `~/.claude/skills/nextjs-view-transitions/` | Reusable across every project |
| Fix scope | All navigation (default slide, polaroid→hero morph, poetry/about, GhostBar) | One coherent implementation, nothing left half-broken |

## Architecture

### 1. Enable the engine
- `next.config.ts`: add `experimental: { viewTransition: true }` (preserve existing
  `turbopack` and `images` config).
- `src/components/transitions/ViewTransition.tsx`: a single wrapper that re-exports
  React's `ViewTransition`. This is the one seam to adjust if the exact React build
  exports it under an `unstable_*` name. All app code imports from here.

### 2. Shared-element morph (polaroid → work hero)
- **Source** (`PolaroidCard` / current `PolaroidTransitionLink`): wrap the polaroid image
  in `<ViewTransition name={`work-hero-${slug}`} share="morph">`. Slugs are unique, so each
  card may carry its name permanently — React morphs only the card whose name exists on
  **both** the old and new pages. No imperative set-on-click DOM manipulation.
- **Destination** (`WorkHero`): wrap the `<Image>` in the same
  `<ViewTransition name={`work-hero-${slug}`} share="morph">`. Remove the
  `data-work-hero-morph` portal scaffolding and the `consumeFromPolaroidTransition` /
  `removeTransitionPortal` handshake.
- Navigation becomes a plain `next/link` `<Link>`; the morph fires automatically.
- Optional `::view-transition-image-pair(.morph)` `via-blur` keyframe to hide
  interpolation artifacts (per the guide).

### 3. Directional page slides + anchored GhostBar
- Wrap page content in a `<ViewTransition>` mapping transition types to enter/exit
  animations:
  ```tsx
  <ViewTransition
    enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
    exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
    default="none"
  >
  ```
- Links pass `transitionTypes={['nav-forward']}` or `['nav-back']` based on the site's
  navigation hierarchy. (`useRouter().push` also supports `transitionTypes` for
  programmatic navigation.)
- Port the existing `slideInOut` aesthetic (translateY + clip-path wipe) into CSS
  keyframes on the directional classes.
- **GhostBar**: assign `viewTransitionName: 'ghost-bar'` and CSS to suppress its animation
  (`::view-transition-group(ghost-bar){animation:none;z-index:100}`,
  `::view-transition-old(ghost-bar){display:none}`) so it stays fixed during slides and its
  theme-inversion is not snapshotted mid-transition.

### 4. Page-enter GSAP reveals (`Copy.tsx`)
- Keep the staggered/eased GSAP reveals, but **remove their dependency on the old
  `waitForPageEnter` / `sessionStorage` / `PAGE_ENTER_AT` timing hack** — that existed only
  to compensate for the manual transition. Reveals trigger on mount / after the transition
  commits. Address the "GSAP animating inside a frozen VT snapshot" timing so reveals start
  after the transition resolves (detail for the plan).

### 5. Reduced motion & browser support
- `@media (prefers-reduced-motion: reduce)` zeroing
  `::view-transition-old/new/group(*)` animation durations and delays.
- Progressive enhancement: no browser support → instant swap; the site works normally.
  (Chrome/Edge/Safari: full support, some Safari differences; Firefox: same-document
  transitions supported 139+, which is this site's case.)

### 6. The skill — `~/.claude/skills/nextjs-view-transitions/SKILL.md`
Teaches the **native React `<ViewTransition>` approach for Next 16+**:
- The `experimental.viewTransition` flag and the `import { ViewTransition } from 'react'`
  seam.
- The four patterns with copy-paste snippets: shared-element **morph**, **Suspense
  reveal**, **directional** slide, same-route **crossfade**.
- Header/anchor element pattern, reduced motion, browser-support matrix.
- Gotchas: `view-transition-name`/`name` uniqueness per page; `default="none"` to stop
  unrelated `<ViewTransition>`s from animating; experimental flag; GSAP-during-a-transition
  timing.
- A **"Migrating from hand-rolled `startViewTransition` or `next-view-transitions`"**
  section drawn directly from this refactor (the async-route-commit bug and its fix).

## Files deleted / rewritten

| File | Action |
|---|---|
| `src/lib/view-transition-nav.ts` | Delete (GSAP portal, `polaroidHeroTransition`, `navigateWithTransition`) |
| `src/lib/view-transition.ts` | Delete `slideInOut`, `waitForWorkHeroMorph`, `set/clearWorkHeroTransitionName`, `runTransition`, `waitForPageEnter`; keep only any pure constants still referenced |
| `src/components/navigation/TransitionLink.tsx` | Replace with `next/link` + `<ViewTransition>` usage |
| `src/components/navigation/PolaroidTransitionLink.tsx` | Replace with `next/link` + `<ViewTransition name>` wrapper |
| `src/lib/home-scroll.ts` | Remove portal/handshake helpers (`markFromPolaroidTransition`, `removeTransitionPortal`, `consumeFromPolaroidTransition`) |
| `src/styles/view-transitions.css` | Rewrite as declarative VT CSS (morph, directional, header anchor, reduced motion) |
| `src/components/home/photography/PhotographySection.tsx` | Update to new morph wiring |
| `src/components/navigation/GhostBar.tsx` | Update to anchored-header pattern + `transitionTypes` links |
| `src/components/copy/Copy.tsx` | Decouple GSAP reveals from old VT timing |
| `src/components/work/WorkHero.tsx` | Wrap image in `<ViewTransition name>`, drop portal scaffolding |
| `next.config.ts` | Add `experimental.viewTransition: true` |

## Risks

- **Suspense fallback hides the morph target.** If the work page's hero ever sits behind a
  Suspense skeleton, the morph destination may not exist at snapshot time. Mitigation: keep
  the hero image out of a skeleton boundary, or put the `name` on a stable wrapper that is
  always present. Verify during implementation.
- **`ViewTransition` export name.** The bundled doc shows `import { ViewTransition } from
  'react'`; the exact React 19.2.4 build may export it as `unstable_ViewTransition`. The
  single wrapper component isolates this; verify the import during implementation.
- **GhostBar theme inversion + VT snapshots.** The anchored-header CSS must prevent the
  inverted-theme state from being captured mid-slide. Verify visually.
- **GSAP reveals inside a frozen snapshot.** Ensure page-enter reveals start after the
  transition resolves, not during the snapshot.

## Success criteria

- Clicking a polaroid card morphs its image into the work-page hero (native, no GSAP
  portal).
- Default page navigations slide directionally; the GhostBar stays fixed.
- `prefers-reduced-motion` disables the motion; unsupported browsers swap instantly with no
  errors.
- The hand-rolled `startViewTransition`/portal/MutationObserver machinery is removed.
- `~/.claude/skills/nextjs-view-transitions/SKILL.md` exists and teaches the native
  approach with all four patterns and a migration section.
