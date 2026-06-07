# Selected Work Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the polaroid-stack "Selected Work" section with a two-column gallery — a curtain-reveal hero (left) and a vertical folder rail + animated metadata (right) — with a directional GSAP slide-swap on folder change and the existing shared-element morph into `/work/[slug]`, plus a reusable `RevealImage` component.

**Architecture:** A rewritten `PhotographySection` owns `selectedIndex` + slide `direction` and composes three new presentational pieces: `SelectedWorkHero` (curtain reveal on first paint via `RevealImage`, GSAP layered slide on change, `<ViewTransition>` morph + click-to-route), `FolderRail` (thumbnail list/strip), `FolderMeta` (SplitText line-mask). The polaroid machinery is deleted.

**Tech Stack:** Next.js 16 (App Router), React 19, GSAP + `@gsap/react` `useGSAP` (ScrollTrigger, SplitText — registered globally in `GSAPProvider`), `next/image`, Lenis, React `<ViewTransition>` (already wired). No test framework — verify with `npx tsc --noEmit`, `npm run build`, and manual browser checks.

---

## Reference facts (verified during planning)

- `HomePage` renders `<PhotographySection series={featuredSeries} scrollReady={...} />`. Keep the props signature accepting `series` (required) and `scrollReady` (optional, unused) so `HomePage` is untouched.
- `PhotoSeries` fields: `title, slug, coverImage, category, year, frameCount, featured, order`.
- `getAnimationMode()` from `@/lib/animationMode` returns `'reduced'` for `prefers-reduced-motion` or low core count — use it to gate all animation. `getStackRotation` is scatter-only and is removed in Task 7.
- The morph into the route works because both the source image and `WorkHero` carry `view-transition-name: work-hero-${slug}` (via `<ViewTransition name>`). Only ONE element per page may carry a given name — keep it on the hero's resting layer only.
- `markHomeReturn(scrollY)` from `@/lib/home-scroll` saves home scroll for restoration on back-nav.
- `SplitText` and `ScrollTrigger` are registered in `GSAPProvider`; re-registering in a component via `gsap.registerPlugin` is idempotent and safe.
- CSS file is imported by `PhotographySection` via `import './photography-section.css'`.

## File structure

| File | Action |
|---|---|
| `src/components/media/RevealImage.tsx` | **Create** — reusable curtain-reveal image |
| `src/components/home/photography/FolderMeta.tsx` | **Create** — animated metadata |
| `src/components/home/photography/FolderRail.tsx` | **Create** — thumbnail list/strip |
| `src/components/home/photography/SelectedWorkHero.tsx` | **Create** — hero: reveal + slide + morph |
| `src/components/home/photography/PhotographySection.tsx` | **Rewrite** — compose, own state |
| `src/components/home/photography/photography-section.css` | **Rewrite** — new layout |
| `src/components/home/photography/PolaroidCard.tsx` | **Delete** |
| `src/lib/animationMode.ts` | Remove `getStackRotation` |

> Work on branch `feat/photography-section` (already checked out). Commit after each task.

---

### Task 1: Reusable `RevealImage` component

**Files:**
- Create: `src/components/media/RevealImage.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/media/RevealImage.tsx`:

```tsx
'use client';

import Image from 'next/image';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { getAnimationMode } from '@/lib/animationMode';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type RevealTrigger = 'in-view' | 'scroll-linked' | 'immediate';
export type RevealDirection = 'up' | 'down' | 'left' | 'right';

export interface RevealImageProps {
  src: string;
  alt: string;
  /** 'in-view' plays once on scroll-in; 'scroll-linked' scrubs to scroll; 'immediate' plays on mount. */
  trigger?: RevealTrigger;
  /** Curtain axis. 'up' reveals bottom→top (curtain pulls up). */
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  ease?: string;
  /** ScrollTrigger start for 'in-view'/'scroll-linked'. */
  start?: string;
  once?: boolean;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  onRevealComplete?: () => void;
}

// clip-path inset(top right bottom left). Each hidden state collapses the visible
// box against one edge so the reveal grows away from that edge.
const HIDDEN: Record<RevealDirection, string> = {
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 0% 0% 100%)',
  right: 'inset(0% 100% 0% 0%)',
};
const SHOWN = 'inset(0% 0% 0% 0%)';

export function RevealImage({
  src,
  alt,
  trigger = 'in-view',
  direction = 'up',
  delay = 0,
  duration = 0.9,
  ease = 'power4.inOut',
  start = 'top 80%',
  once = true,
  fill = true,
  sizes,
  priority,
  className = '',
  imageClassName = '',
  onRevealComplete,
}: RevealImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = wrapRef.current;
      if (!el) return;

      if (getAnimationMode() === 'reduced') {
        gsap.set(el, { clipPath: SHOWN });
        onRevealComplete?.();
        return;
      }

      gsap.set(el, { clipPath: HIDDEN[direction] });

      if (trigger === 'immediate') {
        gsap.to(el, {
          clipPath: SHOWN,
          duration,
          delay,
          ease,
          onComplete: onRevealComplete,
        });
        return;
      }

      if (trigger === 'scroll-linked') {
        gsap.to(el, {
          clipPath: SHOWN,
          ease: 'none',
          scrollTrigger: { trigger: el, start, end: 'bottom top', scrub: true },
        });
        return;
      }

      gsap.to(el, {
        clipPath: SHOWN,
        duration,
        delay,
        ease,
        scrollTrigger: { trigger: el, start, once },
        onComplete: onRevealComplete,
      });
    },
    {
      scope: wrapRef,
      dependencies: [src, trigger, direction, delay, duration, ease, start, once],
    },
  );

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: 'relative', clipPath: HIDDEN[direction] }}
    >
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={imageClassName}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `RevealImage.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/media/RevealImage.tsx
git commit -m "feat(media): reusable RevealImage curtain-reveal component"
```

---

### Task 2: `FolderMeta` (SplitText line-mask metadata)

**Files:**
- Create: `src/components/home/photography/FolderMeta.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/home/photography/FolderMeta.tsx`:

```tsx
'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

import { getAnimationMode } from '@/lib/animationMode';
import type { PhotoSeries } from '@/types/photoSeries';

gsap.registerPlugin(SplitText, useGSAP);

type FolderMetaProps = {
  series: PhotoSeries;
};

export function FolderMeta({ series }: FolderMetaProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const targets = Array.from(
        root.querySelectorAll<HTMLElement>('[data-meta-line]'),
      );
      if (targets.length === 0) return;

      if (getAnimationMode() === 'reduced') {
        gsap.set(root, { autoAlpha: 1 });
        return;
      }

      const splits = targets.map((el) =>
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'meta-line++',
        }),
      );
      const lines = splits.flatMap((s) => s.lines);

      gsap.set(root, { autoAlpha: 1 });
      gsap.set(lines, { yPercent: 110 });
      gsap.to(lines, {
        yPercent: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power4.out',
      });

      return () => splits.forEach((s) => s.revert());
    },
    { scope: rootRef, dependencies: [series.slug] },
  );

  return (
    <div
      ref={rootRef}
      className="selected-work__meta"
      style={{ visibility: 'hidden' }}
    >
      <h3 data-meta-line className="selected-work__meta-title">
        {series.title}
      </h3>
      <p data-meta-line className="selected-work__meta-sub">
        {series.category} · {series.year}
      </p>
      <p data-meta-line className="selected-work__meta-frames">
        {series.frameCount} frames
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `FolderMeta.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/photography/FolderMeta.tsx
git commit -m "feat(photography): FolderMeta with SplitText line-mask reveal"
```

---

### Task 3: `FolderRail` (thumbnail list / strip)

**Files:**
- Create: `src/components/home/photography/FolderRail.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/home/photography/FolderRail.tsx`:

```tsx
'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import type { PhotoSeries } from '@/types/photoSeries';

type FolderRailProps = {
  series: PhotoSeries[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function FolderRail({ series, selectedIndex, onSelect }: FolderRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  // Keep the active thumbnail in view on both axes (vertical desktop / horizontal mobile).
  useEffect(() => {
    const active = railRef.current?.querySelector(
      '.selected-work__thumb--active',
    );
    active?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [selectedIndex]);

  return (
    <div
      ref={railRef}
      className="selected-work__rail"
      role="tablist"
      aria-label="Photo folders"
    >
      {series.map((item, index) => (
        <button
          key={item.slug}
          type="button"
          role="tab"
          aria-selected={index === selectedIndex}
          className={`selected-work__thumb${
            index === selectedIndex ? ' selected-work__thumb--active' : ''
          }`}
          onClick={() => onSelect(index)}
        >
          <span className="selected-work__thumb-img">
            <Image
              src={item.coverImage}
              alt={item.title}
              fill
              sizes="120px"
              className="object-cover"
            />
          </span>
          <span className="selected-work__thumb-label">
            <span className="selected-work__thumb-title">{item.title}</span>
            <span className="selected-work__thumb-year">{item.year}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `FolderRail.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/photography/FolderRail.tsx
git commit -m "feat(photography): FolderRail thumbnail list/strip"
```

---

### Task 4: `SelectedWorkHero` (reveal + slide-swap + morph)

**Files:**
- Create: `src/components/home/photography/SelectedWorkHero.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/home/photography/SelectedWorkHero.tsx`. The resting layer carries the morph name; the first paint reveals via `RevealImage`, then swaps to a plain `<Image>` so subsequent folder changes slide a transient incoming layer over it.

```tsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLenis } from 'lenis/react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { RevealImage } from '@/components/media/RevealImage';
import { ViewTransition } from '@/components/transitions/ViewTransition';
import { getAnimationMode } from '@/lib/animationMode';
import { markHomeReturn } from '@/lib/home-scroll';
import type { PhotoSeries } from '@/types/photoSeries';

const HERO_SIZES = '(max-width: 767px) 100vw, 55vw';

type SelectedWorkHeroProps = {
  series: PhotoSeries;
  direction: 'next' | 'prev';
};

export function SelectedWorkHero({ series, direction }: SelectedWorkHeroProps) {
  const router = useRouter();
  const lenis = useLenis();

  const [resting, setResting] = useState(series);
  const [incoming, setIncoming] = useState<PhotoSeries | null>(null);
  const [revealed, setRevealed] = useState(false);
  const incomingRef = useRef<HTMLDivElement>(null);
  const isSliding = useRef(false);

  // Detect a folder change → start a slide (or instant swap when reduced).
  useEffect(() => {
    if (series.slug === resting.slug) return;
    if (getAnimationMode() === 'reduced') {
      setResting(series);
      return;
    }
    setIncoming(series);
  }, [series, resting.slug]);

  // Animate the incoming layer over the resting one, then commit it.
  useGSAP(
    () => {
      if (!incoming) return;
      const layer = incomingRef.current;
      if (!layer) return;

      isSliding.current = true;
      gsap.fromTo(
        layer,
        { yPercent: direction === 'next' ? 100 : -100 },
        {
          yPercent: 0,
          duration: 0.7,
          ease: 'power3.inOut',
          onComplete: () => {
            setResting(incoming);
            setIncoming(null);
            isSliding.current = false;
          },
        },
      );
    },
    { dependencies: [incoming, direction] },
  );

  const open = () => {
    if (isSliding.current) return;
    const scrollY =
      typeof lenis?.scroll === 'number' ? lenis.scroll : window.scrollY;
    markHomeReturn(scrollY);
    router.push(`/work/${resting.slug}`);
  };

  return (
    <div
      className="selected-work__hero"
      role="link"
      tabIndex={0}
      aria-label={`Open ${resting.title}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
    >
      <ViewTransition name={`work-hero-${resting.slug}`} share="morph">
        <div className="selected-work__hero-layer">
          {revealed ? (
            <Image
              src={resting.coverImage}
              alt={resting.title}
              fill
              priority
              sizes={HERO_SIZES}
              className="selected-work__hero-img object-cover"
            />
          ) : (
            <RevealImage
              src={resting.coverImage}
              alt={resting.title}
              trigger="in-view"
              direction="up"
              priority
              sizes={HERO_SIZES}
              className="selected-work__hero-fill"
              imageClassName="selected-work__hero-img object-cover"
              onRevealComplete={() => setRevealed(true)}
            />
          )}
        </div>
      </ViewTransition>

      {incoming ? (
        <div
          ref={incomingRef}
          className="selected-work__hero-layer selected-work__hero-layer--incoming"
        >
          <Image
            src={incoming.coverImage}
            alt={incoming.title}
            fill
            sizes={HERO_SIZES}
            className="selected-work__hero-img object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `SelectedWorkHero.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/photography/SelectedWorkHero.tsx
git commit -m "feat(photography): SelectedWorkHero with reveal, slide-swap, morph"
```

---

### Task 5: Rewrite `PhotographySection` to compose the new pieces

**Files:**
- Modify (full replace): `src/components/home/photography/PhotographySection.tsx`

- [ ] **Step 1: Replace the file contents**

Replace ALL of `src/components/home/photography/PhotographySection.tsx` with:

```tsx
'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';

import type { PhotoSeries } from '@/types/photoSeries';

import { FolderMeta } from './FolderMeta';
import { FolderRail } from './FolderRail';
import { SelectedWorkHero } from './SelectedWorkHero';
import './photography-section.css';

type PhotographySectionProps = {
  series: PhotoSeries[];
  /** Accepted for compatibility with HomePage; not used by the new layout. */
  scrollReady?: boolean;
};

export function PhotographySection({ series }: PhotographySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const directionRef = useRef<'next' | 'prev'>('next');

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex((prev) => {
      if (index === prev) return prev;
      directionRef.current = index > prev ? 'next' : 'prev';
      return index;
    });
  }, []);

  if (series.length === 0) return null;

  const selected = series[selectedIndex];
  const countLabel = `${String(series.length).padStart(2, '0')} Series`;

  return (
    <section
      id="photography"
      data-nav-theme="light"
      data-photography-section
      className="selected-work"
      aria-label="Photography"
    >
      <header className="selected-work__header">
        <h2 className="selected-work__title">Selected Work</h2>
        <span className="selected-work__count">{countLabel}</span>
      </header>

      <div className="selected-work__body">
        <SelectedWorkHero series={selected} direction={directionRef.current} />

        <div className="selected-work__panel">
          <FolderMeta series={selected} />
          <FolderRail
            series={series}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
          />
          <Link href="/works" className="selected-work__view-all">
            <span className="selected-work__view-all-text">View all works</span>
            <span className="selected-work__view-all-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. `PolaroidCard` and `getStackRotation` are now unreferenced (deleted in Task 7).

- [ ] **Step 3: Commit**

```bash
git add src/components/home/photography/PhotographySection.tsx
git commit -m "feat(photography): rewrite section as two-column gallery"
```

---

### Task 6: Rewrite `photography-section.css`

**Files:**
- Modify (full replace): `src/components/home/photography/photography-section.css`

- [ ] **Step 1: Replace the file contents**

Replace ALL of `src/components/home/photography/photography-section.css` with the styles below. (Existing CSS custom properties like `--color-ink`, `--font-data`, `--font-editorial` are defined in `globals.css`; reuse them. If a referenced variable does not exist, fall back to a literal — confirm by grepping `globals.css`.)

```css
.selected-work {
  padding: clamp(4rem, 10vh, 8rem) clamp(1.5rem, 5vw, 6rem);
}

.selected-work__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: clamp(2rem, 5vh, 4rem);
}

.selected-work__title {
  font-family: var(--font-editorial, serif);
  font-size: var(--size-section-title, clamp(2rem, 5vw, 3.5rem));
  font-weight: 300;
}

.selected-work__count {
  font-family: var(--font-data, monospace);
  font-size: var(--size-label, 0.75rem);
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-ink-45, rgba(0, 0, 0, 0.45));
}

.selected-work__body {
  display: grid;
  grid-template-columns: minmax(0, 55%) minmax(0, 45%);
  gap: clamp(1.5rem, 4vw, 4rem);
  align-items: start;
}

/* ---- Hero (left) ---- */
.selected-work__hero {
  position: relative;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  cursor: pointer;
  background: var(--color-ink-05, rgba(0, 0, 0, 0.05));
}

.selected-work__hero-layer,
.selected-work__hero-fill {
  position: absolute;
  inset: 0;
}

.selected-work__hero-layer--incoming {
  z-index: 2;
}

.selected-work__hero-img {
  object-fit: cover;
}

.selected-work__hero:focus-visible {
  outline: 2px solid var(--color-ink, #1a1a1a);
  outline-offset: 4px;
}

/* ---- Right panel ---- */
.selected-work__panel {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 3vh, 2rem);
}

.selected-work__meta-title {
  font-family: var(--font-editorial, serif);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 300;
  line-height: 1.05;
}

.selected-work__meta-sub,
.selected-work__meta-frames {
  font-family: var(--font-data, monospace);
  font-size: var(--size-label, 0.8rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-45, rgba(0, 0, 0, 0.45));
  margin-top: 0.4rem;
}

/* ---- Rail ---- */
.selected-work__rail {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.selected-work__thumb {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  opacity: 0.45;
  transition: opacity 0.3s ease;
}

.selected-work__thumb--active,
.selected-work__thumb:hover {
  opacity: 1;
}

.selected-work__thumb-img {
  position: relative;
  flex: none;
  width: 56px;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: var(--color-ink-05, rgba(0, 0, 0, 0.05));
}

.selected-work__thumb-label {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.selected-work__thumb-title {
  font-family: var(--font-data, monospace);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.selected-work__thumb-year {
  font-family: var(--font-data, monospace);
  font-size: 0.7rem;
  color: var(--color-ink-45, rgba(0, 0, 0, 0.45));
}

/* ---- View all ---- */
.selected-work__view-all {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  font-family: var(--font-data, monospace);
  font-size: var(--size-label, 0.8rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.selected-work__view-all-arrow {
  transition: transform 0.3s ease;
}

.selected-work__view-all:hover .selected-work__view-all-arrow {
  transform: translateX(4px);
}

/* ---- Mobile: stack hero → meta → horizontal strip ---- */
@media (max-width: 767px) {
  .selected-work__body {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .selected-work__rail {
    flex-direction: row;
    max-height: none;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 0.5rem;
  }

  .selected-work__thumb {
    flex-direction: column;
    gap: 0.4rem;
    flex: none;
    width: 72px;
  }

  .selected-work__thumb-img {
    width: 72px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .selected-work__view-all-arrow {
    transition: none;
  }
}
```

- [ ] **Step 2: Confirm CSS variables exist (or accept the fallbacks)**

Run: `grep -nE -- "--color-ink|--font-editorial|--font-data|--size-section-title|--size-label|--color-ink-45" src/app/globals.css | head`
Expected: the variables resolve. Each declaration already includes a literal fallback, so missing ones degrade gracefully — no change required.

- [ ] **Step 3: Commit**

```bash
git add src/components/home/photography/photography-section.css
git commit -m "feat(photography): two-column gallery styles"
```

---

### Task 7: Delete polaroid orphans

**Files:**
- Delete: `src/components/home/photography/PolaroidCard.tsx`
- Modify: `src/lib/animationMode.ts`

- [ ] **Step 1: Delete PolaroidCard**

```bash
git rm src/components/home/photography/PolaroidCard.tsx
```

- [ ] **Step 2: Remove `getStackRotation` from animationMode.ts**

In `src/lib/animationMode.ts`, delete this function (keep `getAnimationMode` and the `AnimationMode` type):

```ts
/** Stack fan rotation per card — random between -8 and +8 degrees. */
export function getStackRotation(index: number): number {
  const seed = (index + 1) * 17;
  const normalized = ((seed * 9301 + 49297) % 233280) / 233280;
  return normalized * 16 - 8;
}
```

- [ ] **Step 3: Confirm no dangling references**

Run:

```bash
grep -rn "PolaroidCard\|getStackRotation" src/
```

Expected: **no output.** Any hit is a dangling import — fix before continuing.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(photography): remove polaroid card + stack-rotation orphans"
```

---

### Task 8: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Typecheck + production build**

Run: `npx tsc --noEmit && npm run build`
Expected: typecheck clean; build succeeds with all routes. Fix any error tracing to a file touched in Tasks 1-7.

- [ ] **Step 2: Manual browser pass**

Run `npm run dev`, open the home page in Chrome/Edge:
1. Scroll into Selected Work → the first folder's hero reveals via a one-time curtain wipe (bottom→top); the section does NOT pin.
2. Right side shows the active folder's name/category·year/frames and a vertical thumbnail column with the active one highlighted, plus "View all works →".
3. Click a thumbnail BELOW the current → new hero slides up from the bottom over the old; metadata re-reveals (line-mask). Click one ABOVE → slides down from the top.
4. Click the hero image → routes to `/work/[slug]` with the shared-element morph; browser Back restores home scroll position.
5. Resize to a phone width → layout stacks (hero → meta → horizontal swipe strip); tapping thumbnails still works; tap hero opens the route.
6. DevTools → Rendering → emulate `prefers-reduced-motion: reduce` → no curtain/slide/line-mask; instant swaps; no console errors.

- [ ] **Step 3: If a check fails**

Use superpowers:systematic-debugging. Likely culprits: morph not firing → the resting layer's `name` differs from `WorkHero`'s, or two layers transiently share the name (ensure `open()` is blocked mid-slide, which it is via `isSliding`); curtain replays on folder change → `revealed` not latching to `true`; slide jumps → incoming/resting layers not sharing the exact `inset:0` frame box.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(photography): verification adjustments"
```

(Skip if no changes were needed.)

---

## Self-review (completed by planner)

- **Spec coverage:** two-column layout (T5/T6) ✓; reusable RevealImage with documented props (T1) ✓; curtain reveal play-once no-pin (T1+T4) ✓; vertical thumbnail rail all-visible + active highlight (T3/T6) ✓; directional GSAP slide-swap, next=up/prev=down (T4) ✓; SplitText line-mask metadata (T2) ✓; hero-only morph + keep View-all (T4/T5) ✓; mobile stack + swipe strip (T3/T6) ✓; reduced-motion gating (T1/T2/T4) ✓; delete PolaroidCard + getStackRotation (T7) ✓.
- **Placeholders:** none — every code step is complete.
- **Type consistency:** `PhotographySection` keeps the `{ series, scrollReady? }` signature `HomePage` calls; `RevealImage` prop names match their uses in `SelectedWorkHero`; `direction` union `'next' | 'prev'` identical across `PhotographySection` → `SelectedWorkHero`; CSS class names (`selected-work__hero-layer`, `--incoming`, `selected-work__meta`, `[data-meta-line]`, `selected-work__thumb--active`) match between TSX and CSS; morph name format `work-hero-${slug}` matches `WorkHero`.
- **Risk follow-through:** mid-slide morph collision guarded by `isSliding` (T4 + T8-Step3); SplitText churn reverted in cleanup (T2); shared frame box enforced by `inset:0` layers (T6).
