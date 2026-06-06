# Poetry Section (Home CTA) + /poetry Page — AI Build Prompt
## Project: Sarath Menon Portfolio (sarathmenon.com)

---

## CONTEXT

You are building two related components:

1. **The Poetry CTA section** — a home page section that teases Sarath's poetry and routes to `/poetry`
2. **The /poetry page** — a full poetry anthology with a pinned image left panel and scrolling poem content on the right

The tech stack is **React + TypeScript + Tailwind CSS + GSAP + ScrollTrigger**. All other sections (preloader, hero, navbar, photography, about teaser, films) are already built. Read this prompt fully before writing any code.

---

## PART 1 — HOME PAGE POETRY CTA SECTION

### Concept
This section has one job: make the visitor want to read the poems. It does this by showing a single striking excerpt from one of Sarath's strongest poems — large, full-width, italic Cormorant — with each line revealed one at a time using a theatrical mask animation as the section enters the viewport. No image. Just words on warm paper.

### Background
- `background: #F9F6F0` (warm cream — same as photography section)
- `padding: 80px 64px` on desktop, `64px 32px` on tablet, `56px 24px` on mobile
- `position: relative`, `overflow: hidden`
- `data-nav-theme="light"` on section wrapper

### Section label
- Top-left
- `font-family: 'Courier New', monospace`
- `font-size: 9px`, `letter-spacing: 0.2em`, `text-transform: uppercase`
- `color: rgba(17, 17, 17, 0.35)`
- Text: `Poetry`
- `margin-bottom: 48px`

### The verse excerpt — hero element
```tsx
<div
  ref={verseRef}
  style={{
    maxWidth: '680px',
    marginBottom: '48px',
  }}
>
  {/* Each line is individually wrapped for mask animation */}
  {excerptLines.map((line, i) => (
    <div
      key={i}
      className="verse-line-wrapper"
      style={{ overflow: 'hidden', lineHeight: 1.4 }}
    >
      <div
        className="verse-line"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(26px, 3.2vw, 42px)',
          color: '#111',
          letterSpacing: '-0.01em',
          transform: 'translateY(100%)', // starts hidden below clip
        }}
      >
        {line}
      </div>
    </div>
  ))}
</div>
```

Each `.verse-line-wrapper` has `overflow: hidden`. Each `.verse-line` starts at `translateY(100%)` — fully below its clip container, invisible. The GSAP animation slides each line upward into view. This is a mask reveal, not a fade.

### Placeholder excerpt (replace with Sarath's actual poem via Sanity)
```
"Some frames are held
longer than others —
not by the shutter,
but by what refuses
to leave the eye."
```

### Attribution row
Below the verse:
```tsx
<div ref={attributionRef} style={{ opacity: 0 }}>
  <div style={{
    fontFamily: "'Courier New', monospace",
    fontSize: '9px',
    letterSpacing: '0.14em',
    color: 'rgba(17,17,17,0.4)',
    textTransform: 'uppercase',
    marginBottom: '4px',
  }}>
    From "{poemTitle}"
  </div>
  <div style={{
    fontFamily: "'Courier New', monospace",
    fontSize: '9px',
    letterSpacing: '0.14em',
    color: 'rgba(17,17,17,0.25)',
    textTransform: 'uppercase',
  }}>
    Sarath Menon · {poemYear}
  </div>
</div>
```

### Bottom row — attribution + CTA
```tsx
<div style={{
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  marginTop: '32px',
  flexWrap: 'wrap',
  gap: '16px',
}}>
  <div ref={attributionRef} style={{ opacity: 0 }}>
    {/* poem title and year as above */}
  </div>

  <a
    ref={ctaRef}
    href="/poetry"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
      opacity: 0,
    }}
  >
    <span style={{
      fontFamily: "'Courier New', monospace",
      fontSize: '9px',
      letterSpacing: '0.16em',
      color: '#8B1E1E',
      textTransform: 'uppercase',
    }}>Read all poems</span>
    <span
      className="cta-arrow"
      style={{
        fontFamily: "'Courier New', monospace",
        fontSize: '9px',
        color: '#8B1E1E',
        display: 'inline-block',
        transition: 'transform 0.2s ease',
      }}
    >→</span>
  </a>
</div>
```

On hover over the CTA link: the arrow nudges `4px` right. `transform: translateX(4px)`. No underline.

### Ghost watermark
```tsx
<div style={{
  position: 'absolute',
  bottom: '-20px',
  right: '40px',
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 'clamp(100px, 14vw, 180px)',
  fontWeight: 600,
  color: 'rgba(17,17,17,0.03)',
  lineHeight: 1,
  pointerEvents: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap',
}}>
  Poetry
</div>
```

---

## HOME CTA — GSAP ANIMATION

### Line mask reveal
```typescript
gsap.fromTo('.verse-line',
  { y: '100%' },
  {
    y: '0%',
    duration: 0.7,
    ease: 'power3.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top 70%',
    },
  }
);
```

This is not `opacity`. It is `y: '100%'` to `y: '0%'` with `overflow: hidden` on the parent. Each line slides up from behind its clip container. The effect reads as words being spoken one line at a time. No opacity change anywhere on the verse lines.

### Attribution + CTA fade in
```typescript
// After lines complete
gsap.to(attributionRef.current, {
  opacity: 1,
  duration: 0.5,
  ease: 'power2.out',
  delay: 0.8,  // after all lines have revealed
  scrollTrigger: {
    trigger: sectionRef.current,
    start: 'top 70%',
  },
});

gsap.to(ctaRef.current, {
  opacity: 1,
  duration: 0.5,
  ease: 'power2.out',
  delay: 1.0,
  scrollTrigger: {
    trigger: sectionRef.current,
    start: 'top 70%',
  },
});
```

---

## HOME CTA — SANITY CMS FIELDS

```typescript
interface PoetryTeaser {
  excerptLines: string[];    // array of lines for the mask reveal
  poemTitle: string;         // e.g. "The Held Frame"
  poemYear: string;          // e.g. "2023"
  // The actual full poem lives in the poems collection
}
```

---

## HOME CTA — WHAT NOT TO DO

- Do not use `opacity` on the verse lines — use `translateY` with `overflow: hidden` on parent
- Do not animate the ghost watermark — it is static, always at `opacity: 0.03`
- Do not add any images to this section — words only
- Do not add `data-nav-theme="dark"` — this is a light section

---

## HOME CTA — ACCEPTANCE CRITERIA

1. Warm cream `#F9F6F0` background
2. `Poetry` label top-left in Courier monospace
3. Verse excerpt in large Cormorant italic, `clamp(26px, 3.2vw, 42px)`
4. On scroll enter: each line slides up from clip one at a time, stagger 0.12s
5. Attribution fades in after all lines revealed
6. "Read all poems →" fades in last, arrow nudges right on hover
7. Ghost "Poetry" watermark at near-zero opacity bottom-right
8. Routes to `/poetry` on click
9. `data-nav-theme="light"` on section wrapper

---
---

## PART 2 — THE /POETRY PAGE

### Concept
A two-column layout. Left column: a sticky image panel that stays fixed as the user scrolls. Right column: poem content scrolls naturally. When the user scrolls past one poem into the next, the next poem's image slides up from the bottom of the left panel, covering the previous image. Scrolling back reverses the direction — the image retreats downward. The left panel is a slow cinema screen, changing with each poem.

### Page background
- `background: #F9F6F0`
- No pinning — the page scrolls naturally
- The Ghost Bar nav handles navigation back to home. No separate back button needed.
- `data-nav-theme="light"` — nav stays in light mode throughout

### Page header
```tsx
<div style={{
  padding: '80px 64px 40px',
  borderBottom: '0.5px solid rgba(17,17,17,0.08)',
}}>
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: '12px',
  }}>
    <div>
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: '9px',
        letterSpacing: '0.2em',
        color: 'rgba(17,17,17,0.4)',
        textTransform: 'uppercase',
        marginBottom: '8px',
      }}>Selected Verse</div>
      <div style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(36px, 5vw, 56px)',
        fontWeight: 600,
        color: '#111',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>Poetry</div>
    </div>
    <div style={{
      fontFamily: "'Courier New', monospace",
      fontSize: '9px',
      color: 'rgba(17,17,17,0.35)',
      letterSpacing: '0.14em',
      alignSelf: 'flex-end',
    }}>
      {poems.length} Poems · 2019–2024
    </div>
  </div>
</div>
```

---

## TWO-COLUMN LAYOUT STRUCTURE

```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  minHeight: '100vh',
}}>
  {/* LEFT — sticky image panel */}
  <div style={{
    position: 'sticky',
    top: 0,
    height: '100vh',
    borderRight: '0.5px solid rgba(17,17,17,0.08)',
    overflow: 'hidden',   // CRITICAL — clips images sliding in/out
  }}>
    {/* All poem images stacked */}
    {poems.map((poem, i) => (
      <div
        key={poem.slug}
        ref={el => imageRefs.current[i] = el}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: i + 1,
          transform: i === 0 ? 'translateY(0%)' : 'translateY(100%)',
          willChange: 'transform',
        }}
      >
        <img
          src={poem.image}
          alt={poem.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'grayscale(15%) contrast(1.05)',  // subtle treatment
          }}
        />
        {/* Dark overlay for text legibility */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)',
        }} />
        {/* Poem counter */}
        <div style={{
          position: 'absolute',
          top: '28px',
          left: '28px',
          fontFamily: "'Courier New', monospace",
          fontSize: '9px',
          letterSpacing: '0.14em',
          color: 'rgba(249,246,240,0.5)',
          textTransform: 'uppercase',
        }}>
          {String(i + 1).padStart(2, '0')} / {String(poems.length).padStart(2, '0')}
        </div>
        {/* Image caption bottom */}
        {poem.imageCaption && (
          <div style={{
            position: 'absolute',
            bottom: '28px',
            left: '28px',
            fontFamily: "'Courier New', monospace",
            fontSize: '8px',
            letterSpacing: '0.12em',
            color: 'rgba(249,246,240,0.35)',
            textTransform: 'uppercase',
          }}>
            {poem.imageCaption}
          </div>
        )}
      </div>
    ))}
  </div>

  {/* RIGHT — scrolling poem content */}
  <div>
    {poems.map((poem, i) => (
      <div
        key={poem.slug}
        ref={el => poemRefs.current[i] = el}
        style={{
          padding: '64px 56px',
          minHeight: '100vh',
          borderBottom: i < poems.length - 1
            ? '0.5px solid rgba(17,17,17,0.08)'
            : 'none',
        }}
      >
        {/* Poem title */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(24px, 2.8vw, 36px)',
            fontWeight: 600,
            color: '#111',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            marginBottom: '8px',
          }}>
            {poem.title}
          </div>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '9px',
            color: 'rgba(17,17,17,0.4)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}>
            {poem.year}
          </div>
        </div>

        {/* Poem body */}
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(17px, 1.8vw, 21px)',
          fontWeight: 300,
          color: '#2a2a2a',
          lineHeight: 2.1,
          letterSpacing: '0.01em',
          whiteSpace: 'pre-line',   // preserves poem line breaks
        }}>
          {poem.body}
        </div>

        {/* End of poem — next poem hint */}
        {i < poems.length - 1 && (
          <div style={{
            marginTop: '64px',
            paddingTop: '28px',
            borderTop: '0.5px solid rgba(17,17,17,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '24px',
              height: '0.5px',
              background: 'rgba(17,17,17,0.2)',
            }} />
            <div style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '9px',
              color: 'rgba(17,17,17,0.35)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}>
              {poems[i + 1].title} ↓
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
</div>
```

---

## IMAGE TRANSITION — SCROLL-LINKED MECHANICS

This is the most important part of the `/poetry` page. Read carefully.

### The core principle
All images are absolutely positioned inside the sticky panel, stacked in z-index order. Image 1 starts at `translateY(0%)` — fully visible. Images 2 through N start at `translateY(100%)` — fully below the panel, invisible. As the user scrolls into poem 2, image 2 slides up from `translateY(100%)` to `translateY(0%)`, covering image 1. Image 1 never moves. Only the incoming image animates.

On reverse scroll: image 2 slides back down to `translateY(100%)`, revealing image 1 underneath.

### ScrollTrigger setup per poem
```typescript
useEffect(() => {
  poems.forEach((poem, i) => {
    if (i === 0) return; // first poem image starts visible, no trigger needed

    const imageEl = imageRefs.current[i];
    const poemEl = poemRefs.current[i];
    if (!imageEl || !poemEl) return;

    gsap.to(imageEl, {
      y: '0%',
      ease: 'none',  // linear — directly scroll-linked
      scrollTrigger: {
        trigger: poemEl,
        start: 'top bottom',  // when poem top hits viewport bottom
        end: 'top top',       // when poem top hits viewport top
        scrub: 1,             // smooth, slightly lagged
      },
    });
  });

  return () => ScrollTrigger.getAll().forEach(t => t.kill());
}, [poems]);
```

### Why `ease: 'none'` and `scrub: 1`
`ease: 'none'` makes the image position directly proportional to scroll position — it moves at scroll speed. `scrub: 1` adds a 1-second lag so it feels like the image has weight rather than snapping. Together they produce the sensation of pulling a physical photograph up into a frame.

### Why only the incoming image moves
The outgoing image (the previous poem's image) has no ScrollTrigger on it. It sits at `translateY(0%)` permanently until a subsequent image covers it. This is correct. When scrolling back up past poem 2's trigger, GSAP's scrub automatically reverses — image 2 returns to `translateY(100%)` — and image 1 is revealed underneath, unchanged. No special reverse handling needed. ScrollTrigger handles it automatically.

### z-index stack
Image 1: `z-index: 1`
Image 2: `z-index: 2`
Image 3: `z-index: 3`
...and so on.

Each new image sits on top of all previous ones. This is correct — the newest poem's image always covers all previous ones when fully revealed.

---

## MOBILE BEHAVIOUR

On viewports narrower than `768px`:

- Two-column layout collapses to single column
- Image sits above the poem, full width, `aspect-ratio: 3/2`, not sticky
- Image does not animate on scroll — static, changes per poem
- Use IntersectionObserver to detect which poem is in view and crossfade to that poem's image: `opacity: 0 → 1` on the new image, `opacity: 1 → 0` on the old, duration 0.4s
- Poem title, year, and body all in one vertical column
- No image counter overlay on mobile — too small
- Padding: `32px 24px` per poem block

---

## TYPOGRAPHY — /POETRY PAGE

| Element | Font | Weight | Size | Detail |
|---|---|---|---|---|
| Page heading "Poetry" | Cormorant Garamond | 600 | clamp(36px, 5vw, 56px) | letter-spacing -0.02em |
| Page sub-label | Courier New | 400 | 9px | letter-spacing 0.2em |
| Poem count header right | Courier New | 400 | 9px | letter-spacing 0.14em |
| Poem title | Cormorant Garamond | 600 | clamp(24px, 2.8vw, 36px) | letter-spacing -0.01em |
| Poem year | Courier New | 400 | 9px | letter-spacing 0.14em |
| Poem body | Cormorant Garamond | 300 | clamp(17px, 1.8vw, 21px) | line-height 2.1 |
| End of poem hint | Courier New | 400 | 9px | letter-spacing 0.14em |
| Image counter | Courier New | 400 | 9px | letter-spacing 0.14em |
| Image caption | Courier New | 400 | 8px | letter-spacing 0.12em |

---

## SANITY CMS FIELDS — /POETRY PAGE

```typescript
interface Poem {
  title: string;           // e.g. "The Held Frame"
  slug: string;            // e.g. "the-held-frame"
  body: string;            // full poem text, line breaks preserved
  year: string;            // e.g. "2023"
  image: string;           // Sanity image asset URL
  imageCaption: string;    // e.g. "Kashmir · 2022"
  order: number;           // controls display order on the page
  featured: boolean;       // if true, eligible for home page teaser
}
```

Poems are ordered by `order` field. All poems appear on the `/poetry` page regardless of `featured` status. The `featured` flag is only used to determine which poem's excerpt appears on the home page CTA section.

---

## COLOUR TOKEN REFERENCE

```
Page background:          #F9F6F0
Page heading:             #111111
Poem title:               #111111
Poem body:                #2a2a2a  (slightly softer than full black for long reading)
Meta / labels:            rgba(17, 17, 17, 0.40)
Dividers:                 rgba(17, 17, 17, 0.08)
Image overlay gradient:   rgba(0,0,0,0.4) to transparent
Image counter:            rgba(249, 246, 240, 0.50)
Image caption:            rgba(249, 246, 240, 0.35)
CTA arrow:                #8B1E1E
Ghost watermark:          rgba(17, 17, 17, 0.03)
```

---

## WHAT NOT TO DO

- Do not use `position: fixed` for the left image panel — use `position: sticky, top: 0, height: 100vh`
- Do not animate the outgoing image — only the incoming image moves
- Do not use `opacity` for the image transitions on desktop — use `translateY` only
- Do not forget `overflow: hidden` on the sticky left panel — without it images will be visible outside the panel during the slide
- Do not use `ease` other than `none` on the image ScrollTrigger — the movement must be directly proportional to scroll
- Do not add a separate back button — the Ghost Bar nav handles navigation
- Do not use `position: absolute` for the left panel — it will not stick correctly
- Do not forget `white-space: pre-line` on the poem body — it preserves intentional line breaks from Sanity
- Do not set `will-change: transform` permanently on image elements — set it before animation begins and remove it after

---

## ACCEPTANCE CRITERIA — HOME CTA

1. Cream `#F9F6F0` background
2. "Poetry" label top-left, Courier monospace
3. Verse excerpt in large Cormorant italic with mask reveal line by line on scroll enter
4. Each line slides up from clip, stagger 0.12s, `ease: power3.out`
5. Attribution fades in after lines complete
6. "Read all poems →" fades in last, arrow nudges right on hover
7. Ghost watermark at bottom-right, near-invisible
8. Routes to `/poetry`
9. `data-nav-theme="light"`

---

## ACCEPTANCE CRITERIA — /POETRY PAGE

1. Page header with "Poetry" heading and poem count
2. Two-column layout: sticky image left, scrolling poems right
3. First poem visible on load with image in place, no animation needed
4. Scrolling into poem 2: image 2 slides up from below, covering image 1, scroll-linked
5. Scrolling back up: image 2 retreats downward, image 1 revealed underneath
6. Direction is always correct — new image comes from below on forward scroll, retreats below on reverse
7. Each image has a poem counter (01/12) top-left and optional caption bottom-left
8. Poem title sits above poem body on the right column
9. Poem year in Courier monospace below the title
10. Poem body in Cormorant 300, `line-height: 2.1`, `white-space: pre-line`
11. End-of-poem divider with next poem title hint
12. Mobile: stacked layout, image above poem, crossfade transition via IntersectionObserver
13. Ghost Bar nav in light mode throughout the page
14. All poems sourced from Sanity, ordered by `order` field
15. Poem count in page header is dynamic
