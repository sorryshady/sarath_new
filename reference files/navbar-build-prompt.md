# Ghost Bar Navigation Component — AI Build Prompt
## Project: Sarath Menon Portfolio (sarathmenon.com)

---

## CONTEXT

You are building the navigation bar for a photographer/filmmaker portfolio website. The tech stack is **React + TypeScript + Tailwind CSS + GSAP**. The preloader and hero section are already built as separate components. Read this prompt fully before writing any code.

The nav is called the **Ghost Bar**. It does not exist during the hero sequence. It slides in from the top only after the hero's scroll animation has fully completed and the full-screen video is revealed. From that point on it stays fixed at the top of the viewport for all subsequent sections.

The nav must feel like printed matter — sparse, monospace, no decorative flourishes. It auto-inverts its colour scheme based on the background colour of the section currently in the viewport.

---

## DESIGN SPECIFICATION

### Layout

```
[ SM ]                    [ Works   Films   Poetry   About   Contact ]
  ↑                                        ↑
Cormorant Garamond 600               Courier New, monospace
Links to home route /                All uppercase, letter-spacing: 0.12em
```

- `position: fixed`, `top: 0`, `left: 0`, `right: 0`, `z-index: 1000`
- Height: `48px` on desktop, `44px` on mobile
- Padding: `0 28px` on desktop, `0 20px` on mobile
- `display: flex`, `align-items: center`, `justify-content: space-between`
- No background colour of its own — it sits directly over the page content
- A very subtle `backdrop-filter: blur(8px)` with a near-transparent background tint so text remains readable when scrolling over busy images. See colour inversion section below for the exact values per mode.

### SM Monogram

- Font: `Cormorant Garamond`, weight `600`, `font-size: 17px`
- Letter spacing: `0.04em`
- Links to the home route `/` via React Router `<Link>` or `window.location.href`
- On hover: `opacity` drops to `0.6`, `transition: opacity 0.2s ease`
- No underline, no border

### Nav Links

Five links in a row, right-aligned:
`Works` · `Films` · `Poetry` · `About` · `Contact`

- Font: `Courier New, monospace`
- `font-size: 10px`
- `letter-spacing: 0.12em`
- `text-transform: uppercase`
- `gap: 32px` between links on desktop, `gap: 20px` on tablet
- No underline by default
- Each link is a React Router `<Link>` or an anchor with smooth scroll to the relevant section ID

### Link Targets

| Nav label | Target |
|---|---|
| Works | Scrolls to `#photography` section on home page |
| Films | Scrolls to `#films` section on home page |
| Poetry | Routes to `/poetry` page |
| About | Routes to `/about` page |
| Contact | Scrolls to `#contact` section on home page |

Works and Films scroll to sections on the home page. Poetry and About are separate routes. Contact scrolls to the footer section.

---

## COLOUR INVERSION SYSTEM

The nav has two colour modes. It switches automatically based on which section is currently dominant in the viewport. Use an `IntersectionObserver` watching each major section's background colour class or a `data-nav-theme` attribute on each section.

### Light Mode (default — used over cream `#F9F6F0` sections)
```
SM monogram:       #111111
Nav links:         rgba(17, 17, 17, 0.55)   (muted by default)
Active link:       #111111                   (full opacity)
Backdrop tint:     rgba(249, 246, 240, 0.72)
backdrop-filter:   blur(8px)
Border bottom:     0.5px solid rgba(17, 17, 17, 0.08)
```

### Dark Mode (used over crimson `#8B1E1E` and dark video sections)
```
SM monogram:       #EFD9B6
Nav links:         rgba(239, 217, 182, 0.5)  (muted by default)
Active link:       #EFD9B6                   (full opacity)
Backdrop tint:     rgba(139, 30, 30, 0.45)
backdrop-filter:   blur(8px)
Border bottom:     0.5px solid rgba(239, 217, 182, 0.12)
```

### How to detect which mode to use

Add a `data-nav-theme="dark"` or `data-nav-theme="light"` attribute to every major section wrapper in the page:

```tsx
// Cream sections
<section id="photography" data-nav-theme="light"> ... </section>
<section id="films" data-nav-theme="light"> ... </section>
<section id="contact" data-nav-theme="light"> ... </section>

// Dark / crimson sections
<section id="about" data-nav-theme="dark"> ... </section>
// The hero section does not carry this attribute — nav is hidden during hero
```

Then use an `IntersectionObserver` in the nav component:

```typescript
useEffect(() => {
  const sections = document.querySelectorAll('[data-nav-theme]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const theme = (entry.target as HTMLElement).dataset.navTheme;
          setNavTheme(theme as 'light' | 'dark');
        }
      });
    },
    { threshold: 0.4 } // section must be 40% visible to trigger
  );

  sections.forEach((section) => observer.observe(section));
  return () => observer.disconnect();
}, []);
```

The colour transition between modes must be animated:
```css
transition: color 0.4s ease, background-color 0.4s ease, border-color 0.4s ease;
```

---

## ACTIVE SECTION INDICATOR

The active link is determined by which section is currently dominant in the viewport. Use the same `IntersectionObserver` above to also track `activeSection`.

### Active state styles

Both of these apply simultaneously to the active link:

**1. Opacity shift:**
- Inactive links: `opacity: 0.5`
- Active link: `opacity: 1`
- Transition: `opacity 0.3s ease`

**2. Underline:**
- A `1px` bottom border in crimson `#8B1E1E` on light mode
- A `1px` bottom border in `#EFD9B6` on dark mode
- Implemented as `border-bottom` or a `::after` pseudo-element, not `text-decoration`
- The underline animates in from left to right using a CSS `scaleX` transform:

```css
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.3s ease;
}

.nav-link.active::after {
  transform: scaleX(1);
}
```

Each nav link needs `position: relative` for this to work.

---

## ENTRY ANIMATION

The nav is invisible (`opacity: 0`, `transform: translateY(-100%)`) by default.

It slides in after the hero sequence completes. The hero fires an `onHeroComplete` callback (or sets a global state flag `isHeroComplete: true`) when its scroll timeline finishes. The nav listens for this and triggers its entry animation.

```typescript
useEffect(() => {
  if (!isHeroComplete) return;

  gsap.fromTo(navRef.current,
    {
      opacity: 0,
      y: -100,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.2, // brief pause after hero completes before nav appears
    }
  );
}, [isHeroComplete]);
```

The `isHeroComplete` flag is set in `App.tsx` and passed as a prop. It is triggered by the `onComplete` callback of the hero's final ScrollTrigger animation step (the SVG opacity fade in Step 5 of the hero timeline).

**Important:** Do not show the nav while the hero scroll sequence is in progress, even partially. The hero section is a pinned full-screen experience. Any nav chrome during that sequence breaks the immersion.

---

## MOBILE BEHAVIOUR

On viewports narrower than `768px`, hide the five nav links. Show only the SM monogram on the left and a minimal menu trigger on the right.

### Menu trigger (mobile only)
- Position: `top-right`, `padding: 14px 20px`
- Appearance: two short horizontal lines (`—`), `font-family: 'Courier New', monospace`, `font-size: 14px`, `letter-spacing: 0.08em`, colour matches current nav mode
- No hamburger icon — use the literal text character `—` as the trigger. More editorial, less generic.
- On tap: opens the full-screen mobile menu overlay (see below)

### Full-screen mobile menu overlay

When the trigger is tapped, a full-screen crimson overlay covers the viewport:

```
Background:  #8B1E1E
z-index:     2000 (above everything including the nav itself)
Animation:   slides up from bottom, duration 0.5s, ease: power3.out
```

Inside the overlay:

```tsx
<div style={{ background: '#8B1E1E', position: 'fixed', inset: 0, zIndex: 2000 }}>

  {/* Top row: SM monogram + close trigger */}
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px' }}>
    <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '17px', fontWeight: 600, color: '#EFD9B6' }}>SM</span>
    <span style={{ fontFamily: 'Courier New', fontSize: '10px', letterSpacing: '0.14em', color: 'rgba(239,217,182,0.6)', textTransform: 'uppercase' }}>✕ Close</span>
  </div>

  {/* Large nav links — staggered in with GSAP */}
  <div style={{ padding: '48px 28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <a style={{ fontFamily: 'Cormorant Garamond', fontSize: '52px', fontWeight: 600, color: '#EFD9B6', lineHeight: 1 }}>Works</a>
    <a style={{ fontFamily: 'Cormorant Garamond', fontSize: '52px', fontWeight: 600, color: 'rgba(239,217,182,0.35)', lineHeight: 1 }}>Films</a>
    <a style={{ fontFamily: 'Cormorant Garamond', fontSize: '52px', fontWeight: 600, color: 'rgba(239,217,182,0.35)', lineHeight: 1 }}>Poetry</a>
    <a style={{ fontFamily: 'Cormorant Garamond', fontSize: '52px', fontWeight: 600, color: 'rgba(239,217,182,0.35)', lineHeight: 1 }}>About</a>
    <a style={{ fontFamily: 'Cormorant Garamond', fontSize: '52px', fontWeight: 600, color: 'rgba(239,217,182,0.35)', lineHeight: 1 }}>Contact</a>
  </div>

  {/* Bottom meta strip */}
  <div style={{ position: 'absolute', bottom: '24px', left: '28px', right: '28px', display: 'flex', justifyContent: 'space-between' }}>
    <span style={{ fontFamily: 'Courier New', fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(239,217,182,0.3)', textTransform: 'uppercase' }}>Photographer · Filmmaker · Poet</span>
    <span style={{ fontFamily: 'Courier New', fontSize: '9px', letterSpacing: '0.14em', color: 'rgba(239,217,182,0.3)', textTransform: 'uppercase' }}>London</span>
  </div>
</div>
```

### Mobile menu GSAP entry animation

Stagger the nav links in with GSAP after the overlay slides up:

```typescript
gsap.fromTo('.mobile-nav-link',
  { opacity: 0, y: 24 },
  {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.07,
    delay: 0.25, // after overlay finishes sliding up
  }
);
```

### Mobile menu exit animation

On close tap:
1. Links fade out (`opacity: 0`, `duration: 0.2s`)
2. Overlay slides back down off screen (`translateY: 100%`, `duration: 0.45s`, `ease: power3.in`)
3. Overlay unmounts from DOM after animation completes

---

## COLOUR TOKEN REFERENCE

```
--nav-monogram-light:      #111111
--nav-monogram-dark:       #EFD9B6
--nav-link-light:          rgba(17, 17, 17, 0.55)
--nav-link-dark:           rgba(239, 217, 182, 0.5)
--nav-link-active-light:   #111111
--nav-link-active-dark:    #EFD9B6
--nav-underline-light:     #8B1E1E
--nav-underline-dark:      #EFD9B6
--nav-backdrop-light:      rgba(249, 246, 240, 0.72)
--nav-backdrop-dark:       rgba(139, 30, 30, 0.45)
--nav-border-light:        rgba(17, 17, 17, 0.08)
--nav-border-dark:         rgba(239, 217, 182, 0.12)
--mobile-overlay-bg:       #8B1E1E
```

---

## TYPOGRAPHY REFERENCE

| Element | Font | Weight | Size | Tracking |
|---|---|---|---|---|
| SM monogram | Cormorant Garamond | 600 | 17px | 0.04em |
| Nav links | Courier New | 400 | 10px | 0.12em |
| Mobile links | Cormorant Garamond | 600 | 52px | 0 |
| Mobile close | Courier New | 400 | 10px | 0.14em |
| Mobile meta | Courier New | 400 | 9px | 0.14em |

---

## COMPONENT INTERFACE

```typescript
interface NavProps {
  isHeroComplete: boolean; // triggers entry animation
}
```

In `App.tsx`, `isHeroComplete` is set to `true` when the hero's final GSAP step (`onComplete` of the SVG opacity fade) fires. Pass it down to both the `<Nav>` and any other components that need it.

---

## GLOBAL FONT IMPORT

Ensure this single import is in `index.css`. It covers all font needs for the entire site:

```css
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap');
```

Courier New is a system font — no import needed.

---

## PAPER TEXTURE NOTE

The `.paper` class is already applied globally in `index.css` as a `position: fixed` layer at `z-index: 9998`. It sits above all page content but below the preloader (`z-index: 9999`). The nav at `z-index: 1000` sits below the paper texture — this is correct and intentional. The grain sits over the nav links just as it sits over everything else, preserving the tactile printed-page quality across all UI elements.

Do not add any additional texture or grain effects to the nav component itself.

---

## WHAT NOT TO DO

- Do not show the nav at any point during the hero scroll sequence
- Do not use `text-decoration: underline` for the active state — use `border-bottom` or `::after` pseudo-element
- Do not hardcode nav theme as light or dark — it must always read from the current section's `data-nav-theme` attribute
- Do not add any logo image or icon — the SM monogram is typographic only
- Do not add hover background fills, pill shapes, or any other decorative hover states — opacity shift only
- Do not add drop shadows to the nav bar
- Do not use any font other than Cormorant Garamond and Courier New in this component
- Do not add the nav to the preloader layer — the preloader sits at `z-index: 9999` and handles its own UI

---

## ACCEPTANCE CRITERIA

The navbar is complete when:

1. Nav is completely invisible during the entire hero scroll sequence
2. Nav slides down cleanly from the top after `isHeroComplete` fires, with a 0.2s delay
3. SM monogram navigates to `/` on click
4. All five links scroll to or route to the correct targets
5. Active link shows both a crimson/parchment underline (scaleX animation) and full opacity vs muted inactive links
6. Nav automatically switches between light and dark modes as sections scroll into view
7. Colour transition between modes is smooth, 0.4s ease
8. `backdrop-filter: blur(8px)` keeps text legible over busy image backgrounds
9. On mobile: only SM monogram and `—` trigger visible
10. Mobile overlay: full crimson screen, large Cormorant links, staggered GSAP entry, slides back down on close
11. Paper grain texture sits over the nav correctly via the global `.paper` fixed layer
12. No nav chrome visible during preloader
