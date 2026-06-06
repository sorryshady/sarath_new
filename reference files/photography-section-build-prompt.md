# Photography Section — AI Build Prompt
## Project: Sarath Menon Portfolio (sarathmenon.com)

---

## CONTEXT

You are building the Photography section of a photographer/filmmaker portfolio. The tech stack is **React + TypeScript + Tailwind CSS + GSAP + ScrollTrigger + Zustand**. The preloader, hero section, and navbar are already built as separate components. Read this prompt fully before writing any code.

This section sits immediately after the hero scroll sequence ends. The background is `#F9F6F0` warm cream paper. It is the first section the user sees after the hero reveal and it must land with genuine impact.

---

## THE CONCEPT — POLAROID SCATTER

The section is a **pinned scroll sequence**. All series cover images begin as a stacked deck of face-down polaroid prints centred on screen. As the user scrolls, the polaroids scatter outward to a loose grid, flip face-up one by one revealing cover images, and series names type in beneath each print. The entire sequence is driven by GSAP ScrollTrigger on desktop. On mobile it plays as a horizontal scroll strip with auto-play reveal animation.

This is not a standard grid reveal. Every beat is intentional and sequential. Do not simplify it.

---

## FIVE-BEAT ANIMATION SEQUENCE

### Beat 1 — Stack enters (on section enter)
- All polaroids stacked at centre screen, face-down (white cardstock backs visible)
- A subtle fan: each polaroid has a small random rotation between `-8deg` and `+8deg` applied in the stacked state, giving the impression of a held deck
- The section heading **"Frames"** in large Cormorant Garamond italic sits behind/below the stack at `opacity: 0.06` — nearly invisible, but present
- A small monospace label beneath the stack: `↓ SCROLL TO OPEN` at `opacity: 0.4`
- Section pins immediately. ScrollTrigger `pin: true`, `start: 'top top'`, `end: '+=250%'`

### Beat 2 — Scatter (scroll progress 0% → 50%)
- Each polaroid flies from its stacked centre position to its final grid position simultaneously
- Each polaroid travels with its own slightly different GSAP ease and duration (range: `0.6` to `1.0` normalised scroll duration) — this prevents them all landing at the same moment and creates an organic scatter feel
- During flight the polaroids remain face-down (white backs showing)
- Simultaneously: the "Frames" heading ink-reveals — `opacity` animates from `0.06` to `1` in sync with the scatter progress. The heading was always there; the prints were sitting on top of it
- The `↓ SCROLL TO OPEN` label fades out at the start of this beat

### Beat 3 — Flip (scroll progress 50% → 80%)
- Once each polaroid reaches its grid position it flips face-up using a CSS 3D `rotateY` transform
- The flip is staggered: `0.08s` between each card's flip start, ordered left-to-right, top-to-bottom
- Each flip duration: `0.6s`, `ease: power2.inOut`
- The front face shows the series cover image. The back face shows white cardstock with a subtle watermark: `SM` in Cormorant Garamond at `opacity: 0.08`, centred, plus a frame number in Courier monospace bottom-right at `opacity: 0.2`
- `backface-visibility: hidden` on both faces. The card has two child divs: `.polaroid-back` and `.polaroid-front`. The front starts at `rotateY(180deg)`, the back at `rotateY(0deg)`. On flip, both animate 180deg in opposite directions simultaneously

### Beat 4 — Series names type in (scroll progress 75% → 95%)
- After each polaroid flips, its series name types in character by character below the print
- Use GSAP SplitText or a manual character-by-character reveal with `stagger: 0.04s` per character
- Series name font: `Cormorant Garamond`, weight `600`, `14px`, `color: #111`
- Below the series name: a monospace sub-label fades in — category and year: `font-family: Courier New`, `font-size: 9px`, `color: #aaa`, `letter-spacing: 0.12em`, e.g. `TRAVEL · 2023`

### Beat 5 — Settle and release (scroll progress 95% → 100%)
- `View all works →` link fades in at bottom right of section in monospace crimson `#8B1E1E`
- Section unpins
- Normal scroll resumes, next section scrolls up over this one

---

## POLAROID VISUAL DESIGN

### Physical dimensions
- Each polaroid: `width: 180px` on desktop, `width: 140px` on tablet, `width: 200px` on mobile (larger since one dominates viewport at a time)
- White border: `6px` on all sides, `20px` on bottom (the classic polaroid caption area)
- `border-radius: 0` — polaroids are not rounded
- `box-shadow: 3px 6px 20px rgba(0,0,0,0.18)` in resting state
- `box-shadow: 4px 10px 32px rgba(0,0,0,0.28)` on hover (deeper lift)

### Image area
- Fills the polaroid above the caption strip
- `object-fit: cover`, `width: 100%`
- The polaroid container maintains a fixed ratio of `3:4` (portrait-oriented) regardless of the source image aspect ratio. This gives visual consistency across all cards even with mixed photography orientations.
- The cover image used here must be the exact same image asset used as the hero on the `/work/[slug]` page. One Sanity image field serves both. This is critical for the zoom transition to work seamlessly.

### Caption strip (bottom white area)
- Series name: `font-family: 'Cormorant Garamond', serif`, `font-weight: 600`, `font-size: 13px`, `color: #111`, `letter-spacing: 0.01em`
- Category + year sub-label: `font-family: 'Courier New', monospace`, `font-size: 8px`, `color: #aaa`, `letter-spacing: 0.1em`, `text-transform: uppercase`
- Both initially hidden (opacity 0) until Beat 4 types them in

### Cardstock back design
The back of each polaroid (face-down state):
```
Background: #F5F0E8  (slightly warm off-white, like aged card stock)
Border: 1px solid rgba(17,17,17,0.06)

Centre: "SM" monogram
  font-family: Cormorant Garamond, serif
  font-size: 28px
  font-weight: 600
  color: rgba(17,17,17,0.07)
  letter-spacing: 0.04em

Bottom-right corner: frame number e.g. "01", "02"
  font-family: Courier New, monospace
  font-size: 9px
  color: rgba(17,17,17,0.18)
  letter-spacing: 0.1em
```

---

## GRID LAYOUT

The final scattered grid state is the **default state** in the DOM. The stacked positions are applied via GSAP `gsap.set()` at component mount, overriding the natural grid positions. GSAP then animates from stacked back to grid. This is the correct approach — animate from override back to natural, not the reverse.

### Desktop grid (> 1024px)
```
3 columns, 2 rows for 6 featured series
CSS Grid: grid-template-columns: repeat(3, auto)
gap: 32px column, 48px row
Each card has a unique small rotation applied as a persistent transform:
  Card 1: rotate(-2.5deg)
  Card 2: rotate(1.8deg)  margin-top: 16px
  Card 3: rotate(-1.2deg)
  Card 4: rotate(3deg)    margin-top: -8px
  Card 5: rotate(-2deg)   margin-top: 12px
  Card 6: rotate(1.4deg)  margin-top: -4px
The margin-top offsets give the grid an organic, non-rigid feel.
```

### Tablet grid (768px — 1024px)
```
2 columns, 3 rows
gap: 24px column, 36px row
Reduced rotation range: -1.5deg to +1.5deg
```

### Mobile (< 768px) — Horizontal Scroll Strip
See dedicated mobile section below. Do not render a 2-column grid on mobile.

---

## HOVER STATE (desktop only)

When the user hovers over a landed, flipped polaroid:

1. **Rotation resets to 0deg** — `transform: rotate(0deg)`, `transition: transform 0.3s ease`
2. **Lifts** — `translateY(-6px)`, shadow deepens to `4px 16px 40px rgba(0,0,0,0.28)`
3. **Subtitle reveals** — a small overlay fades in at the bottom of the image area (not the caption strip):
   ```
   position: absolute
   bottom: 20px  (above caption strip)
   left: 0, right: 0
   background: linear-gradient(to top, rgba(0,0,0,0.5), transparent)
   padding: 16px 10px 8px
   ```
   Inside this overlay:
   - Series name in Cormorant italic white `font-size: 13px`
   - Frame count in Courier monospace `font-size: 8px` `color: rgba(255,255,255,0.6)` e.g. `24 FRAMES`
4. **Cursor changes** to `cursor: pointer`

On mouse-leave: all hover states reverse smoothly.
Do not activate hover listeners until Beat 4 has fully completed.

---

## CLICK — ZOOM PAGE TRANSITION

This replaces any clip-path circle expansion. The cover image in the polaroid IS the hero image of the work page. Clicking a polaroid causes that image to expand from its polaroid position to fill the entire viewport, then the work page mounts around it.

### Step 1 — Install Zustand
```bash
npm install zustand
```

### Step 2 — Create transition store
```typescript
// src/store/transitionStore.ts
import { create } from 'zustand';

interface TransitionState {
  isTransitioning: boolean;
  imageSrc: string | null;
  imageRect: DOMRect | null;
  setTransition: (src: string, rect: DOMRect) => void;
  clearTransition: () => void;
}

export const useTransitionStore = create<TransitionState>((set) => ({
  isTransitioning: false,
  imageSrc: null,
  imageRect: null,
  setTransition: (src, rect) => set({ isTransitioning: true, imageSrc: src, imageRect: rect }),
  clearTransition: () => set({ isTransitioning: false, imageSrc: null, imageRect: null }),
}));
```

### Step 3 — Click handler on polaroid
```typescript
const handleSeriesClick = (slug: string, imageSrc: string, cardRef: HTMLElement) => {
  // Get the image element inside the polaroid (not the whole card)
  const imageEl = cardRef.querySelector('.polaroid-image') as HTMLElement;
  if (!imageEl) return;

  const rect = imageEl.getBoundingClientRect();

  // 1. Fade out polaroid border and caption instantly
  gsap.to(cardRef.querySelector('.polaroid-border'), { opacity: 0, duration: 0.15 });
  gsap.to(cardRef.querySelector('.polaroid-caption'), { opacity: 0, duration: 0.15 });

  // 2. Fade out all other polaroids
  polaroidRefs.current.forEach((el) => {
    if (el !== cardRef) gsap.to(el, { opacity: 0, duration: 0.3 });
  });

  // 3. Store transition state
  useTransitionStore.getState().setTransition(imageSrc, rect);

  // 4. Animate the image from its current rect to full viewport
  gsap.to(imageEl, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    duration: 0.65,
    ease: 'power3.inOut',
    onComplete: () => {
      // Navigate only after image fills the screen
      router.push(`/work/${slug}`);
    },
  });
};
```

### Step 4 — Work page receives the transition
On the `/work/[slug]` page, in a `useEffect` on mount:

```typescript
const { isTransitioning, imageSrc, imageRect, clearTransition } = useTransitionStore();

useEffect(() => {
  if (!isTransitioning || !imageRect || !heroRef.current) {
    // No transition — normal fade in entry
    gsap.fromTo(heroRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 });
    return;
  }

  // Start hero at the exact stored position and size
  gsap.set(heroRef.current, {
    position: 'fixed',
    top: imageRect.top,
    left: imageRect.left,
    width: imageRect.width,
    height: imageRect.height,
  });

  // Animate to full screen
  gsap.to(heroRef.current, {
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    duration: 0,  // already full screen from Step 3 — snap immediately
    onComplete: () => {
      // Release fixed positioning back to normal layout
      gsap.set(heroRef.current, { clearProps: 'all' });
      clearTransition();
      // Now animate in the page text
      animatePageContent();
    },
  });
}, []);
```

**Important note:** Because the home page has already animated the image to full screen before navigating, the work page hero should appear instantly at full screen on mount (the transition store holds the state). The `duration: 0` snap in Step 4 is intentional — it just corrects the DOM position. The visual expansion already happened on the home page.

### Direct URL visit fallback
If `isTransitioning` is false (user visited `/work/slug` directly without clicking through from the grid), the hero fades in with a standard `opacity: 0 → 1` over `0.6s`. Both entry paths must work correctly.

---

## PERFORMANCE DETECTION — FLIP VS FALLBACK

Check device capability at component mount:

```typescript
const getAnimationMode = (): 'full' | 'reduced' => {
  // Respect user's accessibility preference first
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'reduced';
  }
  // Check hardware capability
  if (navigator.hardwareConcurrency < 4) {
    return 'reduced';
  }
  return 'full';
};
```

**Full mode:** Face-down scatter + CSS 3D rotateY flip (as described above)

**Reduced mode:** Polaroids start face-up in their stacked position. On scroll they scatter directly to grid positions face-up, no flip. On land they do a simple `scale: 0.9 → 1.0` + `opacity: 0 → 1` reveal instead. Same stagger timing. Same beats, minus the 3D transform.

Apply the mode check once on mount and store in a ref. Do not re-check during animation.

---

## MOBILE BEHAVIOUR — HORIZONTAL SCROLL STRIP

On viewports narrower than `768px`, do not render the desktop grid. Render a horizontal scroll strip instead.

### Layout
```
position: relative
width: 100%
overflow-x: scroll
overflow-y: hidden
scroll-snap-type: x mandatory
-webkit-overflow-scrolling: touch
display: flex
gap: 24px
padding: 0 32px   (left/right padding so first/last card sit centred)
```

Each polaroid in the strip:
```
flex-shrink: 0
width: 200px
scroll-snap-align: center
```

Adjacent polaroids (not the centred/active one) sit at `opacity: 0.4`, transitioning to `opacity: 1` when they snap to centre. Use a scroll event listener with IntersectionObserver per card to detect which is centred.

### Auto-play reveal on enter
No pinned scroll zone on mobile. When the section enters the viewport (`IntersectionObserver`, `threshold: 0.3`):
- Polaroids start face-down in the strip
- Play a GSAP timeline (not scroll-scrubbed): cards flip face-up one by one with `0.08s` stagger
- Series names type in after each flip
- Total duration: approximately `2.8s` from trigger to fully settled

### Arrow navigation buttons
Two arrow buttons sit outside the strip, vertically centred on either side:

```tsx
// Left arrow
<button
  style={{
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontFamily: "'Courier New', monospace",
    fontSize: '18px',
    color: '#111',
    opacity: isAtStart ? 0 : 0.35,
    pointerEvents: isAtStart ? 'none' : 'auto',
    transition: 'opacity 0.2s ease',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
  }}
  onClick={() => scrollStrip('left')}
>
  ←
</button>

// Right arrow — mirror of above, opacity: 0 when isAtEnd
```

Arrow behaviour:
- `←` is hidden (`opacity: 0`, `pointer-events: none`) when on the first card
- `→` is hidden when on the last card
- On click: scroll the strip to the previous/next card using `scrollTo({ behavior: 'smooth' })`
- Arrows fade out after the first manual swipe gesture is detected (user has demonstrated swipe awareness). Use a `touchstart` listener, set a `hasSwipedRef` flag, and set both arrows to `opacity: 0` permanently after first swipe.
- On hover: arrow opacity rises to `1.0`

### Scroll strip — no pinning
The horizontal strip scrolls naturally within the page vertical scroll. Do not pin it. The vertical page scroll and the horizontal strip scroll are independent.

---

## SECTION HEADING DESIGN

The "Frames" heading sits behind the polaroid stack:

```tsx
<div style={{
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontFamily: "'Cormorant Garamond', serif",
  fontStyle: 'italic',
  fontWeight: 300,
  fontSize: 'clamp(80px, 14vw, 160px)',
  color: '#111',
  opacity: 0.06,
  letterSpacing: '-0.02em',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  zIndex: 0,
}}>
  Frames
</div>
```

The polaroid stack sits above it at `z-index: 2`. As the scatter progresses, this heading's opacity is driven by GSAP from `0.06` to `1` in sync with the scatter timeline. By the time all polaroids have landed it is fully visible. On mobile, the heading is always at full opacity since there is no scroll-scrubbed scatter.

---

## SECTION HEADER ROW

Above the entire animation area, a minimal section header:

```
Left:  "Selected Work"  — Cormorant Garamond 600, 32px, #111
Right: "06 Series"      — Courier New, 9px, #aaa, letter-spacing 0.14em
```

Separated by a full-width `0.5px` horizontal rule at `rgba(17,17,17,0.1)`.
This header is not animated. It is visible from the moment the section enters the viewport.
The series count on the right should be dynamic — driven by the length of the featured series array, not hardcoded.

---

## DATA STRUCTURE (Sanity CMS)

Each polaroid card pulls the following fields from Sanity:

```typescript
interface PhotoSeries {
  title: string;           // e.g. "Rajasthan"
  slug: string;            // e.g. "rajasthan" — used for /work/[slug] routing
  coverImage: string;      // URL to Sanity image asset — used as BOTH polaroid thumbnail AND work page hero
  category: string;        // e.g. "Travel"
  year: string;            // e.g. "2023"
  frameCount: number;      // e.g. 24 — shown on hover
  featured: boolean;       // if true, appears on home page grid
  order: number;           // controls grid position order
}
```

**Critical:** `coverImage` is used in two places: as the thumbnail inside the polaroid, and as the full-screen hero on the `/work/[slug]` page. Do not create separate fields for these. They must be the same Sanity image asset URL so the zoom transition is seamless.

On the home page, only series where `featured === true` are shown, ordered by `order`. Hard-code 6 placeholder series for now. Wire up the Sanity query later.

---

## VIEW ALL WORKS LINK

Bottom-right of the section, appears in Beat 5 (hidden on mobile until auto-play completes):

```tsx
<div style={{
  position: 'absolute',
  bottom: '32px',
  right: '32px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  opacity: 0,
}}>
  <span style={{
    fontFamily: "'Courier New', monospace",
    fontSize: '10px',
    letterSpacing: '0.14em',
    color: '#8B1E1E',
    textTransform: 'uppercase',
  }}>View all works</span>
  <span style={{ fontFamily: "'Courier New', monospace", fontSize: '10px', color: '#8B1E1E' }}>→</span>
</div>
```

Links to `/works` — the full archive page showing all series regardless of `featured` status.

---

## PAPER TEXTURE

The section background is `#F9F6F0`. The global `.paper` fixed layer at `z-index: 9998` with `mix-blend-mode: multiply` sits over this section as it does the entire page. Do not add any additional texture to this section.

---

## Z-INDEX STACK WITHIN SECTION

```
z-index: 0    — "Frames" heading
z-index: 1    — Section background
z-index: 2    — Polaroid cards
z-index: 3    — Hover overlay on polaroid images
z-index: 4    — Arrow buttons (mobile)
z-index: 5    — "View all works" link
z-index: 9998 — Global paper texture (already fixed, do not touch)
```

---

## COLOUR & TYPOGRAPHY REFERENCE

```
Section background:     #F9F6F0
Heading "Frames":       #111111 (opacity-driven from 0.06 to 1)
Polaroid white border:  #FFFFFF
Cardstock back:         #F5F0E8
Series name text:       #111111
Category/year label:    rgba(17,17,17,0.5)
View all link:          #8B1E1E
Hover overlay gradient: rgba(0,0,0,0.5) to transparent
Arrow buttons:          #111111 at opacity 0.35, 1.0 on hover
```

| Element | Font | Weight | Size |
|---|---|---|---|
| "Frames" heading | Cormorant Garamond italic | 300 | clamp(80px, 14vw, 160px) |
| Section header left | Cormorant Garamond | 600 | 32px |
| Section header right | Courier New | 400 | 9px |
| Series name (caption) | Cormorant Garamond | 600 | 13px |
| Category label | Courier New | 400 | 8px |
| Hover frame count | Courier New | 400 | 8px |
| View all link | Courier New | 400 | 10px |
| Arrow buttons | Courier New | 400 | 18px |

---

## WHAT NOT TO DO

- Do not use a CSS transition for the scatter animation — drive it entirely from GSAP
- Do not skip the face-down state — it is the key to the section's impact
- Do not use `border-radius` on polaroids — square-cornered prints only
- Do not start scatter before section is pinned and scroll begins
- Do not apply hover states during scatter or flip — only after Beat 4 completes
- Do not hardcode grid positions — use GSAP FLIP plugin
- Do not render a 2-column grid on mobile — use the horizontal scroll strip
- Do not add a circle clip-path transition on click — use the zoom transition with Zustand store
- Do not use separate coverImage and heroImage fields in Sanity — they are the same asset
- Do not forget `will-change: transform` on polaroid cards during animation, removed after Beat 4
- Do not add `data-nav-theme="dark"` — this is a light section: `data-nav-theme="light"`

---

## GSAP FLIP — KEY IMPLEMENTATION NOTE

```typescript
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

// 1. Capture the natural grid state first
const state = Flip.getState(polaroidRefs.current);

// 2. Apply stacked positions (all centred, fanned rotations)
polaroidRefs.current.forEach((el, i) => {
  gsap.set(el, {
    x: 0,
    y: 0,
    rotation: getStackRotation(i),  // random -8 to +8
    xPercent: -50,
    yPercent: -50,
    position: 'absolute',
    top: '50%',
    left: '50%',
  });
});

// 3. Animate from stacked back to natural grid positions
Flip.from(state, {
  duration: 0.8,
  ease: 'power2.inOut',
  stagger: 0.05,
  scrollTrigger: {
    trigger: sectionRef.current,
    start: 'top top',
    end: '+=250%',
    pin: true,
    scrub: 1,
  },
});
```

---

## ACCEPTANCE CRITERIA

The section is complete when:

1. Section enters with all polaroids stacked face-down, "Frames" heading ghosted at opacity 0.06
2. Scroll drives the scatter: polaroids fly to grid, face-down, heading ink-reveals simultaneously
3. Each polaroid flips face-up on landing, staggered 0.08s between cards
4. Card backs show SM watermark and frame number
5. Card fronts show cover image at correct 3:4 aspect ratio
6. Series names and category labels type in after each flip
7. "View all works →" fades in once all cards are settled
8. Section unpins and normal scroll resumes
9. Hover: polaroid straightens to 0deg, lifts, subtitle overlay with series name and frame count appears
10. Click: polaroid border/caption fades out, image zooms from its position to fill viewport, Zustand store is written, route navigates to /work/[slug]
11. Work page: if transition store has data, hero starts at stored position and is already full screen on mount. If no store data (direct visit), hero fades in normally
12. Performance detection: full rotateY flip on capable devices (`hardwareConcurrency >= 4` and no `prefers-reduced-motion`), scale+opacity fallback otherwise
13. Mobile: horizontal scroll strip with scroll-snap, auto-play flip on IntersectionObserver, arrow buttons visible with correct hide-at-edge behaviour, arrows fade after first swipe
14. `data-nav-theme="light"` on section wrapper
15. Paper texture sits correctly via global fixed `.paper` layer
16. Series count in section header is dynamic, not hardcoded
