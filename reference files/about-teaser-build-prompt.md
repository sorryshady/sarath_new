# About Teaser Section — AI Build Prompt
## Project: Sarath Menon Portfolio (sarathmenon.com)

---

## CONTEXT

You are building the About teaser section of a photographer/filmmaker portfolio. The tech stack is **React + TypeScript + Tailwind CSS + GSAP + ScrollTrigger**. The preloader, hero, navbar, and photography sections are already built. Read this prompt fully before writing any code.

This section sits immediately after the Photography section on the home scroll. It is the first crimson section the user hits after the warm cream photography grid. The colour contrast between the two sections is the transition — no special effect needed at the boundary. The cream scrolls away and the crimson is revealed.

This is a **teaser**, not the full biography. It carries two to three lines of copy and a small portrait photograph. The full biography lives at `/about` which is a separate route. This section's job is to introduce Sarath as a person and earn the click to read more.

---

## LAYOUT — DIRECTION C (ASYMMETRIC)

The dominant element is the **large typographic name and bio text** occupying roughly 65% of the section width on the left. The **portrait photograph** is a small, anchored element in the top-right corner — like a passport photo pinned to a page, or a still from a film contact sheet. The name is not decorative. It is the hierarchy anchor.

```
┌─────────────────────────────────────────────┐
│                                  ┌─────────┐│
│  About                           │         ││
│                                  │ PORTRAIT││
│  SARATH                          │  3:4    ││
│  MENON                           │  B&W    ││
│                                  └─────────┘│
│  ─────────────────────                      │
│                                             │
│  Bio text, two sentences,                   │
│  Cormorant Garamond 300                     │
│                                             │
│  Full story →                               │
└─────────────────────────────────────────────┘
```

---

## VISUAL DESIGN SPECIFICATION

### Section background
- `background: #8B1E1E` (darkroom crimson — same as preloader)
- `padding: 80px 64px` on desktop, `padding: 64px 32px` on tablet, `padding: 56px 24px` on mobile
- `min-height: 80vh` — gives the section enough room to breathe without forcing full viewport height
- `data-nav-theme="dark"` on the section wrapper so the Ghost Bar nav inverts to parchment mode
- `position: relative`, `overflow: hidden`

### Film grain overlay
The global `.paper` fixed layer handles the texture. Do not add any additional grain. The `mix-blend-mode: multiply` paper layer on the crimson background creates exactly the right tactile cloth surface. Do not fight it.

### Section label
- Top-left, above the name
- `font-family: 'Courier New', monospace`
- `font-size: 9px`, `letter-spacing: 0.2em`, `text-transform: uppercase`
- `color: rgba(239, 217, 182, 0.45)` (muted parchment)
- Text: `About`
- `margin-bottom: 20px`

### The name — typographic anchor
```
SARATH
MENON
```
- `font-family: 'Cormorant Garamond', serif`
- `font-weight: 600`
- `font-size: clamp(52px, 7vw, 88px)`
- `color: #EFD9B6` (parchment)
- `line-height: 0.92`
- `letter-spacing: -0.02em`
- Two lines. "SARATH" on line one, "MENON" on line two. Not on one line.
- `text-transform: uppercase`

### Divider rule
Below the name:
- `width: 40px`, `height: 0.5px`
- `background: rgba(239, 217, 182, 0.3)`
- `margin: 24px 0`

### Bio text
Working copy (editable via Sanity later):

> *"Sarath Menon trained at the London Film School after his debut film was recognised at the 2016 Kerala State Chalachitra Academy Awards. He works across film, photography, and poetry — three disciplines sharing a single eye."*

Styles:
- `font-family: 'Cormorant Garamond', serif`
- `font-weight: 300`
- `font-size: clamp(15px, 1.6vw, 18px)`
- `line-height: 1.75`
- `color: rgba(239, 217, 182, 0.72)`
- `max-width: 480px`

### Full story link
Below the bio, `margin-top: 28px`:
```tsx
<a href="/about" style={{
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontFamily: "'Courier New', monospace",
  fontSize: '9px',
  letterSpacing: '0.18em',
  color: '#EFD9B6',
  textTransform: 'uppercase',
  textDecoration: 'none',
}}>
  <span>Full story</span>
  <span>→</span>
</a>
```

On hover: `opacity` drops to `0.6`, `transition: opacity 0.2s ease`. No underline.

---

## THE PORTRAIT

### Position
```css
position: absolute;
top: 48px;
right: 64px;
width: clamp(100px, 11vw, 148px);
```

On tablet (`< 1024px`): `right: 32px`, `width: 110px`
On mobile (`< 768px`): see mobile section below.

### Visual treatment
- Aspect ratio: `3:4` (portrait orientation)
- The photograph is a **black and white** portrait of Sarath
- Apply a CSS filter to desaturate if a colour image is supplied: `filter: grayscale(100%) contrast(1.05)`
- A subtle warm tint is applied via a pseudo-element overlay to tie it into the crimson palette:
  ```css
  .portrait-wrapper::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(139, 30, 30, 0.12);
    mix-blend-mode: multiply;
    pointer-events: none;
  }
  ```
- `object-fit: cover`, `width: 100%`, `height: 100%`
- No border-radius — square corners
- No border — the portrait floats directly on the crimson background

### Portrait caption
Below the portrait image, `margin-top: 8px`:
- `font-family: 'Courier New', monospace`
- `font-size: 7px`
- `letter-spacing: 0.12em`
- `color: rgba(239, 217, 182, 0.28)`
- `text-align: center`
- Text: `LONDON · 2024` (update year as needed, editable via Sanity)

---

## GSAP SCROLL ENTRY ANIMATIONS

All animations trigger when the section enters the viewport via ScrollTrigger. Use `start: 'top 75%'` so they fire a beat before the section is fully in view, giving the impression the content was always there and is just becoming visible.

### Name reveal
Split each letter using GSAP SplitText or manual span wrapping. Animate characters from `y: 40px, opacity: 0` to `y: 0, opacity: 1`:
```typescript
gsap.fromTo('.about-name-char', 
  { y: 40, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.025,
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top 75%',
    },
  }
);
```

### Bio text reveal
Lines slide up after the name:
```typescript
gsap.fromTo('.about-bio-line',
  { y: 20, opacity: 0 },
  {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power2.out',
    stagger: 0.12,
    delay: 0.3,
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top 75%',
    },
  }
);
```

### Portrait enter
Portrait enters slightly after text, with a gentle scale settle:
```typescript
gsap.fromTo(portraitRef.current,
  { scale: 1.06, opacity: 0 },
  {
    scale: 1,
    opacity: 1,
    duration: 0.9,
    ease: 'power2.out',
    delay: 0.2,
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top 75%',
    },
  }
);
```

### Full story link
Fades in last:
```typescript
gsap.fromTo(linkRef.current,
  { opacity: 0 },
  {
    opacity: 1,
    duration: 0.5,
    delay: 0.6,
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top 75%',
    },
  }
);
```

---

## MOBILE BEHAVIOUR

On viewports narrower than `768px`:

- Portrait moves from absolute top-right to inline, sitting **above** the name rather than beside it
- Portrait width: `80px`, centred or left-aligned to match the text column
- Name font size: `clamp(44px, 12vw, 64px)`
- Bio text `max-width: 100%` — fills the mobile column
- Padding: `56px 24px`
- All animations still fire on scroll enter, same timing

```
Mobile layout:
┌─────────────────────┐
│  About              │
│                     │
│  [portrait 80px]    │
│  LONDON · 2024      │
│                     │
│  SARATH             │
│  MENON              │
│  ───────            │
│  Bio text here...   │
│                     │
│  Full story →       │
└─────────────────────┘
```

---

## SANITY CMS FIELDS

This section should be editable via Sanity. The following fields on an `aboutTeaser` document type:

```typescript
interface AboutTeaser {
  portrait: SanityImageAsset;      // The portrait photograph
  portraitCaption: string;         // e.g. "London · 2024"
  bioText: string;                 // The two-sentence teaser copy
  // Name is always "Sarath Menon" — not editable, hardcoded
}
```

The full biography text, influences, filmography credits, and awards all live on the `/about` page schema, not here.

---

## COLOUR TOKEN REFERENCE

```
Section background:       #8B1E1E
Name text:                #EFD9B6
Bio text:                 rgba(239, 217, 182, 0.72)
Section label:            rgba(239, 217, 182, 0.45)
Divider rule:             rgba(239, 217, 182, 0.30)
Full story link:          #EFD9B6
Portrait tint overlay:    rgba(139, 30, 30, 0.12)
Portrait caption:         rgba(239, 217, 182, 0.28)
```

---

## TYPOGRAPHY REFERENCE

| Element | Font | Weight | Size | Tracking |
|---|---|---|---|---|
| Section label "About" | Courier New | 400 | 9px | 0.2em |
| Name "SARATH MENON" | Cormorant Garamond | 600 | clamp(52px, 7vw, 88px) | -0.02em |
| Bio text | Cormorant Garamond | 300 | clamp(15px, 1.6vw, 18px) | 0 |
| Full story link | Courier New | 400 | 9px | 0.18em |
| Portrait caption | Courier New | 400 | 7px | 0.12em |

---

## COMPONENT STRUCTURE

```
<AboutTeaser>
  ├── section wrapper (crimson bg, data-nav-theme="dark")
  ├── text column (left, 65% width on desktop)
  │   ├── section label "About"
  │   ├── name "SARATH / MENON" (animated chars)
  │   ├── divider rule
  │   ├── bio text (animated lines)
  │   └── "Full story →" link
  └── portrait column (absolute, top-right on desktop)
      ├── portrait image (B&W, 3:4, grayscale filter)
      ├── crimson tint overlay (::after pseudo)
      └── portrait caption
```

---

## WHAT NOT TO DO

- Do not add a dark overlay or gradient over the crimson background — the crimson IS the background, it needs no modification
- Do not use `#9e0000` anywhere — the correct crimson is `#8B1E1E` throughout
- Do not put the name on one line — "SARATH" and "MENON" are always two separate lines
- Do not use full opacity on the bio text — `rgba(239, 217, 182, 0.72)` is intentional, full opacity `#EFD9B6` is reserved for the name only
- Do not add hover effects to the portrait
- Do not make the portrait large — it is deliberately small, an aside not a hero
- Do not add any border, shadow, or frame around the portrait
- Do not start animations before ScrollTrigger fires — no animations on mount
- Do not add `data-nav-theme="light"` — this is a dark/crimson section

---

## ACCEPTANCE CRITERIA

The section is complete when:

1. Crimson `#8B1E1E` background fills the section
2. "SARATH" and "MENON" in two lines, Cormorant Garamond 600, parchment `#EFD9B6`
3. Bio text in Cormorant 300, muted parchment, correct max-width
4. "Full story →" link routes to `/about`
5. Portrait anchored absolute top-right on desktop, black and white, 3:4 aspect ratio
6. Portrait has crimson tint overlay via `::after` pseudo-element
7. On scroll enter: name characters animate in, bio lines slide up, portrait scales in
8. `data-nav-theme="dark"` on section wrapper — nav inverts to parchment on this section
9. Mobile: portrait moves above name, stacks vertically, all animations still fire
10. Global `.paper` grain texture sits correctly over section via fixed layer
11. "Full story →" opacity drops to 0.6 on hover
12. Sanity fields wired for portrait image and bio text
