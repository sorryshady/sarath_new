# Selected Work Section Redesign — Design

**Date:** 2026-06-07
**Status:** Approved (design), pending implementation plan
**Branch:** feat/photography-section

## Problem

The current "Selected Work" section is a polaroid-stack that scatters, flips, and
rotates on a pinned scroll sequence; clicking a polaroid morphs it into the work
route. The owner no longer likes this treatment. Replace it with a calmer,
gallery-style two-column browser with a cinematic image reveal, directional
folder switching, and the same shared-element morph into the route.

## Decisions (resolved via grilling)

| # | Decision | Choice |
|---|---|---|
| 1 | Folder navigation control | Vertical thumbnail list IS the control. Clicking a thumbnail **below** current = next (image slides up from bottom); **above** = previous (slides down from top). No separate arrows. |
| 2 | Thumbnail layout | Vertical column beside the hero, all featured folders visible (cap ~6), internal scroll if more. Active thumbnail highlighted. |
| 3 | Initial image reveal | Curtain wipe, play-once on scroll-in, **no pinning**. Extracted as a reusable `RevealImage` component. |
| 4 | Metadata switch animation | Line-mask reveal (SplitText), matching `Copy.tsx` typography motion. |
| 5 | Mobile layout | Stack: hero image → metadata → horizontal swipeable thumbnail strip. Tap hero → route. |
| 6 | Navigation/morph | Only the **left hero image** navigates to `/work/[slug]` (shared-element morph). Thumbnails only select. Keep a small "View all works →" link to `/works`. |
| 7 | In-section image swap tech | GSAP layered slide (new image slides **over** previous). Native `<ViewTransition>` is used only for the route morph. |
| 8 | Slide direction across breakpoints | Vertical slide-from-bottom (next) / from-top (previous) on all breakpoints — one mental model. |

## Architecture

### Component breakdown

| File | Responsibility |
|---|---|
| `src/components/media/RevealImage.tsx` | **New, reusable.** Curtain-reveal image primitive (clip-path wipe). Configurable trigger/delay/direction/etc. No knowledge of the gallery. |
| `src/components/home/photography/PhotographySection.tsx` | **Rewritten in place** (same export name, so `HomePage` is untouched). Owns `selectedIndex` + `direction` state; composes hero, rail, meta; desktop/mobile layout; reduced-motion. |
| `src/components/home/photography/SelectedWorkHero.tsx` | **New.** Left column: initial `RevealImage`, GSAP layered slide-swap on folder change, `<ViewTransition name>` morph wrapper + click-to-navigate (with `markHomeReturn`). |
| `src/components/home/photography/FolderRail.tsx` | **New.** Right column: vertical thumbnail list (desktop) / horizontal swipe strip (mobile), active highlight, click/swipe to select. |
| `src/components/home/photography/FolderMeta.tsx` | **New.** Folder name / frame count / year with SplitText line-mask re-reveal on change. |
| `src/components/home/photography/photography-section.css` | **Rewritten** for the two-column + mobile-stack layout; polaroid classes removed. |
| `src/components/home/photography/PolaroidCard.tsx` | **Deleted** (only consumer was the old section). |
| `src/lib/animationMode.ts` | Remove `getStackRotation` (scatter-only orphan); keep `getAnimationMode`. |

### Data flow

`HomePage` → `PhotographySection({ series, scrollReady })` (unchanged props). The
section holds `selectedIndex` (default 0) and the last `direction`. Selecting a
folder updates both; `SelectedWorkHero` reacts to the selected series +
direction to run the slide-swap, `FolderMeta` re-reveals, `FolderRail` updates
the highlight.

### `RevealImage` reusable API

```ts
type RevealTrigger = 'in-view' | 'scroll-linked' | 'immediate';
type RevealDirection = 'up' | 'down' | 'left' | 'right';

interface RevealImageProps {
  src: string;
  alt: string;
  trigger?: RevealTrigger;     // default 'in-view' (play once when scrolled into view)
  direction?: RevealDirection; // curtain reveal axis, default 'up' (reveals from bottom upward)
  delay?: number;              // seconds, default 0
  duration?: number;           // seconds, default 0.9
  ease?: string;               // default 'power4.inOut'
  start?: string;              // ScrollTrigger start (in-view/scroll-linked), default 'top 80%'
  once?: boolean;              // default true (in-view only)
  fill?: boolean;              // next/image fill, default true
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}
```

Behavior:
- `'in-view'` — clip-path wipe plays once when the element enters view (ScrollTrigger, `once`).
- `'scroll-linked'` — wipe progress scrubbed to scroll across `start`→ element exit.
- `'immediate'` — wipe plays on mount after `delay`.
- Reduced motion (`getAnimationMode() === 'reduced'`): skip the wipe, show the image immediately.
- Mechanism: animate `clip-path: inset(...)` on the image wrapper. `direction` maps which inset edge animates from 100%→0 (`up` reveals bottom→top, `down` top→bottom, `left` right→left, `right` left→right).

### Hero slide-swap (in `SelectedWorkHero`)

- Two stacked absolutely-positioned image layers inside the hero frame.
- On folder change: mount the incoming image in a layer offset by `translateY(100%)` (next) or `translateY(-100%)` (previous); GSAP-tween it to `translateY(0)` over ~0.7s `power3.inOut`, sliding **over** the outgoing image; on complete, the incoming layer becomes the resting layer and the old one is dropped.
- Reduced motion: instant swap (no slide).
- The resting layer's `<Image>` is wrapped in `<ViewTransition name={`work-hero-${selectedSlug}`} share="morph">`. Only the hero carries the morph name (uniqueness preserved). Clicking the hero: `markHomeReturn(scrollY)` then `router.push(`/work/${slug}`)`.

### `FolderMeta` (SplitText line-mask)

On `selectedSlug` change, re-split and re-reveal name / `NN frames` / year with the
masked line-rise used in `Copy.tsx` (`SplitText.create(el, { type: 'lines', mask:
'lines' })` then animate `y: '100%'`→`0`). Reduced motion: instant.

### Mobile (`max-width: 767px`)

Single column stack: hero (full width, curtain + slide-swap, tap → route) →
`FolderMeta` → horizontal swipeable `FolderRail` strip. Swiping/tapping a
thumbnail selects; index delta still defines slide direction (vertical slide
retained per Decision 8). Reuse the existing strip scroll-tracking idea from the
old section where helpful.

## Success criteria

- Scrolling into Selected Work reveals the first folder's hero via a one-time
  curtain wipe; the section does not pin.
- A vertical thumbnail column sits to the right with the active folder
  highlighted; metadata (name/frames/year) shown above it; "View all works →"
  present.
- Clicking a lower thumbnail slides the new hero up from the bottom over the old;
  a higher thumbnail slides down from the top; metadata re-reveals via line-mask;
  direction is correct.
- Clicking the hero opens `/work/[slug]` with the shared-element morph; back
  restores home scroll.
- On a phone, the layout stacks (hero → meta → swipe strip) and remains usable.
- `prefers-reduced-motion`: no wipe/slide; instant swaps; no errors.
- `RevealImage` is a standalone reusable component with the documented props,
  usable outside this section.
- `PolaroidCard` and `getStackRotation` are removed; build and typecheck pass.

## Risks

- **Two-layer slide vs the morph snapshot.** The morph `name` must sit on the
  resting layer that exists at click time; ensure a swap-in-progress doesn't
  leave two elements sharing the name. Mitigation: only the settled layer carries
  the `ViewTransition name`; block navigation mid-swap or finalize the swap first.
- **SplitText re-split churn.** Re-splitting on every change must revert the prior
  split to avoid leaked DOM/instances (follow `Copy.tsx` cleanup).
- **Mobile swipe vs vertical slide** feels slightly cross-axis; accept per
  Decision 8, revisit only if it reads wrong in the browser pass.
- **Image aspect / object-fit** during the slide: incoming and outgoing layers
  must share the exact frame box to avoid a jump; fixed aspect-ratio hero frame.
