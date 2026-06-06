# Hero Section Component — AI Build Prompt
## Project: Sarath Menon Portfolio (sarathmenon.com)

---

## CONTEXT & WHAT ALREADY EXISTS

You are refining and completing the hero section of a photographer/filmmaker portfolio. The tech stack is **React + TypeScript + Tailwind CSS + GSAP + ScrollTrigger**.

A working prototype of the hero already exists in `App.tsx`. Read it carefully before touching anything. The core SVG mask mechanic is already built and functional. Your job is to:

1. Replace the placeholder content with the correct copy, typography, colours, and assets
2. Add the meta text corners to the crimson block
3. Replace the placeholder background with a Vimeo-hosted video (with poster frame fallback)
4. Refine the scroll timeline to match the exact spec below
5. Wire the preloader's `onComplete` callback so the hero ScrollTrigger does not initialise until the preloader exits
6. Apply the paper texture globally and correctly
7. Make the whole thing responsive

Do not rebuild from scratch. Extend what exists.

---

## EXISTING CODE SUMMARY

The existing `App.tsx` implements:
- A pinned `containerRef` div with a GSAP ScrollTrigger timeline (`start: 'top top'`, `end: '+=300%'`, `scrub: true`, `pin: true`)
- An SVG (`svgRef`) containing a `<mask id="cutout-mask">` with:
  - `maskRectRef` — a `<rect>` that starts at `height="50%"` and animates to `height="100%"`
  - `visibleRectRef` — a `<rect fill="#9e0000">` masked by the above, also starts at `height="50%"`
  - `leftTextRef` — SVG `<text>` for "SARATH", `x="46%"`, `textAnchor="end"`, `fontSize="10vw"`
  - `rightTextRef` — SVG `<text>` for "MENON", `x="54%"`, `textAnchor="start"`, `fontSize="10vw"`
  - `circleRef` — SVG `<circle>` centred between the two words, `r="2.2vw"`
- A `headerRef` div at the top with placeholder text "O7.2 - ARCHIVE" and "EST. 2026"
- A `bgOverlayRef` div with a dark gradient overlay over the background image
- A static Unsplash background image (to be replaced with Vimeo video)

The existing `index.css` has:
- Anton font imported from Google Fonts
- Tailwind CSS v4 imported
- A `.paper` class with a base64 JPEG grain texture, `mix-blend-mode: multiply`, `pointer-events: none`, `position: absolute`, `inset: 0`

---

## CHANGES REQUIRED

### 1. COLOUR CORRECTION

Change the crimson colour from the current `#9e0000` to `#8B1E1E` everywhere. This is the exact darkroom crimson used across the entire site. Update:
- `visibleRectRef` fill: `#8B1E1E`
- Any inline styles referencing `#9e0000`

Why this matters: the preloader uses `#8B1E1E`. The seamless transition between preloader exit and hero entry depends on an exact colour match. Even a slight difference will show a visible seam.

---

### 2. TYPOGRAPHY — THE NAME

The SVG text nodes currently have no `font-family` set, so they inherit whatever the browser defaults to. Apply the correct font explicitly.

**Font:** `Cormorant Garamond`, weight `700`
Add to your Google Fonts import in `index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Cormorant+Garamond:wght@700&display=swap');
```

Apply to both SVG text elements via inline style:
```tsx
style={{ fontSize: '10vw', fontFamily: "'Cormorant Garamond', serif", fontWeight: 700 }}
```

**Why Cormorant Garamond:** The high-contrast thin-to-thick strokes of this serif create a genuinely beautiful cutout window. When the image plays behind the letters, the thin serifs let fine details breathe through while the thick stems hold the letterform. A heavy sans would be louder but less refined.

**Letter spacing:** Add `letterSpacing="0.02em"` to both text elements.

**Font size:** Keep `10vw` for desktop. On mobile (`< 768px`) reduce to `14vw` via a CSS media query or a JS resize listener updating the SVG text style directly. At `10vw` on a 375px mobile screen, the letters are only 37.5px each which is too small to read as a hero statement.

---

### 3. BACKGROUND — VIMEO VIDEO PLAYER

Replace the static Unsplash background image with a Vimeo-hosted video. The video URL is stored in Sanity CMS as a plain text field. For now, hard-code a placeholder Vimeo video ID and make it easy to swap.

**Implementation approach:** Do NOT use an iframe embed. Use the **Vimeo Player SDK** (`@vimeo/player`) to create a programmatic player instance. This gives you:
- Access to the `bufferend` / `play` event to signal the preloader
- Control over autoplay, loop, muted state
- No iframe UI chrome

```bash
npm install @vimeo/player
```

```tsx
import VimeoPlayer from '@vimeo/player';

// In the component, after mount:
const vimeoContainerRef = useRef<HTMLDivElement>(null);
const playerRef = useRef<VimeoPlayer | null>(null);

useEffect(() => {
  if (!vimeoContainerRef.current) return;

  const player = new VimeoPlayer(vimeoContainerRef.current, {
    id: VIMEO_VIDEO_ID,        // replace with actual ID from Sanity
    background: true,          // removes controls, autoplays, loops, mutes
    muted: true,
    autoplay: true,
    loop: true,
    responsive: true,
  });

  playerRef.current = player;

  player.ready().then(() => {
    player.play();
  });

  // Signal to preloader that video is ready
  player.on('bufferend', () => {
    onVideoReady?.(); // callback prop from parent
  });

  // Safety: if bufferend never fires, resolve after 8s
  setTimeout(() => onVideoReady?.(), 8000);

  return () => { player.destroy(); };
}, []);
```

The Vimeo container div needs to fill the entire hero background:
```tsx
<div
  ref={vimeoContainerRef}
  className="absolute inset-0 w-full h-full overflow-hidden z-0"
  style={{ pointerEvents: 'none' }}
/>
```

Vimeo's `background: true` mode with `responsive: true` will size the iframe to fill the container. You may need to override the iframe style to ensure it covers the full viewport without letterboxing:
```css
/* In index.css */
.hero-vimeo-bg iframe {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100vw;
  height: 56.25vw; /* 16:9 ratio */
  min-height: 100vh;
  min-width: 177.77vh; /* 16:9 ratio */
  transform: translate(-50%, -50%);
  pointer-events: none;
}
```

**Poster frame fallback:** While the video loads, show a static poster image behind it. This is a single high-quality still extracted from the showreel — Sarath's strongest photograph. Store it as a background-image on the vimeo container div:
```tsx
style={{
  backgroundImage: `url('${POSTER_FRAME_URL}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}}
```
The poster shows instantly. The Vimeo player loads over it. The paper grain overlay hides the transition.

---

### 4. DARK OVERLAY REFINEMENT

Keep the existing `bgOverlayRef` div but simplify it. The current implementation has a hatching pattern that competes with the paper grain texture. Replace with:

```tsx
style={{
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.25) 100%)',
}}
```

This is a gentle vignette that lifts the bottom and top edges slightly, focusing attention on the centre where the text sits. The paper texture from `.paper` handles the analogue quality. Do not add additional texture effects here.

---

### 5. META TEXT CORNERS — REPLACING THE HEADER

The existing `headerRef` div shows placeholder text "O7.2 - ARCHIVE" and "EST. 2026". Replace this entirely with three columns of meta data that sit inside the crimson block area (top 50% of the viewport before scroll begins).

```tsx
<div
  ref={headerRef}
  className="absolute top-0 left-0 w-full z-20"
  style={{ height: '50%', pointerEvents: 'none' }}
>
  {/* Left column */}
  <div style={{
    position: 'absolute',
    top: '24px',
    left: '28px',
    fontFamily: "'Courier New', monospace",
    fontSize: '9px',
    letterSpacing: '0.14em',
    color: 'rgba(249, 246, 240, 0.45)',
    textTransform: 'uppercase',
    lineHeight: '2',
  }}>
    <div>Photographer</div>
    <div>Filmmaker</div>
  </div>

  {/* Centre column */}
  <div style={{
    position: 'absolute',
    top: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: "'Courier New', monospace",
    fontSize: '9px',
    letterSpacing: '0.14em',
    color: 'rgba(249, 246, 240, 0.45)',
    textTransform: 'uppercase',
    lineHeight: '2',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  }}>
    <div>London Film School</div>
    <div>Graduate</div>
  </div>

  {/* Right column */}
  <div style={{
    position: 'absolute',
    top: '24px',
    right: '28px',
    fontFamily: "'Courier New', monospace",
    fontSize: '9px',
    letterSpacing: '0.14em',
    color: 'rgba(249, 246, 240, 0.45)',
    textTransform: 'uppercase',
    lineHeight: '2',
    textAlign: 'right',
  }}>
    <div>51.5°N  0.1°W</div>
    <div>London, UK</div>
  </div>
</div>
```

These three blocks sit in the upper portion of the crimson area and are the only text visible before scroll begins. They are low-opacity and monospace — deliberately receding so the name dominates. They fade out in Step 1 of the scroll timeline (the existing `headerRef` fade already handles this).

---

### 6. SCROLL TIMELINE — REFINEMENTS

The existing timeline structure is correct. Apply these refinements:

#### Timing adjustments
```tsx
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: containerRef.current,
    start: 'top top',
    end: '+=300%',   // keep this — gives the animation room to breathe
    pin: true,
    scrub: 1,        // change from scrub: true to scrub: 1
                     // adds a 1-second lag, making the scrub feel cinematic
                     // rather than directly mechanical
  },
});
```

#### Step 1 — Meta text fade (unchanged, keep at position 0)
```tsx
tl.to(headerRef.current, {
  opacity: 0,
  duration: 0.15,
}, 0);
```

#### Step 2 & 3 — Crimson drop + text creep (keep concurrent)
These are correct as-is. The `maskRectRef` and `visibleRectRef` both animate to `height: '100%'`. The text nodes move to `y: '65%'`. Keep these exactly as written.

One addition — animate the circle simultaneously so it stays centered between the words as they move:
```tsx
// already exists, keep as-is:
tl.to(circleRef.current, {
  attr: { cy: '65%' },
  duration: 0.8,
  ease: 'power2.inOut',
}, 0.2);
```

#### Step 4 — The zoom (refinement)
The existing `scale: 250` works. Change the `transformOrigin` to match the circle's animated position more precisely:
```tsx
tl.to(svgRef.current, {
  scale: 250,
  transformOrigin: '50% 65%',  // matches where the circle lands
  ease: 'power3.in',
  duration: 1.5,
}, 0.8);
```

#### Step 5 — Handoff (add overlay fade in parallel)
```tsx
// Fade the SVG (existing)
tl.to(svgRef.current, {
  opacity: 0,
  duration: 0.3,
}, 1.9);

// Fade the dark overlay (existing)
tl.to(bgOverlayRef.current, {
  opacity: 0,
  duration: 0.5,
}, 1.9);

// NEW: add a brief pause at full opacity video before page continues
// This is achieved by the end: '+=300%' scroll distance giving natural
// breathing room after the animation completes
```

---

### 7. PRELOADER HANDSHAKE

**Critical:** Do not initialise the ScrollTrigger hero timeline until the preloader has fully exited.

The `Hero` component receives two props:
```tsx
interface HeroProps {
  onVideoReady: () => void;   // called when Vimeo buffers enough to play
  isPreloaderDone: boolean;   // set to true by App.tsx when preloader fires onComplete
}
```

In the `useEffect` that sets up the GSAP timeline, gate it behind `isPreloaderDone`:
```tsx
useEffect(() => {
  if (!isPreloaderDone) return;  // wait for preloader exit

  const ctx = gsap.context(() => {
    // ... all the existing GSAP timeline code
  }, containerRef);

  return () => ctx.revert();
}, [isPreloaderDone]);  // re-runs when preloader signals done
```

In `App.tsx`:
```tsx
const [isPreloaderDone, setIsPreloaderDone] = useState(false);
const [isVideoReady, setIsVideoReady] = useState(false);

// Pass to Preloader:
<Preloader
  onVideoReady={() => setIsVideoReady(true)}
  onComplete={() => setIsPreloaderDone(true)}
/>

// Pass to Hero:
<Hero
  isPreloaderDone={isPreloaderDone}
  onVideoReady={() => setIsVideoReady(true)}
/>
```

Note: `onVideoReady` can be called from either the Preloader (if it detects the video status) or the Hero component directly. Use whichever fires first. The preloader's counter will hold at 99 until `isVideoReady` becomes true.

---

### 8. THE PAPER TEXTURE — GLOBAL APPLICATION

The existing `.paper` class in `index.css` is correct but needs to be changed from `position: absolute` to `position: fixed` so it covers the entire viewport at all times including during scroll:

```css
.paper {
  position: fixed;   /* changed from absolute */
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9998;     /* below preloader (9999) but above everything else */
  background-repeat: repeat;
  background-image: url("data:image/jpeg;base64,..."); /* keep existing base64 */
  mix-blend-mode: multiply;
  pointer-events: none;
}
```

**Why `mix-blend-mode: multiply`:** This mode darkens the content beneath it using the texture's dark fibres, simulating the way physical paper grain sits on top of a print. On the cream `#F9F6F0` background sections it creates a subtle warmth. On the crimson `#8B1E1E` sections the grain reads as a tactile cloth-like surface. On the dark video areas during the hero reveal it adds the look of film grain. One texture, three different moods, all correct.

**Why `position: fixed`:** The paper grain needs to cover the entire page at all times — including fixed elements like the nav, the preloader, and the hero. `position: absolute` on the body only covers the document height, which causes the texture to shift as the user scrolls on some browsers.

Make sure the `.paper` div is the **last child of `<body>`** or the last child of the root `#root` div so it sits on top of everything except the preloader (which has `z-index: 9999`).

In `App.tsx`, move the paper div to be a sibling of everything else at the root level:
```tsx
return (
  <div className="relative">
    {isPreloaderVisible && <Preloader onComplete={...} />}
    <Hero isPreloaderDone={isPreloaderDone} onVideoReady={...} />
    {/* ... other sections */}
    <div className="paper" />  {/* always last */}
  </div>
);
```

---

### 9. THE SCROLL-TO-ENTER INDICATOR

Below the SVG text and circle, add a subtle scroll prompt. This sits in the lower-left of the viewport and fades out along with the header in Step 1:

Add this inside the `containerRef` div, as a sibling to the SVG:
```tsx
<div
  style={{
    position: 'absolute',
    bottom: '28px',
    left: '28px',
    zIndex: 20,
    fontFamily: "'Courier New', monospace",
    fontSize: '9px',
    letterSpacing: '0.18em',
    color: 'rgba(249, 246, 240, 0.4)',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }}
  ref={scrollPromptRef}
>
  <span style={{ display: 'inline-block', animation: 'scrollBounce 1.8s ease-in-out infinite' }}>↓</span>
  <span>Scroll to enter</span>
</div>
```

Add the animation to `index.css`:
```css
@keyframes scrollBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(4px); }
}
```

Add `scrollPromptRef` to the existing `tl.to(headerRef.current, ...)` Step 1 fade so it disappears along with the meta text:
```tsx
tl.to([headerRef.current, scrollPromptRef.current], {
  opacity: 0,
  duration: 0.15,
}, 0);
```

---

### 10. WHAT COMES AFTER THE HERO

After the hero's scroll sequence completes and the full video is revealed, the user continues scrolling and the next section scrolls up over the video. The next section is the Photography grid. Its background is `#F9F6F0` (warm cream). It slides in from below with standard scroll behaviour — no special transition needed at this boundary. The contrast between the full-screen video handoff and the warm paper photography section is the intended visual shock.

---

## COMPONENT ARCHITECTURE

```
App.tsx
├── <Preloader onComplete={setPreloaderDone} />
├── <Hero isPreloaderDone={isPreloaderDone} onVideoReady={setVideoReady} />
│   ├── Vimeo background div (z-index: 0)
│   ├── bgOverlayRef dark vignette div (z-index: 1)
│   ├── headerRef meta text corners (z-index: 20)
│   ├── SVG mask layer (z-index: 10)
│   │   ├── <mask id="cutout-mask">
│   │   │   ├── maskRectRef (white fill, animates height)
│   │   │   ├── leftTextRef  "SARATH" (black fill = transparent cutout)
│   │   │   ├── circleRef    ● (black fill = transparent cutout)
│   │   │   └── rightTextRef "MENON" (black fill = transparent cutout)
│   │   └── visibleRectRef (crimson fill, masked)
│   └── scrollPromptRef ↓ scroll to enter (z-index: 20)
└── <div className="paper" />  (z-index: 9998, fixed, covers everything)
```

---

## FULL COLOUR & TOKEN REFERENCE

```
--hero-crimson:          #8B1E1E   (crimson block, same as preloader)
--hero-cream:            #F9F6F0   (text, meta labels, scroll prompt)
--hero-meta-opacity:     rgba(249, 246, 240, 0.45)   (meta corner text)
--hero-prompt-opacity:   rgba(249, 246, 240, 0.40)   (scroll to enter)
--hero-overlay:          linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.05), rgba(0,0,0,0.25))
```

---

## TYPOGRAPHY REFERENCE

| Element | Font | Weight | Size | Tracking |
|---|---|---|---|---|
| SARATH MENON | Cormorant Garamond | 700 | 10vw (desktop) / 14vw (mobile) | 0.02em |
| Meta corners | Courier New | 400 | 9px | 0.14em |
| Scroll prompt | Courier New | 400 | 9px | 0.18em |

---

## RESPONSIVE BEHAVIOUR

| Viewport | Name font size | Circle radius | Meta text | Scroll prompt |
|---|---|---|---|---|
| > 1280px | 10vw | 2.2vw | 3 columns, all visible | visible |
| 1024–1280px | 10vw | 2.2vw | 3 columns, all visible | visible |
| 768–1024px | 11vw | 2.8vw | Centre column hidden | visible |
| < 768px | 14vw | 4vw | All meta hidden | hidden |
| < 480px | 16vw | 5vw | All meta hidden | hidden |

On mobile the `y` target for the text in Step 2/3 of the timeline should be `68%` instead of `65%` to account for the larger relative text size.

---

## WHAT NOT TO DO

- Do not add a navbar to the hero. The Ghost Bar nav only appears after the user scrolls past the hero. It is a separate component built separately.
- Do not use a `<video>` HTML element for the background. Use the Vimeo Player SDK as specified.
- Do not hardcode Vimeo video IDs in multiple places. Define a single constant at the top of the file: `const VIMEO_VIDEO_ID = 123456789`.
- Do not start the GSAP ScrollTrigger timeline before `isPreloaderDone === true`.
- Do not remove the `scrub` from the ScrollTrigger. This is a scroll-driven animation, not a time-driven one.
- Do not add `overflow: hidden` to the hero container permanently — this is already managed by ScrollTrigger's pin behaviour.
- Do not apply `will-change: transform` to the SVG element. The `scale: 250` zoom is GPU-intensive enough. Adding `will-change` on top causes layer explosion on lower-end devices.
- Do not change the `<mask>` logic. Black fill = transparent cutout. White fill = opaque. This is SVG mask spec and is already correct.

---

## ACCEPTANCE CRITERIA

The hero is complete when:

1. Page loads: crimson top half, video playing behind letterform cutouts, three meta text corners visible
2. "SARATH" and "MENON" in Cormorant Garamond 700 with correct letter spacing
3. On scroll: crimson block drops to fill full screen, text creeps to vertical centre, circle follows
4. On continued scroll: SVG scales 250x from the circle origin, punching through to the full video
5. Overlay fades to zero, full unobstructed video fills the viewport
6. Paper grain texture visible across the entire page at all times via the fixed `.paper` layer
7. Paper grain correctly uses `mix-blend-mode: multiply` — visible on cream sections, crimson sections, and dark video sections
8. Vimeo video plays muted and looped, fills the full viewport without letterboxing
9. Poster frame visible instantly before Vimeo loads
10. Hero timeline does not initialise until preloader `onComplete` fires
11. `onVideoReady` fires and signals the preloader's counter to advance from 99 to 100
12. Scroll prompt (↓ Scroll to enter) visible on load, fades on first scroll movement
13. Fully responsive: larger text and hidden meta on mobile, correct circle sizing
14. The colour `#8B1E1E` is used consistently — no `#9e0000` remaining anywhere
