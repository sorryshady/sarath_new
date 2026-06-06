# Films Section — AI Build Prompt
## Project: Sarath Menon Portfolio (sarathmenon.com)

---

## CONTEXT

You are building the Films section of a photographer/filmmaker portfolio. The tech stack is **React + TypeScript + Tailwind CSS + GSAP + ScrollTrigger**. The preloader, hero, navbar, photography, and about teaser sections are already built. Read this prompt fully before writing any code.

This section sits after the About teaser (crimson) on the home scroll. It introduces a third distinct visual world: warm cinema dark. The background is `#120F0A` — a warm brown-black that reads like a cinema hall after the house lights have gone down. Not cold black. Not grey. Warm dark.

The section has two parts:
1. A **lights-down transition** driven by ScrollTrigger that gradually dims the page as the user scrolls from About into Films
2. The **Films section itself**: an accordion film carousel with film details below it

This is a home page preview only. A separate `/films` route handles the full catalogue.

---

## PART 1 — THE LIGHTS-DOWN TRANSITION

### Concept
As the user scrolls from the bottom of the About section toward the Films section, the page gradually darkens — like house lights dimming in a cinema before the film starts. By the time the Films section is fully in view, the background has settled to `#120F0A`. When the user scrolls past Films into the Poetry section, the lights come back up.

### Implementation
Create a fixed full-screen overlay div in `App.tsx`, outside any section component, as a sibling to all sections. It sits between the page content and the paper texture layer:

```tsx
// In App.tsx root div, after all sections, before .paper div
<div
  ref={cinemaDimRef}
  style={{
    position: 'fixed',
    inset: 0,
    background: '#120F0A',
    opacity: 0,
    zIndex: 9,
    pointerEvents: 'none',
  }}
/>
```

### ScrollTrigger setup
```typescript
// Lights down
gsap.to(cinemaDimRef.current, {
  opacity: 1,
  ease: 'none',
  scrollTrigger: {
    trigger: aboutSectionRef.current,
    start: 'bottom bottom',
    end: 'bottom top',
    scrub: 1.5,
  },
});

// Lights up
gsap.to(cinemaDimRef.current, {
  opacity: 0,
  ease: 'none',
  scrollTrigger: {
    trigger: filmsSectionRef.current,
    start: 'bottom bottom',
    end: 'bottom top',
    scrub: 1.5,
  },
});
```

`scrub: 1.5` creates a deliberate lag — like a real dimmer switch, not a digital toggle.

### z-index stack
```
z-index: 9998  — .paper grain texture
z-index: 1000  — Ghost Bar nav
z-index: 9     — Cinema dim overlay
z-index: 1–5   — Section content
```

---

## PART 2 — THE FILMS SECTION

### Background and wrapper
- `background: #120F0A`
- `data-nav-theme="dark"` on section wrapper
- `padding: 80px 0 80px` — no horizontal padding on the carousel itself, padding only on header and text panel
- `position: relative`, `overflow: hidden`

### Section header row
```
Left:  "Films"     — Cormorant Garamond 600, 32px, #EFD9B6, letter-spacing -0.01em
Right: "05 Works"  — Courier New, 9px, rgba(239,217,182,0.35), letter-spacing 0.14em
```
Full-width `0.5px` rule: `rgba(239,217,182,0.08)`
`margin-bottom: 32px`
`padding: 0 64px` on desktop, `0 32px` on tablet, `0 24px` on mobile
Works count is dynamic — driven by featured films array length.

---

## THE ACCORDION CAROUSEL

### Concept
A horizontal track of film cards. One centre card is wide and plays a muted looping Vimeo video. Cards on either side are compressed into thin vertical slices showing only a rotated film title. Ghost slivers at the far edges hint that more content exists beyond. When the user advances, all card widths animate simultaneously via GSAP — the centre card contracts, the incoming card expands, the whole track moves as one fluid object.

### Card states

**Centre card (active):**
- Fills the dominant width of the track
- Vimeo player running in `background` mode: muted, autoplay, loop
- A crimson `2px` top border: `border-top: 2px solid #8B1E1E`
- A play button circle centred on the card: `width: 44px`, `height: 44px`, `border: 1.5px solid rgba(239,217,182,0.5)`, `border-radius: 50%`, `▶` symbol inside in `#EFD9B6`
- Bottom gradient overlay: `linear-gradient(to top, rgba(0,0,0,0.8), transparent)`, covers bottom 55%
- "NOW PLAYING" label bottom-left in Courier monospace `7px`
- Film index counter bottom-right: e.g. `3 / 5`

**Thin cards (inactive):**
- Compressed width — see breakpoint table below
- Static thumbnail image as background (`object-fit: cover`) — no Vimeo player
- Dark overlay: `background: rgba(0,0,0,0.4)`
- Film title rotated 90°: `writing-mode: vertical-rl`, `transform: rotate(180deg)`, centred vertically, Courier New `7px`, `color: rgba(239,217,182,0.35)`, `letter-spacing: 0.12em`, `text-transform: uppercase`
- Cursor: `pointer`
- On hover: overlay lightens slightly to `rgba(0,0,0,0.25)`, title brightens to `rgba(239,217,182,0.6)`

**Ghost slivers:**
- `opacity: 0.4`, no interaction, purely visual depth
- Show a fragment of the thumbnail image

### Card width calculations

| | Desktop >1024px | Tablet 768–1024px | Mobile <768px |
|---|---|---|---|
| Centre card | 56% | 66% | 88% |
| Adjacent thin ×1 each | 9% | 13% | — |
| Adjacent thin ×2 each | 9% | — | — |
| Ghost slivers each | 3% | 4% | 6% |
| Gap between cards | 6px | 5px | 4px |

On desktop: 5 cards visible (centre + 2 each side) + 2 ghost slivers
On tablet: 3 cards visible (centre + 1 each side) + 2 ghost slivers
On mobile: 1 centre card only + 2 ghost slivers

### Track layout
```tsx
<div
  ref={trackRef}
  style={{
    display: 'flex',
    alignItems: 'stretch',
    gap: '6px',
    height: '340px',   // desktop
    overflow: 'hidden',
    touchAction: 'pan-y',  // CRITICAL: allows vertical page scroll while capturing horizontal swipe
  }}
>
  {/* ghost sliver left */}
  {/* thin cards left (desktop: 2, tablet: 1, mobile: 0) */}
  {/* centre card */}
  {/* thin cards right */}
  {/* ghost sliver right */}
</div>
```

**`touch-action: pan-y` is non-negotiable.** Without it, horizontal swipe gestures on mobile conflict with vertical page scroll and the browser will steal the gesture.

### Infinite loop logic
The carousel is an infinite loop. Cards are stored in a flat array. The visible set is always a window into that array centred on `activeIndex`. When `activeIndex` reaches the last item and the user advances, it wraps to index 0. When at index 0 and the user goes back, it wraps to the last item.

```typescript
const getVisibleCards = (films: Film[], activeIndex: number, visibleCount: number) => {
  const half = Math.floor(visibleCount / 2);
  const indices = [];
  for (let i = -half; i <= half; i++) {
    const idx = ((activeIndex + i) % films.length + films.length) % films.length;
    indices.push(idx);
  }
  return indices;
};
```

Do not re-render the entire card list on every advance. Use `gsap.to()` on the card width refs directly. The DOM order stays fixed — only the `activeIndex` state and widths change.

---

## GSAP TRANSITION ANIMATION

### Advancing right (next film)
```typescript
const advanceCarousel = (direction: 'next' | 'prev') => {
  if (isAnimating) return;
  setIsAnimating(true);

  const dir = direction === 'next' ? 1 : -1;
  const nextIndex = ((activeIndex + dir) % films.length + films.length) % films.length;

  // 1. Text slides out in direction of travel
  gsap.to(textRef.current, {
    x: dir * -60,
    opacity: 0,
    duration: 0.25,
    ease: 'power2.in',
  });

  // 2. Animate all card widths simultaneously
  const tl = gsap.timeline({
    onComplete: () => {
      setActiveIndex(nextIndex);
      setIsAnimating(false);
      // 3. New text slides in from opposite direction
      gsap.fromTo(textRef.current,
        { x: dir * 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    },
  });

  // Outgoing centre → thin
  tl.to(centreCardRef.current, {
    flexBasis: '9%',
    duration: 0.55,
    ease: 'power2.inOut',
  }, 0);

  // Incoming thin → centre
  tl.to(incomingCardRef.current, {
    flexBasis: '56%',
    duration: 0.55,
    ease: 'power2.inOut',
  }, 0);

  // Crimson top border: fade out on outgoing, fade in on incoming
  tl.to(outgoingBorderRef.current, { opacity: 0, duration: 0.2 }, 0);
  tl.to(incomingBorderRef.current, { opacity: 1, duration: 0.2 }, 0.35);
};
```

### Text transition detail
The text block below slides out in the same direction as the carousel travel, and new text slides in from the opposite side. This makes the entire section feel like one unified moving surface.

- Advancing right: text slides left out (`x: -60`), new text comes from right (`x: 60`)
- Advancing left: text slides right out (`x: 60`), new text comes from left (`x: -60`)

Text reveal inside the panel: title fades in first, then meta line, then description, with `stagger: 0.06s`.

### Dot indicator
```tsx
// Active film: wide pill
// Inactive films: small circle
{films.map((_, i) => (
  <div
    key={i}
    style={{
      width: i === activeIndex ? '18px' : '4px',
      height: '4px',
      background: i === activeIndex ? '#8B1E1E' : 'rgba(239,217,182,0.2)',
      borderRadius: '2px',
      transition: 'width 0.3s ease, background 0.3s ease',
    }}
  />
))}
```

---

## VIMEO PLAYER MANAGEMENT

```typescript
// On activeIndex change:
useEffect(() => {
  const activeFilm = films[activeIndex];

  // Initialise new player on incoming centre card
  if (!playerRefs.current[activeIndex] && vimeoContainerRefs.current[activeIndex]) {
    const player = new VimeoPlayer(vimeoContainerRefs.current[activeIndex], {
      id: activeFilm.vimeoId,
      background: true,
      muted: true,
      autoplay: true,
      loop: true,
      responsive: true,
    });
    playerRefs.current[activeIndex] = player;
  } else {
    // Player already exists — resume
    playerRefs.current[activeIndex]?.play();
  }

  // Pause outgoing player (do NOT destroy — keep for quick re-access)
  const prevIndex = ((activeIndex - 1) % films.length + films.length) % films.length;
  playerRefs.current[prevIndex]?.pause();
}, [activeIndex]);

// On unmount — destroy all players
useEffect(() => {
  return () => {
    Object.values(playerRefs.current).forEach(player => player?.destroy());
  };
}, []);
```

Never run more than one Vimeo player at a time. Only the active centre card has a running player. All others show static thumbnails.

### Play button — opens lightbox
```typescript
const handlePlayClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  const activeFilm = films[activeIndex];

  // Pause background player
  playerRefs.current[activeIndex]?.pause();

  // Open lightbox with same Vimeo ID
  openLightbox(activeFilm.vimeoId);
};

// On lightbox close:
const handleLightboxClose = () => {
  closeLightbox();
  // Resume background player
  playerRefs.current[activeIndex]?.play();
};
```

---

## FILM DETAILS TEXT PANEL

Sits below the carousel track, separated by a `0.5px` rule in `rgba(239,217,182,0.06)`.

### Desktop layout (two columns)
```tsx
<div ref={textRef} style={{
  padding: '24px 64px 0',
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '32px',
  alignItems: 'start',
}}>
  {/* Left: title + description */}
  <div>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '28px',
      fontWeight: 600,
      color: '#EFD9B6',
      letterSpacing: '-0.01em',
      marginBottom: '10px',
    }}>
      {activeFilm.title}
    </div>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '15px',
      fontWeight: 300,
      color: 'rgba(239,217,182,0.6)',
      lineHeight: 1.7,
      maxWidth: '520px',
    }}>
      {activeFilm.description}
    </div>
  </div>

  {/* Right: meta */}
  <div style={{ textAlign: 'right', flexShrink: 0 }}>
    <div style={{
      fontFamily: "'Courier New', monospace",
      fontSize: '8px',
      color: 'rgba(239,217,182,0.35)',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      lineHeight: 2.2,
    }}>
      <div>{activeFilm.role}</div>
      <div>{activeFilm.format}</div>
      <div>{activeFilm.year}</div>
      {activeFilm.award && <div style={{ color: 'rgba(239,217,182,0.5)' }}>{activeFilm.award}</div>}
    </div>
  </div>
</div>
```

### Tablet layout (single column)
- Same content, `grid-template-columns: 1fr`
- Meta sits below description, left-aligned
- `padding: 20px 32px 0`

### Mobile layout (single column, larger)
- Title: `font-size: 22px`, `line-height: 1.1`, allow two lines
- Description: `font-size: 14px`
- "▶ Watch film" CTA moves into this panel on mobile (not on the card itself)
- `padding: 16px 24px 0`

---

## MOBILE SWIPE GESTURE

```typescript
const touchStartX = useRef<number>(0);
const touchStartY = useRef<number>(0);

const handleTouchStart = (e: React.TouchEvent) => {
  touchStartX.current = e.touches[0].clientX;
  touchStartY.current = e.touches[0].clientY;
};

const handleTouchEnd = (e: React.TouchEvent) => {
  const deltaX = e.changedTouches[0].clientX - touchStartX.current;
  const deltaY = e.changedTouches[0].clientY - touchStartY.current;

  // Only trigger if horizontal movement dominates
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
    if (deltaX < 0) advanceCarousel('next');
    else advanceCarousel('prev');
  }
};
```

Apply `onTouchStart` and `onTouchEnd` to the carousel track div. The `touch-action: pan-y` CSS ensures vertical page scroll still works while horizontal swipe is captured.

---

## NAVIGATION CONTROLS

### Desktop and tablet — arrow buttons
```tsx
<button onClick={() => advanceCarousel('prev')} style={{
  background: 'none',
  border: '0.5px solid rgba(239,217,182,0.2)',
  color: '#EFD9B6',
  fontFamily: "'Courier New', monospace",
  fontSize: '14px',
  width: '36px',
  height: '36px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.6,
  transition: 'opacity 0.2s ease',
}}>←</button>
```

On hover: opacity rises to `1.0`.

### Mobile — text labels flanking dots
```tsx
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <span onClick={() => advanceCarousel('prev')} style={{
    fontFamily: "'Courier New', monospace",
    fontSize: '9px',
    letterSpacing: '0.1em',
    color: 'rgba(239,217,182,0.4)',
    cursor: 'pointer',
    textTransform: 'uppercase',
  }}>← Prev</span>

  {/* Dot indicators centred */}

  <span onClick={() => advanceCarousel('next')} style={{
    fontFamily: "'Courier New', monospace",
    fontSize: '9px',
    letterSpacing: '0.1em',
    color: 'rgba(239,217,182,0.4)',
    cursor: 'pointer',
    textTransform: 'uppercase',
  }}>Next →</span>
</div>
```

---

## VIMEO LIGHTBOX

When play button is clicked on the centre card:

```tsx
{lightboxOpen && (
  <div
    ref={lightboxRef}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 9990,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
    onClick={handleLightboxClose}
  >
    <button style={{
      position: 'absolute',
      top: '24px',
      right: '28px',
      fontFamily: "'Courier New', monospace",
      fontSize: '10px',
      letterSpacing: '0.14em',
      color: 'rgba(239,217,182,0.6)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      textTransform: 'uppercase',
    }} onClick={handleLightboxClose}>
      ✕ Close
    </button>

    <div
      ref={lightboxPlayerRef}
      onClick={(e) => e.stopPropagation()}
      style={{ width: '85vw', maxWidth: '1200px', aspectRatio: '16/9' }}
    />
  </div>
)}
```

Lightbox open animation: `gsap.fromTo(lightboxRef, { opacity: 0 }, { opacity: 1, duration: 0.3 })`
Lightbox close animation: `gsap.to(lightboxRef, { opacity: 0, duration: 0.25, onComplete: closeLightbox })`
Keyboard close: Escape key listener.
On close: destroy lightbox player instance, resume background carousel player.

---

## VIEW ALL FILMS LINK

Below the text panel:
```tsx
<div style={{
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '20px 64px 0',
  borderTop: '0.5px solid rgba(239,217,182,0.06)',
  marginTop: '24px',
}}>
  <a href="/films" style={{
    fontFamily: "'Courier New', monospace",
    fontSize: '9px',
    letterSpacing: '0.16em',
    color: '#EFD9B6',
    textTransform: 'uppercase',
    textDecoration: 'none',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
  }}
  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
  onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
    View all films →
  </a>
</div>
```

---

## SCROLL ENTRY ANIMATION

```typescript
// Header fades in
gsap.fromTo('.films-header',
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
    scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
);

// Carousel track scales up slightly
gsap.fromTo(trackRef.current,
  { opacity: 0, scale: 0.98 },
  { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out', delay: 0.1,
    scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
);

// Text panel fades in
gsap.fromTo(textRef.current,
  { opacity: 0, y: 16 },
  { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.2,
    scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' } }
);
```

---

## DATA STRUCTURE (Sanity CMS)

```typescript
interface Film {
  title: string;
  slug: string;
  vimeoId: number;
  thumbnail: string;       // Sanity image — shown on thin cards and as poster
  description: string;     // 1-2 sentences shown in text panel below carousel
  format: string;          // e.g. "Feature Film" / "Short Film"
  year: string;
  role: 'director' | 'cinematographer' | 'screenwriter';
  award: string | null;
  featured: boolean;
  order: number;
}
```

Home page shows only `featured: true` films ordered by `order`.
The showreel is film entry with `order: 1` — not a separate field.
Hard-code placeholder data now, wire Sanity later.

---

## CAROUSEL HEIGHT

| Breakpoint | Track height |
|---|---|
| Desktop >1280px | 360px |
| Desktop 1024–1280px | 300px |
| Tablet 768–1024px | 240px |
| Mobile <768px | 200px |

Use CSS custom property or a JS resize listener. Do not use `aspect-ratio` on the track — fixed height gives consistent layout regardless of how many cards are visible.

---

## COLOUR TOKEN REFERENCE

```
Section background:         #120F0A
Section heading:            #EFD9B6
Meta / sub-labels:          rgba(239, 217, 182, 0.35)
Section rule:               rgba(239, 217, 182, 0.08)
Active card border:         #8B1E1E (2px top)
Thin card overlay:          rgba(0, 0, 0, 0.40)
Thin card title:            rgba(239, 217, 182, 0.35)
Ghost sliver opacity:       0.4
Active dot:                 #8B1E1E pill
Inactive dot:               rgba(239, 217, 182, 0.20) circle
Film title text:            #EFD9B6
Film description:           rgba(239, 217, 182, 0.60)
Film meta:                  rgba(239, 217, 182, 0.35)
View all link:              #EFD9B6 at opacity 0.7
Cinema dim overlay:         #120F0A
```

---

## TYPOGRAPHY REFERENCE

| Element | Font | Weight | Size | Tracking |
|---|---|---|---|---|
| Section heading "Films" | Cormorant Garamond | 600 | 32px | -0.01em |
| Works count | Courier New | 400 | 9px | 0.14em |
| Thin card title (rotated) | Courier New | 400 | 7px | 0.12em |
| Now playing label | Courier New | 400 | 7px | 0.10em |
| Film title (text panel) | Cormorant Garamond | 600 | 28px desktop / 22px mobile | -0.01em |
| Film description | Cormorant Garamond | 300 | 15px desktop / 14px mobile | 0 |
| Film meta | Courier New | 400 | 8px | 0.12em |
| View all link | Courier New | 400 | 9px | 0.16em |
| Arrow buttons | Courier New | 400 | 14px | 0 |
| Lightbox close | Courier New | 400 | 10px | 0.14em |

---

## WHAT NOT TO DO

- Do not use CSS transitions for card width animation — use GSAP exclusively for frame-accurate sync
- Do not run more than one Vimeo background player simultaneously — only the active centre card plays
- Do not destroy inactive Vimeo players — pause them so they resume instantly on return
- Do not use `#000000` or any cold dark — `#120F0A` only
- Do not create the cinema dim overlay inside the Films component — it lives in App.tsx
- Do not use `touch-action: none` — use `touch-action: pan-y` to preserve vertical page scroll
- Do not re-render the entire card DOM on every advance — mutate widths via GSAP refs
- Do not add `data-nav-theme="light"` — this is a dark section
- Do not forget to destroy all Vimeo instances on component unmount

---

## ACCEPTANCE CRITERIA

1. Lights-down transition fires as user scrolls from About into Films — warm `#120F0A`, scrub 1.5
2. Lights come back up as user scrolls past Films into Poetry
3. Carousel renders with correct card distribution per breakpoint (5+2 / 3+2 / 1+2)
4. Centre card plays Vimeo video muted in background mode with crimson top border
5. Thin cards show static thumbnail, rotated title, dark overlay
6. Ghost slivers visible at both edges
7. Clicking thin card or arrow advances carousel — GSAP accordion width animation fires
8. All card widths animate simultaneously in one fluid motion
9. Text panel slides out in direction of travel, new text slides in from opposite side
10. Text reveal stagger: title first, meta second, description third
11. Dot indicators update — active dot expands to crimson pill
12. Clicking play button opens Vimeo lightbox, background player pauses
13. Lightbox closes on backdrop click, close button, or Escape — background player resumes
14. Lightbox Vimeo instance destroyed on close
15. Mobile: swipe gesture navigates, touch-action: pan-y prevents scroll conflict
16. Mobile: no thin cards, ghost slivers only, text labels instead of arrow buttons
17. Mobile: Watch film CTA in text panel not on card
18. Works count in header is dynamic
19. View all films → routes to /films
20. `data-nav-theme="dark"` on section wrapper
