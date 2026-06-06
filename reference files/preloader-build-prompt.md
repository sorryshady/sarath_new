# Preloader Component — AI Build Prompt
## Project: Sarath Menon Portfolio (sarathmenon.com)

---

## CONTEXT

You are building a standalone preloader component for a photographer/filmmaker portfolio website. The tech stack is **React + TypeScript + Tailwind CSS + GSAP**. The existing codebase already has GSAP installed and a paper grain texture overlay applied globally via a `.paper` CSS class in `index.css`.

The preloader must feel like a **35mm film frame on a full crimson background**. It is the first thing the user sees. It should feel cinematic, analogue, and premium. When it exits, it slides upward off the screen, seamlessly revealing the hero section underneath — which is also crimson. The colour continuity between preloader exit and hero entry must be invisible to the user.

---

## VISUAL DESIGN SPECIFICATION

### Background
- Full viewport, `position: fixed`, `inset: 0`, `z-index: 9999`
- Background colour: `#8B1E1E` (rich darkroom crimson)
- A subtle animated film grain noise layer sits on top at `opacity: 0.07`, `mix-blend-mode: overlay`, `pointer-events: none`
- The grain layer must animate: shift its `background-position` by 1-2px on every frame using a `requestAnimationFrame` loop or a repeating GSAP ticker. This keeps the grain feeling alive and analogue rather than static

### Film Grain Implementation
Use an inline SVG `feTurbulence` filter rendered as a `data:image/svg+xml` background-image on the grain div:
```css
background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='1'/></svg>");
background-repeat: repeat;
```
Shift its transform by random ±2px on every animation frame.

### Top Meta Bar
Absolutely positioned at the top of the screen, `top: 24px`, `left: 28px` to `right: 28px`.
Three items in a row, `justify-content: space-between`:
- Left: `KODAK VISION3 500T`
- Centre: `35MM · 1.85:1`
- Right: `SM · MMXIX`

All text: `font-family: 'Courier New', monospace`, `font-size: 9px`, `letter-spacing: 0.16em`, `color: rgba(249, 246, 240, 0.28)`, `text-transform: uppercase`

### Film Frame Border
A centred rectangular container with:
- `border: 1px solid rgba(249, 246, 240, 0.18)`
- `padding: 36px 64px` on desktop, `padding: 28px 32px` on mobile
- Position: `absolute`, centred both axes via `top: 50%, left: 50%, transform: translate(-50%, -50%)`

#### Sprocket Holes — Top Edge
A row of rectangular holes sitting on the top border of the frame.
- 8 holes evenly spaced across the top
- Each hole: `width: 13px`, `height: 9px`, `background: #8B1E1E`, `border: 1px solid rgba(249, 246, 240, 0.22)`, `border-radius: 2px`
- Container: `position: absolute`, `top: 0`, `left: 10px`, `right: 10px`, `transform: translateY(-50%)`, `display: flex`, `justify-content: space-between`, `align-items: center`

#### Sprocket Holes — Bottom Edge
Identical to the top row. `bottom: 0`, `transform: translateY(50%)`

#### Frame Corner Labels
- Top-left inside the frame: text `▲ 01` — `font-size: 7px`, `color: rgba(249,246,240,0.2)`, monospace
- Top-right inside the frame: text `T 1.3 ▲` — same style, `text-align: right`

### Counter Number
Inside the film frame, centred:
- Font: `Cormorant Garamond`, weight `700`, pulled from Google Fonts
- Font size: `clamp(64px, 12vw, 96px)`
- Colour: `#F9F6F0`
- Letter spacing: `-0.02em`
- `font-variant-numeric: tabular-nums` — critical so the number does not shift layout as digits change
- Displays a two-digit padded number: `00` through `99`, then `100`
- The number is driven by a JavaScript counter (see Counter Logic below)

### Divider Rule
Below the counter number:
- `width: 28px`, `height: 1px`, `background: rgba(249,246,240,0.28)`, `margin: 12px auto`

### Status Text
Below the divider:
- Font: `Courier New`, monospace
- `font-size: 9px`, `letter-spacing: 0.22em`, `text-transform: uppercase`
- Colour: `rgba(249, 246, 240, 0.45)`
- Text states:
  - While loading: `DEVELOPING` followed by a blinking dot `●`
  - When loading completes (counter hits 100): text changes to `READY`
  - The blinking dot: CSS animation `opacity` toggling between `1` and `0.15` on a `1s step-end` loop. Stop the animation when state changes to READY.

### Progress Bar
- `position: absolute`, `bottom: 0`, `left: 0`, `right: 0`
- Track: `height: 2px`, `background: rgba(249,246,240,0.08)`
- Fill: `height: 2px`, `background: rgba(249,246,240,0.45)`, `width` animates from `0%` to `100%`
- The fill width is driven by the same counter value (counter value as a percentage)
- No CSS transition on the width — it is set directly from JS each frame for precision

### Bottom Meta Bar
`position: absolute`, `bottom: 16px`, `left: 28px`, `right: 28px`, `display: flex`, `justify-content: space-between`
- Left: `PHOTOGRAPHER · FILMMAKER · POET`
- Right: `LONDON`
- Same monospace style as top meta bar, same low opacity

---

## COUNTER LOGIC (JavaScript)

The counter must use a **non-linear easing curve**. It should feel like a film developing — fast at first, then slowing dramatically near the end as it waits for the actual load event.

```typescript
// Pseudo-code for the counter behaviour
// Phase 1: 0 → 72, duration ~1.2s, ease: power2.out (fast)
// Phase 2: 72 → 92, duration ~0.8s, ease: power1.out (slowing)
// Phase 3: 92 → 99, duration: HOLD — stays at 99 until loading is complete
// Phase 4: 99 → 100, duration: 0.3s — only triggers when isLoaded === true
```

Implement this using GSAP:
```typescript
const counterObj = { value: 0 };
const tl = gsap.timeline();

// Phase 1 — fast
tl.to(counterObj, {
  value: 72,
  duration: 1.2,
  ease: 'power2.out',
  onUpdate: () => updateCounter(counterObj.value),
});

// Phase 2 — slowing
tl.to(counterObj, {
  value: 92,
  duration: 0.8,
  ease: 'power1.out',
  onUpdate: () => updateCounter(counterObj.value),
});

// Phase 3 — hold at 99, waiting for load signal
tl.to(counterObj, {
  value: 99,
  duration: 0.6,
  ease: 'power1.out',
  onUpdate: () => updateCounter(counterObj.value),
  onComplete: () => {
    // Pause here. Resume only when isLoaded === true.
    tl.pause();
    waitForLoad(tl);
  },
});

// Phase 4 — completion snap
tl.to(counterObj, {
  value: 100,
  duration: 0.3,
  ease: 'none',
  onUpdate: () => updateCounter(counterObj.value),
  onComplete: () => triggerExit(),
});

function updateCounter(val: number) {
  const display = Math.floor(val);
  const padded = display < 100 ? String(display).padStart(2, '0') : '100';
  setCounterDisplay(padded); // React state setter
  setProgressWidth(display); // drives the progress bar width %
}
```

The `waitForLoad` function should poll `isLoaded` state every 100ms and call `tl.resume()` when it becomes true. The minimum total preloader duration before exit is **2.0 seconds** regardless of how fast the assets load. Use `Promise.all([loadPromise, minimumDurationPromise])` to enforce this.

---

## LOADING TRIGGER

The preloader waits for two things simultaneously:

```typescript
const minimumDuration = new Promise(resolve => setTimeout(resolve, 2000));

const videoReady = new Promise(resolve => {
  // If using a Vimeo embed via their Player SDK:
  // player.on('bufferend', resolve) or player.on('play', resolve)
  
  // If using a direct <video> element:
  const video = document.querySelector('#hero-video') as HTMLVideoElement;
  if (video.readyState >= 3) { resolve(true); return; }
  video.addEventListener('canplay', () => resolve(true), { once: true });
  
  // Safety timeout — never block longer than 8 seconds
  setTimeout(() => resolve(true), 8000);
});

Promise.all([minimumDuration, videoReady]).then(() => {
  setIsLoaded(true);
});
```

---

## EXIT ANIMATION SEQUENCE

Once `isLoaded` becomes true and the counter reaches 100, trigger this three-beat exit:

### Beat 1 — Ready state (0.4s)
- Counter displays `100`
- Status text changes from `DEVELOPING ●` to `READY` (no blinking dot)
- Pause 0.4 seconds

### Beat 2 — Frame dissolve (0.5s)
```typescript
gsap.to(filmFrameRef.current, {
  scale: 1.08,
  opacity: 0,
  duration: 0.5,
  ease: 'power2.in',
});
gsap.to(metaTopRef.current, { opacity: 0, duration: 0.3 });
gsap.to(metaBottomRef.current, { opacity: 0, duration: 0.3 });
// Grain briefly intensifies
gsap.to(grainRef.current, { opacity: 0.18, duration: 0.15, yoyo: true, repeat: 1 });
```

### Beat 3 — Panel slide up (0.6s)
```typescript
gsap.to(preloaderRef.current, {
  yPercent: -100,
  duration: 0.6,
  ease: 'power3.inOut',
  onComplete: () => {
    setPreloaderVisible(false); // unmount from DOM
    document.body.style.overflow = ''; // release scroll lock
  },
});
```

The `yPercent: -100` slides the entire crimson panel upward off the screen. Since the hero section below is also `#8B1E1E` crimson at the top, the transition reads as one continuous surface pulling back rather than a screen change.

---

## SESSION STORAGE — SKIP ON RETURN VISITS

```typescript
// At component mount:
useEffect(() => {
  const hasVisited = sessionStorage.getItem('sm_preloader_seen');
  if (hasVisited) {
    // Skip preloader entirely
    setPreloaderVisible(false);
    document.body.style.overflow = '';
    return;
  }
  // Run preloader normally
  document.body.style.overflow = 'hidden'; // lock scroll
}, []);

// In triggerExit(), after onComplete:
sessionStorage.setItem('sm_preloader_seen', 'true');
```

---

## SCROLL LOCK

- On preloader mount: `document.body.style.overflow = 'hidden'`
- On preloader exit complete: `document.body.style.overflow = ''`
- Never release the scroll lock until the slide-up animation fully completes

---

## ENTRY ANIMATION (on first mount)

The preloader itself should not just snap into existence. It should flicker on like a projector lamp warming up:

```typescript
// On mount, before anything else:
gsap.fromTo(preloaderRef.current,
  { opacity: 0 },
  {
    opacity: 1,
    duration: 0.05,
    ease: 'none',
    onComplete: () => {
      // Brief flicker
      gsap.to(preloaderRef.current, {
        opacity: 0.6,
        duration: 0.05,
        yoyo: true,
        repeat: 1,
        onComplete: startCounterTimeline,
      });
    },
  }
);
```

---

## TYPOGRAPHY

Add this to your Google Fonts import (already likely in `index.css`):
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&display=swap');
```

The counter number uses `Cormorant Garamond 700`. Everything else uses `Courier New, monospace` — no additional font import needed.

---

## RESPONSIVE BEHAVIOUR

| Breakpoint | Film frame padding | Counter font size | Sprocket holes |
|---|---|---|---|
| Desktop (>1024px) | 36px 64px | 96px | 8 per row |
| Tablet (768–1024px) | 28px 48px | 72px | 6 per row |
| Mobile (<768px) | 20px 24px | 56px | 4 per row |
| Mobile (<480px) | 16px 18px | 48px | 3 per row |

On mobile, hide the top and bottom meta bar text. Keep only the film frame, counter, divider, and status text.

---

## COMPONENT STRUCTURE

```
<Preloader>
  ├── grain overlay div (fixed, pointer-events: none)
  ├── top meta bar
  ├── film frame container (centred)
  │   ├── sprocket holes top row
  │   ├── corner labels (▲ 01 / T 1.3 ▲)
  │   ├── counter number
  │   ├── divider rule
  │   └── status text + blinking dot
  ├── progress bar (absolute bottom)
  └── bottom meta bar
</Preloader>
```

The component accepts an `onComplete` callback prop that the parent (App.tsx) uses to know when to initialise the hero scroll timeline. Do not start the GSAP hero ScrollTrigger timeline until `onComplete` fires.

---

## WHAT NOT TO DO

- Do not use any CSS `transition` on the counter number or progress bar — drive them entirely from JavaScript for frame-accurate sync
- Do not use `opacity: 0` + `display: none` toggling mid-animation — use GSAP's `autoAlpha` which handles both
- Do not release scroll lock early — only on `onComplete` of the slide-up
- Do not run the preloader on return visits within the same session
- Do not add any rounded corners anywhere on this component — the film frame and sprocket holes must have `border-radius: 0` or maximum `2px` on the holes only
- Do not use any colour other than `#8B1E1E` (crimson), `#F9F6F0` (cream), and `rgba` variants of these two

---

## COLOUR TOKENS (for reference)

```
--color-bg-crimson:   #8B1E1E
--color-bg-cream:     #F9F6F0
--color-text-cream:   rgba(249, 246, 240, 1.0)
--color-text-muted:   rgba(249, 246, 240, 0.28)
--color-progress-bar: rgba(249, 246, 240, 0.45)
--color-frame-border: rgba(249, 246, 240, 0.18)
--color-sprocket:     rgba(249, 246, 240, 0.22)
```

---

## ACCEPTANCE CRITERIA

The preloader is complete when:

1. It appears instantly on first visit with a projector-flicker entry
2. The counter ticks 00 → 99 on the non-linear curve, pauses at 99
3. The grain layer is visibly animated (not static)
4. The counter resumes to 100 only after the load promise resolves
5. Status text reads `DEVELOPING ●` during load, `READY` at 100
6. Exit: frame scales/fades, then full panel slides upward off screen in 0.6s
7. The crimson panel exit reveals the crimson hero below with no visible seam
8. Scroll is locked during the entire preloader, released only on exit complete
9. Second visit within the same session: preloader is skipped entirely
10. Responsive: looks correct on mobile with reduced sprocket holes and no meta text
