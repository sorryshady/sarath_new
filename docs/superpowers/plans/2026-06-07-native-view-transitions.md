# Native View Transitions (Next 16) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken hand-rolled `document.startViewTransition` machinery with React 19's first-party `<ViewTransition>` component, delivering a reliable polaroid→work-hero shared-element morph and directional page slides, and ship a reusable `nextjs-view-transitions` skill.

**Architecture:** Enable `experimental.viewTransition` in Next config; route all view-transition usage through one wrapper component that re-exports React's `ViewTransition`. Shared-element morphs use matching `name` props on the polaroid card image and the work-page hero image. Directional page slides wrap `{children}` in the site layout, keyed by `<Link transitionTypes>`, with the per-page GhostBar anchored via `view-transition-name`. All bespoke transition JS (GSAP portal, MutationObserver, WAAPI `slideInOut`, sessionStorage timing handshake) is deleted.

**Tech Stack:** Next.js 16.2.7 (App Router, Turbopack), React 19.2.4 (`ViewTransition` from the bundled `react-experimental`), GSAP (retained for scroll/reveal only), Lenis, TypeScript (strict). No test framework — verify with `npx tsc --noEmit`, `npm run lint`, `npm run build`, and manual browser checks.

---

## Reference facts (verified during planning)

- Runtime: `import { ViewTransition } from 'react'` resolves to `node_modules/next/dist/compiled/react-experimental`, which exports `ViewTransition` (no `unstable_` prefix) **only when** `experimental.viewTransition: true` is set in `next.config.ts`.
- Types: `@types/react` ships `experimental.d.ts`/`canary.d.ts`. If `import { ViewTransition } from 'react'` fails to typecheck, isolate it in the wrapper with a `@ts-expect-error` and a locally-declared prop interface (Task 1).
- Props used: `name` (string — shared identity), `share` ("morph" | "auto"), `enter`/`exit` (string OR `{ [type]: string; default: string }`), `default` ("none"). `transitionTypes` is a prop on `next/link`'s `<Link>` and an option on `useRouter().push`.
- GhostBar renders per-page: `src/components/home/HomePage.tsx:71` and `src/app/(site)/work/[slug]/page.tsx:53,110`.
- No `test` script; do not invent one. Verification is typecheck + lint + build + browser.

## File structure (what each unit owns)

| File | Responsibility after refactor |
|---|---|
| `next.config.ts` | Enables `experimental.viewTransition` |
| `src/components/transitions/ViewTransition.tsx` | **New.** Single import seam re-exporting React's `ViewTransition` with safe local types |
| `src/components/work/WorkHero.tsx` | Morph destination: wraps hero `<Image>` in `<ViewTransition name>`; no portal logic |
| `src/components/home/photography/PolaroidCard.tsx` | Morph source: wraps card image in `<ViewTransition name>` |
| `src/components/home/photography/PhotographySection.tsx` | Plain `router.push` navigation + scroll-save; no `navigateWithTransition` |
| `src/app/(site)/layout.tsx` | Wraps `{children}` in the directional page `<ViewTransition>` |
| `src/components/navigation/GhostBar.tsx` | Uses `next/link` `<Link>` + `transitionTypes`; anchors nav via `view-transition-name` |
| `src/styles/view-transitions.css` | Declarative VT CSS: morph, directional slide, header anchor, reduced motion |
| `src/components/copy/Copy.tsx` | GSAP reveals decoupled from old transition timing |
| `src/lib/home-scroll.ts` | Scroll restoration only; portal helpers removed |
| `src/lib/view-transition.ts` / `view-transition-nav.ts` | **Deleted** |
| `src/components/navigation/TransitionLink.tsx` / `PolaroidTransitionLink.tsx` | **Deleted** |
| `~/.claude/skills/nextjs-view-transitions/SKILL.md` | **New.** Reusable skill |

> Work on branch `feat/photography-section` (already checked out). Commit after every task.

---

### Task 1: Enable the engine and create the wrapper

**Files:**
- Modify: `next.config.ts`
- Create: `src/components/transitions/ViewTransition.tsx`

- [ ] **Step 1: Enable the experimental flag**

Edit `next.config.ts` — add an `experimental` block alongside the existing config (keep `turbopack` and `images` exactly as they are):

```ts
const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};
```

- [ ] **Step 2: Create the wrapper component**

Create `src/components/transitions/ViewTransition.tsx`. First try the clean import. If `npx tsc --noEmit` (Step 3) reports `ViewTransition` is not exported from `'react'`, switch to the `@ts-expect-error` variant shown below it.

Clean version (preferred):

```tsx
'use client';

import { ViewTransition } from 'react';

export { ViewTransition };
```

Fallback version (only if the clean import does not typecheck) — keeps the type surface we actually use in one place:

```tsx
'use client';

// React's <ViewTransition> ships in the experimental build Next aliases in when
// experimental.viewTransition is enabled. Stable @types/react does not re-export
// it from the package root yet, so we type the props we use locally.
// @ts-expect-error - experimental React export not in the root type surface
import { ViewTransition as ReactViewTransition } from 'react';
import type { ReactNode } from 'react';

type DirectionalAnim = string | { [transitionType: string]: string };

export interface ViewTransitionProps {
  name?: string;
  share?: 'morph' | 'auto';
  enter?: DirectionalAnim;
  exit?: DirectionalAnim;
  default?: string;
  children: ReactNode;
}

export const ViewTransition = ReactViewTransition as (
  props: ViewTransitionProps,
) => ReactNode;
```

- [ ] **Step 3: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors referencing `ViewTransition` or `next.config.ts`. (Pre-existing unrelated errors, if any, are out of scope — note them but do not fix here.)

- [ ] **Step 4: Verify the dev server boots with the flag**

Run: `npm run dev` then stop it once it prints the local URL without a config error about `viewTransition`.
Expected: server starts; no "unrecognized experimental option" warning.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts src/components/transitions/ViewTransition.tsx
git commit -m "feat(transitions): enable React ViewTransition engine + wrapper"
```

---

### Task 2: Shared-element morph — destination (WorkHero) and source (PolaroidCard)

**Files:**
- Modify: `src/components/work/WorkHero.tsx`
- Modify: `src/components/home/photography/PolaroidCard.tsx`

- [ ] **Step 1: Rewrite WorkHero as a pure morph destination**

Replace the entire contents of `src/components/work/WorkHero.tsx` with the version below. This drops the GSAP portal handshake (`consumeFromPolaroidTransition`, `removeTransitionPortal`), the `data-work-hero-morph` attribute, and the opacity tween — the morph is now declarative.

```tsx
'use client';

import Image from 'next/image';

import { ViewTransition } from '@/components/transitions/ViewTransition';

type WorkHeroProps = {
  slug: string;
  imageSrc: string;
  imageAlt: string;
};

export function WorkHero({ slug, imageSrc, imageAlt }: WorkHeroProps) {
  return (
    <ViewTransition name={`work-hero-${slug}`} share="morph">
      <div className="work-hero-morph relative w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </ViewTransition>
  );
}
```

- [ ] **Step 2: Wrap the polaroid card image in a matching ViewTransition**

In `src/components/home/photography/PolaroidCard.tsx`, add the import at the top (after the `Image` import):

```tsx
import { ViewTransition } from '@/components/transitions/ViewTransition';
```

Then wrap the existing `polaroid-card__image-wrap` div. Replace this block:

```tsx
                <div
                  className="polaroid-card__image-wrap"
                  data-work-hero-morph={series.slug}
                >
                  <Image
                    src={series.coverImage}
                    alt={series.title}
                    fill
                    sizes="(max-width: 767px) 200px, (max-width: 1023px) 150px, 200px"
                    className="polaroid-image polaroid-card__image"
                  />
                  <div className="polaroid-card__hover-overlay">
                    <span className="polaroid-card__hover-title">
                      {series.title}
                    </span>
                    <span className="polaroid-card__hover-frames">
                      {series.frameCount} frames
                    </span>
                  </div>
                </div>
```

with this (only the `<Image>` is inside the morph wrapper, so the hover overlay does not morph):

```tsx
                <div className="polaroid-card__image-wrap">
                  <ViewTransition name={`work-hero-${series.slug}`} share="morph">
                    <Image
                      src={series.coverImage}
                      alt={series.title}
                      fill
                      sizes="(max-width: 767px) 200px, (max-width: 1023px) 150px, 200px"
                      className="polaroid-image polaroid-card__image"
                    />
                  </ViewTransition>
                  <div className="polaroid-card__hover-overlay">
                    <span className="polaroid-card__hover-title">
                      {series.title}
                    </span>
                    <span className="polaroid-card__hover-frames">
                      {series.frameCount} frames
                    </span>
                  </div>
                </div>
```

> Note: every card carries a distinct `name` (slugs are unique). React only morphs the card whose `name` also exists on the destination page. The `data-work-hero-morph` attribute is intentionally removed — Task 3 stops reading it.

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors. (`PhotographySection.tsx` still references `navigateWithTransition` and `data-work-hero-morph`; that is fixed in Task 3. If tsc errors only point there, proceed.)

- [ ] **Step 4: Commit**

```bash
git add src/components/work/WorkHero.tsx src/components/home/photography/PolaroidCard.tsx
git commit -m "feat(transitions): declarative morph on work hero + polaroid card"
```

---

### Task 3: Simplify PhotographySection navigation

**Files:**
- Modify: `src/components/home/photography/PhotographySection.tsx`

- [ ] **Step 1: Remove the navigateWithTransition import**

Delete this import line (around line 13):

```tsx
import { navigateWithTransition } from '@/lib/view-transition-nav';
```

- [ ] **Step 2: Replace `handleSeriesClick` with a plain navigation**

Replace the whole `handleSeriesClick` callback (currently lines ~136-178) with the version below. Navigation is now a plain `router.push`; the route change is itself a React transition, so the morph (Task 2) fires automatically. We keep `markHomeReturn` for scroll restoration and drop the GSAP portal/sibling-fade orchestration.

```tsx
  const handleSeriesClick = useCallback(
    (slug: string) => {
      const scrollY =
        typeof lenis?.scroll === 'number' ? lenis.scroll : window.scrollY;
      markHomeReturn(scrollY);
      router.push(`/work/${slug}`);
    },
    [lenis, router],
  );
```

- [ ] **Step 3: Update both `onClick` call sites**

The mobile strip (around line 581) and the desktop grid (around line 634) both call `handleSeriesClick` with the old 3-arg signature. Change both to pass just the slug:

Mobile strip — replace:

```tsx
                  onClick={() =>
                    handleSeriesClick(
                      item.slug,
                      item.coverImage,
                      polaroidRefs.current[index]!,
                    )
                  }
```

with:

```tsx
                  onClick={() => handleSeriesClick(item.slug)}
```

Desktop grid — replace:

```tsx
                onClick={() =>
                  handleSeriesClick(
                    item.slug,
                    item.coverImage,
                    polaroidRefs.current[index]!,
                  )
                }
```

with:

```tsx
                onClick={() => handleSeriesClick(item.slug)}
```

- [ ] **Step 4: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `PhotographySection.tsx`. (`view-transition-nav.ts` / `view-transition.ts` still exist; they are deleted in Task 6.)

- [ ] **Step 5: Commit**

```bash
git add src/components/home/photography/PhotographySection.tsx
git commit -m "refactor(transitions): plain router.push for polaroid navigation"
```

---

### Task 4: Directional page slides + GhostBar migration

**Files:**
- Modify: `src/app/(site)/layout.tsx`
- Modify: `src/components/navigation/GhostBar.tsx`

- [ ] **Step 1: Wrap site children in a directional ViewTransition**

In `src/app/(site)/layout.tsx`, add the import:

```tsx
import { ViewTransition } from '@/components/transitions/ViewTransition';
```

Then wrap `{children}` (currently inside `LenisProvider`, after `<ScrollRestoration />`). Replace:

```tsx
          <ScrollRestoration />
          {children}
```

with:

```tsx
          <ScrollRestoration />
          <ViewTransition
            enter={{
              'nav-forward': 'nav-forward',
              'nav-back': 'nav-back',
              default: 'none',
            }}
            exit={{
              'nav-forward': 'nav-forward',
              'nav-back': 'nav-back',
              default: 'none',
            }}
            default="none"
          >
            {children}
          </ViewTransition>
```

> `default="none"` means navigations WITHOUT a transition type (the polaroid click in Task 3) do not slide — only the shared morph plays. Links tagged `nav-forward`/`nav-back` (Step 3) slide directionally. The per-page GhostBar inside `{children}` is held still by the anchor CSS in Task 5.

- [ ] **Step 2: Replace TransitionLink with next/link in GhostBar**

In `src/components/navigation/GhostBar.tsx`, change the import. Replace:

```tsx
import { TransitionLink } from './TransitionLink';
```

with:

```tsx
import Link from 'next/link';
```

- [ ] **Step 3: Update GhostBar link usages with transitionTypes**

There are three `TransitionLink` usages. Update each to `Link`.

`NavBrand` (the home/logo link — treat as "back"). Replace:

```tsx
    <TransitionLink href="/" className={className} onClick={onClick}>
      <NavLogo className={logoClassName} />
      {/* <span className={initialsClassName}>SM</span> */}
      <span className="sr-only">Sarath Menon home</span>
    </TransitionLink>
```

with:

```tsx
    <Link
      href="/"
      className={className}
      onClick={onClick}
      transitionTypes={['nav-back']}
    >
      <NavLogo className={logoClassName} />
      {/* <span className={initialsClassName}>SM</span> */}
      <span className="sr-only">Sarath Menon home</span>
    </Link>
```

Desktop nav items (forward). Replace:

```tsx
              <TransitionLink
                href={item.href}
                className={`ghost-bar__link${activeLink === item.id ? ' ghost-bar__link--active' : ''}`}
                onClick={(event) => handleSectionClick(event, item)}
              >
                {item.label}
              </TransitionLink>
```

with:

```tsx
              <Link
                href={item.href}
                className={`ghost-bar__link${activeLink === item.id ? ' ghost-bar__link--active' : ''}`}
                transitionTypes={['nav-forward']}
                onClick={(event) => handleSectionClick(event, item)}
              >
                {item.label}
              </Link>
```

Mobile menu items (forward). Replace:

```tsx
              <TransitionLink
                key={item.id}
                href={item.href}
                className={`mobile-menu__link${activeLink === item.id ? ' mobile-menu__link--active' : ''}`}
                onClick={(event) => handleMobileLinkClick(event, item)}
              >
                {item.label}
              </TransitionLink>
```

with:

```tsx
              <Link
                key={item.id}
                href={item.href}
                className={`mobile-menu__link${activeLink === item.id ? ' mobile-menu__link--active' : ''}`}
                transitionTypes={['nav-forward']}
                onClick={(event) => handleMobileLinkClick(event, item)}
              >
                {item.label}
              </Link>
```

- [ ] **Step 4: Anchor the nav element**

Give the `<nav>` a stable view-transition name so it does not slide. In the `return`, change the opening `<nav>` tag. Replace:

```tsx
      <nav
        ref={navRef}
        aria-label="Primary"
        className="ghost-bar"
        data-theme={navTheme}
      >
```

with:

```tsx
      <nav
        ref={navRef}
        aria-label="Primary"
        className="ghost-bar"
        data-theme={navTheme}
        style={{ viewTransitionName: 'ghost-bar' }}
      >
```

- [ ] **Step 5: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. If `transitionTypes` is not on `next/link`'s types in this build, isolate by casting the prop or confirm via `node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`. Do not remove the prop — verify the correct name there.

- [ ] **Step 6: Commit**

```bash
git add src/app/(site)/layout.tsx src/components/navigation/GhostBar.tsx
git commit -m "feat(transitions): directional page slides + anchored GhostBar"
```

---

### Task 5: Rewrite the view-transitions CSS

**Files:**
- Modify: `src/styles/view-transitions.css`

- [ ] **Step 1: Replace the transition rules**

Replace the entire top section of `src/styles/view-transitions.css` (everything ABOVE the `html.lenis {` rule — i.e. the current lines 1-47) with the declarative CSS below. **Keep the existing Lenis rules (`html.lenis`, `.lenis.lenis-smooth`, etc.) intact** at the bottom of the file, and replace the old reduced-motion block at the very bottom with the one here.

```css
/* ---- Shared-element morph (polaroid card image <-> work hero) ---- */
::view-transition-group(.morph) {
  animation-duration: 650ms;
  animation-timing-function: cubic-bezier(0.87, 0, 0.13, 1);
}
::view-transition-image-pair(.morph) {
  isolation: isolate;
}
/* Soften pixel interpolation mid-morph. */
::view-transition-image-pair(.morph) {
  animation-name: vt-morph-blur;
}
@keyframes vt-morph-blur {
  30% {
    filter: blur(3px);
  }
}

/* ---- Directional page slides (GhostBar nav links) ---- */
::view-transition-old(.nav-forward) {
  --vt-slide: -60px;
  animation:
    150ms ease-in both vt-fade reverse,
    400ms ease-in-out both vt-slide reverse;
}
::view-transition-new(.nav-forward) {
  --vt-slide: 60px;
  animation:
    210ms ease-out 150ms both vt-fade,
    400ms ease-in-out both vt-slide;
}
::view-transition-old(.nav-back) {
  --vt-slide: 60px;
  animation:
    150ms ease-in both vt-fade reverse,
    400ms ease-in-out both vt-slide reverse;
}
::view-transition-new(.nav-back) {
  --vt-slide: -60px;
  animation:
    210ms ease-out 150ms both vt-fade,
    400ms ease-in-out both vt-slide;
}

@keyframes vt-fade {
  from {
    opacity: 0;
    filter: blur(3px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}
@keyframes vt-slide {
  from {
    translate: var(--vt-slide);
  }
  to {
    translate: 0;
  }
}

/* ---- Anchor the GhostBar: it must not slide with the page ---- */
::view-transition-group(ghost-bar) {
  animation: none;
  z-index: 100;
}
::view-transition-old(ghost-bar) {
  display: none;
}
::view-transition-new(ghost-bar) {
  animation: none;
}
```

- [ ] **Step 2: Replace the reduced-motion block**

At the bottom of the file, replace the existing `@media (prefers-reduced-motion: reduce)` block with:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*),
  ::view-transition-new(*),
  ::view-transition-group(*) {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
  }
}
```

- [ ] **Step 3: Confirm the CSS is imported**

Run: `grep -rn "view-transitions.css" src/`
Expected: at least one import (e.g. in `globals.css` or a layout). If it is NOT imported anywhere, add `@import './styles/view-transitions.css';` to `src/app/globals.css` (top, after other imports). Confirm before assuming.

- [ ] **Step 4: Verify build compiles CSS**

Run: `npx tsc --noEmit`
Expected: no errors (CSS is not typechecked, but this confirms no TS regressions).

- [ ] **Step 5: Commit**

```bash
git add src/styles/view-transitions.css src/app/globals.css
git commit -m "feat(transitions): declarative VT CSS (morph, slides, anchor, reduced-motion)"
```

---

### Task 6: Decouple Copy.tsx, delete dead modules

**Files:**
- Modify: `src/components/copy/Copy.tsx`
- Modify: `src/lib/home-scroll.ts`
- Delete: `src/lib/view-transition.ts`, `src/lib/view-transition-nav.ts`, `src/components/navigation/TransitionLink.tsx`, `src/components/navigation/PolaroidTransitionLink.tsx`

- [ ] **Step 1: Inline the ENTER_* constants into Copy.tsx and drop waitForPageEnter**

In `src/components/copy/Copy.tsx`, replace the import block:

```tsx
import {
  ENTER_DURATION,
  ENTER_EASE,
  ENTER_STAGGER,
  PAGE_ENTER_BUFFER_S,
  waitForPageEnter,
} from '@/lib/view-transition';
```

with local constants (these were the only remaining consumer of that module):

```tsx
const ENTER_DURATION = 0.75;
const ENTER_STAGGER = 0.06;
const ENTER_EASE = 'power4.out';
```

Then, in `initializeSplitText`, remove the page-enter wait. Replace:

```tsx
        let pageEnterDelay = 0;
        if (!animateOnScroll) {
          await waitForPageEnter();
          pageEnterDelay = PAGE_ENTER_BUFFER_S;
        }

        const animationProps = {
          y: '0%',
          duration: animateOnScroll ? 1 : ENTER_DURATION,
          stagger: animateOnScroll ? 0.1 : ENTER_STAGGER,
          ease: animateOnScroll ? 'power4.out' : ENTER_EASE,
          delay: delay + pageEnterDelay,
          onComplete,
        };
```

with:

```tsx
        const animationProps = {
          y: '0%',
          duration: animateOnScroll ? 1 : ENTER_DURATION,
          stagger: animateOnScroll ? 0.1 : ENTER_STAGGER,
          ease: animateOnScroll ? 'power4.out' : ENTER_EASE,
          delay,
          onComplete,
        };
```

> The reveals now play on mount. Because the new route is committed before the GSAP `useGSAP` effect runs, the reveal animates on the live page after the transition resolves — no sessionStorage timing handshake needed.

- [ ] **Step 2: Remove the portal helpers from home-scroll.ts**

In `src/lib/home-scroll.ts`, delete the now-unused constant and three functions (the scroll-restoration helpers stay):

Delete this line:

```tsx
export const FROM_POLAROID_TRANSITION_KEY = 'fromPolaroidTransition';
```

Delete these three functions:

```tsx
export function markFromPolaroidTransition(): void {
  sessionStorage.setItem(FROM_POLAROID_TRANSITION_KEY, 'true');
}

export function consumeFromPolaroidTransition(): boolean {
  const value = sessionStorage.getItem(FROM_POLAROID_TRANSITION_KEY) === 'true';
  sessionStorage.removeItem(FROM_POLAROID_TRANSITION_KEY);
  return value;
}

export function removeTransitionPortal(): void {
  document.querySelector('[data-transition-portal]')?.remove();
}
```

- [ ] **Step 3: Delete the dead modules**

Run:

```bash
git rm src/lib/view-transition.ts \
       src/lib/view-transition-nav.ts \
       src/components/navigation/TransitionLink.tsx \
       src/components/navigation/PolaroidTransitionLink.tsx
```

- [ ] **Step 4: Confirm nothing still imports the deleted modules**

Run:

```bash
grep -rn "view-transition'\|view-transition\"\|view-transition-nav\|TransitionLink\|PolaroidTransitionLink\|waitForPageEnter\|navigateWithTransition\|consumeFromPolaroidTransition\|removeTransitionPortal\|markFromPolaroidTransition\|data-work-hero-morph\|data-transition-portal" src/
```

Expected: **no output.** Any hit is a dangling reference — fix it before continuing. (`PolaroidTransitionLink` was already not imported anywhere per planning; confirm.)

- [ ] **Step 5: Full typecheck + production build**

Run: `npx tsc --noEmit && npm run build`
Expected: typecheck clean; build succeeds. Address any error that traces to a file touched in Tasks 1-6.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(transitions): delete hand-rolled VT machinery, decouple Copy"
```

---

### Task 7: Manual browser verification

**Files:** none (verification only)

- [ ] **Step 1: Start the app**

Run: `npm run dev`
Open the printed local URL in Chrome (or Edge).

- [ ] **Step 2: Verify the morph**

Scroll to the photography section, let the cards settle, click a polaroid.
Expected: the clicked card's image **morphs/expands** into the work-page hero (one continuous element, no portal flash, no blank frame). Click the browser Back button.
Expected: the hero morphs back toward the card position; the home scroll position is restored (Lenis lands where you left).

- [ ] **Step 3: Verify directional slides + anchored nav**

From home, click a GhostBar nav link (e.g. About).
Expected: page content slides left with a soft fade; the GhostBar stays fixed (does not slide). Click the logo (nav-back).
Expected: content slides right; GhostBar still fixed.

- [ ] **Step 4: Verify reduced motion**

In DevTools, Rendering panel → emulate `prefers-reduced-motion: reduce`. Repeat Steps 2-3.
Expected: navigations swap instantly, no sliding/morphing, no errors.

- [ ] **Step 5: Verify graceful absence of support**

Confirm no uncaught console errors during any navigation. (In a browser without VT support the pages simply swap — acceptable.)

- [ ] **Step 6: If a check fails**

Use superpowers:systematic-debugging. Common culprits: morph not firing → names differ between card and hero, or the hero sits behind a Suspense fallback (move the `name` to an always-present wrapper); GhostBar slides → `view-transition-name`/anchor CSS mismatch; nothing animates → `experimental.viewTransition` not picked up (restart dev server).

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix(transitions): browser verification adjustments"
```

(Skip if no changes were needed.)

---

### Task 8: Write the reusable skill

**Files:**
- Create: `~/.claude/skills/nextjs-view-transitions/SKILL.md`

- [ ] **Step 1: Create the skill directory**

```bash
mkdir -p ~/.claude/skills/nextjs-view-transitions
```

- [ ] **Step 2: Write SKILL.md**

Create `~/.claude/skills/nextjs-view-transitions/SKILL.md` with the content below. It must teach the native approach and include the migration lesson from this refactor.

````markdown
---
name: nextjs-view-transitions
description: Use when implementing page or element view transitions in a Next.js App Router project (Next 15+/16 with React 19) — shared-element morphs (thumbnail→hero), directional page slides, Suspense reveals, same-route crossfades — or when migrating off hand-rolled document.startViewTransition or the next-view-transitions library.
---

# Next.js View Transitions (native React `<ViewTransition>`)

For Next.js App Router (16.x) + React 19.2+. Use React's first-party
`<ViewTransition>` — do NOT hand-roll `document.startViewTransition` around
`router.push` (the new route renders asynchronously; manual rAF timing snapshots
the old DOM and breaks), and do NOT reach for `next-view-transitions` (it is a
strict subset of what ships natively).

## Enable it

```ts
// next.config.ts
const nextConfig = { experimental: { viewTransition: true } };
```

`import { ViewTransition } from 'react'`. Route navigations are React transitions,
so wrapped elements animate automatically — no JS plumbing. Without browser
support the page simply swaps (progressive enhancement).

## Four patterns

1. **Shared-element morph** — same `name` on source + destination; add
   `share="morph"` to target it in CSS.
   ```tsx
   <ViewTransition name={`photo-${id}`} share="morph"><Image .../></ViewTransition>
   ```
   `name` must be unique per page. Distinct names (e.g. per slug) may all stay
   mounted; React morphs only the one present on both old and new pages.

2. **Directional slides** — tag links, map types to animations.
   ```tsx
   <Link href={href} transitionTypes={['nav-forward']}>…</Link>
   <ViewTransition enter={{ 'nav-forward':'nav-forward', default:'none' }}
                   exit={{ 'nav-forward':'nav-forward', default:'none' }}
                   default="none">{children}</ViewTransition>
   ```
   `default="none"` stops untyped navigations (and unrelated transitions) from
   triggering this animation.

3. **Suspense reveal** — `<ViewTransition exit="slide-down">` on the fallback,
   `<ViewTransition enter="slide-up" default="none">` on the content.

4. **Same-route crossfade** — `<ViewTransition key={slug} share="auto" enter="auto">`.

## Anchor a persistent header

```tsx
<header style={{ viewTransitionName: 'site-header' }}>…</header>
```
```css
::view-transition-group(site-header){ animation:none; z-index:100 }
::view-transition-old(site-header){ display:none }
::view-transition-new(site-header){ animation:none }
```

## CSS targets

`::view-transition-group(.class)`, `::view-transition-image-pair(.class)`,
`::view-transition-old(.class)`, `::view-transition-new(.class)`. The class comes
from `share`/`enter`/`exit` values. A `via-blur` keyframe on the image-pair hides
morph interpolation artifacts.

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*) {
    animation-duration: 0s !important; animation-delay: 0s !important;
  }
}
```

## Gotchas

- Runtime exports `ViewTransition` (no `unstable_`) from `react` ONLY when the
  experimental flag is on (Next aliases `react`→`react-experimental`). If types
  don't resolve, wrap it in one component with a `@ts-expect-error` + local props.
- Morph target behind a Suspense fallback won't exist at snapshot time — put the
  `name` on an always-present element.
- GSAP/JS reveals: let them run on mount AFTER the transition commits; don't try
  to drive the transition itself with GSAP.
- Browser support: Chrome/Edge/Safari full (minor Safari differences); Firefox
  supports same-document (SPA) transitions from 139+. Cross-document (MPA, the
  `@view-transition { navigation: auto }` CSS rule) is separate and not in Firefox.

## Migrating from hand-rolled / next-view-transitions

Delete: the `document.startViewTransition` wrapper, rAF/sessionStorage timing
hacks, WAAPI `slideInOut`, GSAP "portal" element-morph fakes, and
MutationObserver waits for the destination element. Replace with `name` props on
source+destination and a `<ViewTransition>` around page content. The async
route-commit problem disappears because React owns the transition lifecycle.
````

- [ ] **Step 3: Verify the skill is well-formed**

Run: `head -5 ~/.claude/skills/nextjs-view-transitions/SKILL.md`
Expected: valid YAML frontmatter with `name:` and `description:`.

- [ ] **Step 4: No commit (lives outside the repo)**

The skill is in `~/.claude/skills/`, not this repo — nothing to commit. Note its path to the user.

---

## Self-review (completed by planner)

- **Spec coverage:** Engine enable (T1) ✓; native morph (T2) ✓; directional + GhostBar anchor (T4/T5) ✓; GSAP decouple (T6) ✓; reduced motion + browser support (T5/T7) ✓; deletions (T6) ✓; skill with 4 patterns + migration (T8) ✓. Suspense-reveal/crossfade patterns are covered in the skill but not separately wired on the site (out of current site scope; the spec only required the skill to teach them).
- **Placeholders:** none — every code step shows full before/after.
- **Type consistency:** wrapper exports `ViewTransition`; all consumers import from `@/components/transitions/ViewTransition`; morph name format `work-hero-${slug}` identical in PolaroidCard and WorkHero; transition-type tokens `nav-forward`/`nav-back` identical in GhostBar links, the layout `<ViewTransition>`, and the CSS classes.
- **Risk follow-through:** Suspense/morph and `ViewTransition` export-name risks from the spec are handled in T2-Step note, T6-Step6, and T1-Step2.
