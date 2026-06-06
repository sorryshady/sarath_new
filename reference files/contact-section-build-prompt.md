# Contact Section — AI Build Prompt
## Project: Sarath Menon Portfolio (sarathmenon.com)

---

## CONTEXT

You are building the Contact section of a photographer/filmmaker portfolio. This is the last section on the home page. It doubles as the footer — there is no separate footer component. The tech stack is **React + TypeScript + Tailwind CSS + GSAP + ScrollTrigger**. All other sections are already built. Read this prompt fully before writing any code.

This section must feel bold, playful, and full of character. It is the exclamation mark at the end of the page. The animations are not subtle — they are intentional and theatrical. The section also serves as the page footer, closing with a minimal colophon strip.

---

## VISUAL DESIGN

### Background
- `background: #EDE4D3` — aged parchment. Warmer and darker than the standard cream `#F9F6F0`. Like paper that has been written on, carried around, lived in.
- `data-nav-theme="light"` on section wrapper
- `position: relative`, `overflow: hidden`
- `padding: 80px 64px 0` on desktop, `64px 32px 0` on tablet, `56px 24px 0` on mobile

### Ink bleed overlays
Two large radial gradient blobs sit behind the content, simulating ink bleeding through heavy paper. They are decorative only — `pointer-events: none`, `z-index: 0`.

```tsx
{/* Ink bleed 1 — top right, dark ink */}
<div style={{
  position: 'absolute',
  top: '-60px',
  right: '-80px',
  width: '360px',
  height: '360px',
  background: 'radial-gradient(circle, rgba(17,17,17,0.07) 0%, transparent 68%)',
  borderRadius: '50%',
  pointerEvents: 'none',
  transform: 'scale(0)',  // starts at 0 — animated on scroll enter
}} ref={inkBleed1Ref} />

{/* Ink bleed 2 — bottom left, crimson ink */}
<div style={{
  position: 'absolute',
  bottom: '-40px',
  left: '20px',
  width: '240px',
  height: '240px',
  background: 'radial-gradient(circle, rgba(139,30,30,0.07) 0%, transparent 70%)',
  borderRadius: '50%',
  pointerEvents: 'none',
  transform: 'scale(0)',  // starts at 0 — animated on scroll enter
}} ref={inkBleed2Ref} />
```

---

## THE HEADLINE

```
LET'S
MAKE
SOMETHING.
```

Three lines. Each word on its own line. Full-width stacking.

```tsx
<div ref={headlineRef} style={{ marginBottom: '56px', position: 'relative', zIndex: 2 }}>
  {[
    { word: "LET'S", color: '#111111' },
    { word: 'MAKE', color: '#8B1E1E' },      // the only crimson word
    { word: 'SOMETHING.', color: '#111111' },
  ].map(({ word, color }, i) => (
    <div
      key={i}
      className="headline-word-wrapper"
      style={{ overflow: 'hidden' }}
    >
      <div
        className={`headline-word headline-word-${i}`}
        style={{
          fontFamily: "'Anton', sans-serif",
          fontSize: 'clamp(52px, 9vw, 120px)',
          color,
          lineHeight: 0.9,
          letterSpacing: '-0.01em',
          display: 'block',
          transform: 'translateY(-110%)',  // starts above, drops in
        }}
      >
        {word}
      </div>
    </div>
  ))}
</div>
```

**Why Anton:** This is the same font as the hero name. Using it here creates a bookend — the site opens with SARATH MENON in Anton, it closes with LET'S MAKE SOMETHING. in Anton. Structural rhyme.

**Why "MAKE" is crimson:** It's the verb. The action word. The most important word in the sentence. Crimson on aged parchment reads like a stamp or a seal — authoritative and warm simultaneously.

---

## CONTACT DETAILS GRID

Below the headline, a two-row layout of contact items. Each item is a magnetic element on desktop.

```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '32px 48px',
  marginBottom: '48px',
  position: 'relative',
  zIndex: 2,
}}>
  {/* Email */}
  <div ref={el => magneticRefs.current[0] = el} className="magnetic-item">
    <div style={{
      fontFamily: "'Courier New', monospace",
      fontSize: '8px',
      color: 'rgba(17,17,17,0.4)',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      marginBottom: '6px',
    }}>Email</div>
    <a href="mailto:sarath@email.com" style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '18px',
      fontWeight: 600,
      color: '#111',
      textDecoration: 'none',
      display: 'block',
      transition: 'color 0.2s ease',
    }}>
      sarath@email.com
    </a>
  </div>

  {/* Phone */}
  <div ref={el => magneticRefs.current[1] = el} className="magnetic-item">
    <div style={{
      fontFamily: "'Courier New', monospace",
      fontSize: '8px',
      color: 'rgba(17,17,17,0.4)',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      marginBottom: '6px',
    }}>Phone</div>
    <a href="tel:+447XXXXXXXXX" style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '18px',
      fontWeight: 600,
      color: '#111',
      textDecoration: 'none',
      display: 'block',
    }}>
      +44 7XXX XXXXXX
    </a>
  </div>

  {/* Location */}
  <div ref={el => magneticRefs.current[2] = el} className="magnetic-item">
    <div style={{
      fontFamily: "'Courier New', monospace",
      fontSize: '8px',
      color: 'rgba(17,17,17,0.4)',
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      marginBottom: '6px',
    }}>Based in</div>
    <div style={{
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: '18px',
      fontWeight: 600,
      color: '#111',
    }}>
      London, UK
    </div>
  </div>
</div>
```

### Social links row
Below the contact grid, a horizontal row of social links:

```tsx
<div style={{
  display: 'flex',
  gap: '28px',
  flexWrap: 'wrap',
  marginBottom: '64px',
  position: 'relative',
  zIndex: 2,
}}>
  {[
    { label: 'Instagram', url: 'https://instagram.com/sarathmenon' },
    { label: 'Vimeo', url: 'https://vimeo.com/sarathmenon' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/sarathmenon' },
  ].map(({ label, url }, i) => (
    <a
      key={i}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      ref={el => magneticRefs.current[3 + i] = el}
      className="magnetic-item social-link"
      style={{
        fontFamily: "'Courier New', monospace",
        fontSize: '10px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'rgba(17,17,17,0.55)',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        transition: 'color 0.2s ease',
      }}
    >
      <span>{label}</span>
      <span style={{
        display: 'inline-block',
        transition: 'transform 0.2s ease',
        className: 'social-arrow',
      }}>↗</span>
    </a>
  ))}
</div>
```

On hover over social links: color shifts to `#111`, the `↗` arrow nudges `2px` right and `2px` up via `transform: translate(2px, -2px)`.

---

## GSAP ANIMATIONS

### Beat 1 — Headline word drop (scroll triggered)

Each word drops from above with an overshoot bounce. "MAKE" (the crimson word) gets a more pronounced bounce — it lands harder than the others.

```typescript
gsap.fromTo('.headline-word-0',
  { y: '-110%' },
  {
    y: '0%',
    duration: 0.7,
    ease: 'back.out(1.4)',
    scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
  }
);

gsap.fromTo('.headline-word-1',  // "MAKE" — crimson, harder bounce
  { y: '-110%' },
  {
    y: '0%',
    duration: 0.75,
    ease: 'back.out(2.2)',  // more pronounced overshoot
    delay: 0.1,
    scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
  }
);

gsap.fromTo('.headline-word-2',  // "SOMETHING."
  { y: '-110%' },
  {
    y: '0%',
    duration: 0.7,
    ease: 'back.out(1.4)',
    delay: 0.18,
    scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
  }
);
```

Each `.headline-word-wrapper` has `overflow: hidden` so words are clipped during their approach.

### Beat 2 — Ink bleeds spread

```typescript
gsap.to(inkBleed1Ref.current, {
  scale: 1,
  duration: 1.4,
  ease: 'power2.out',
  delay: 0.3,
  scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
});

gsap.to(inkBleed2Ref.current, {
  scale: 1,
  duration: 1.2,
  ease: 'power2.out',
  delay: 0.5,
  scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
});
```

The ink bleeds spread outward from their origin points as if ink is soaking into paper. The crimson bleed is slightly slower — it spreads more reluctantly.

### Beat 3 — Contact details stagger in

```typescript
gsap.fromTo('.magnetic-item',
  { opacity: 0, y: 20 },
  {
    opacity: 1,
    y: 0,
    duration: 0.55,
    ease: 'power2.out',
    stagger: 0.08,
    delay: 0.4,
    scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
  }
);
```

---

## MAGNETIC CURSOR EFFECT (desktop only)

The magnetic effect applies to all `.magnetic-item` elements: the three contact details and the three social links. On desktop (`> 768px`) only.

```typescript
const setupMagneticEffect = () => {
  if (window.innerWidth < 768) return;

  const MAGNETIC_STRENGTH = 0.35;  // 35% of cursor distance — medium pull
  const MAGNETIC_RADIUS = 80;      // pixels — activation radius

  magneticRefs.current.forEach((el) => {
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const distX = e.clientX - centerX;
      const distY = e.clientY - centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);

      if (distance < MAGNETIC_RADIUS) {
        const pullX = distX * MAGNETIC_STRENGTH;
        const pullY = distY * MAGNETIC_STRENGTH;

        gsap.to(el, {
          x: pullX,
          y: pullY,
          duration: 0.4,
          ease: 'power2.out',
        });
      } else {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',  // snaps back with a slight elastic rebound
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup stored per element
    (el as any)._magneticCleanup = () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });
};

// In useEffect:
useEffect(() => {
  setupMagneticEffect();
  return () => {
    magneticRefs.current.forEach(el => {
      if (el && (el as any)._magneticCleanup) {
        (el as any)._magneticCleanup();
      }
    });
  };
}, []);
```

**Why `MAGNETIC_STRENGTH = 0.35`:** At 0.35, a cursor 40px from the element centre pulls it approximately 14px — firmly in the medium range. Noticeable and satisfying without being distracting.

**Why `elastic.out` on the return:** When the cursor leaves the magnetic field, the element snaps back but with a slight elastic rebound — like a rubber band releasing. This is the playfulness. A straight ease-out return would feel mechanical. The elastic return feels alive.

---

## THE COLOPHON STRIP

At the very bottom of the section — the functional footer. Minimal, almost invisible.

```tsx
<div style={{
  borderTop: '0.5px solid rgba(17,17,17,0.1)',
  padding: '20px 0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '8px',
  position: 'relative',
  zIndex: 2,
}}>
  <span style={{
    fontFamily: "'Courier New', monospace",
    fontSize: '8px',
    color: 'rgba(17,17,17,0.25)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  }}>
    © {new Date().getFullYear()} Sarath Menon
  </span>

  <span style={{
    fontFamily: "'Courier New', monospace",
    fontSize: '8px',
    color: 'rgba(17,17,17,0.18)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  }}>
    London
  </span>
</div>
```

The copyright year is dynamic — `new Date().getFullYear()`. No nav links. No sitemap. No cookie policy banner. Just a timestamp and a place.

---

## MOBILE BEHAVIOUR

On viewports narrower than `768px`:

- Magnetic effect disabled entirely — no touch equivalent needed
- Headline font size: `clamp(52px, 14vw, 80px)` — stays impactful on small screens
- Contact grid: single column, each item full width
- Social links: wrap naturally, `gap: 20px`
- Ink bleeds: visible but reduced — `width: 200px, height: 200px` on bleed 1, `width: 140px, height: 140px` on bleed 2
- Colophon strip: stacks vertically, `flex-direction: column`, `text-align: center`
- Padding: `56px 24px 0`

---

## SANITY CMS FIELDS

```typescript
interface ContactSection {
  email: string;
  phone: string;
  location: string;
  instagramUrl: string;
  vimeoUrl: string;
  linkedinUrl: string;
  // Headline is hardcoded — "LET'S MAKE SOMETHING." does not change
}
```

---

## COLOUR TOKEN REFERENCE

```
Section background:          #EDE4D3  (aged parchment)
Headline word 1 "LET'S":     #111111
Headline word 2 "MAKE":      #8B1E1E  (crimson — the only coloured word)
Headline word 3 "SOMETHING." #111111
Contact label text:          rgba(17, 17, 17, 0.40)
Contact value text:          #111111
Social links default:        rgba(17, 17, 17, 0.55)
Social links hover:          #111111
Ink bleed 1 (dark):          rgba(17, 17, 17, 0.07)
Ink bleed 2 (crimson):       rgba(139, 30, 30, 0.07)
Colophon text:               rgba(17, 17, 17, 0.25)
Colophon location:           rgba(17, 17, 17, 0.18)
Section rule:                rgba(17, 17, 17, 0.10)
```

---

## TYPOGRAPHY REFERENCE

| Element | Font | Weight | Size | Tracking |
|---|---|---|---|---|
| "LET'S" | Anton | — | clamp(52px, 9vw, 120px) | -0.01em |
| "MAKE" | Anton | — | clamp(52px, 9vw, 120px) | -0.01em |
| "SOMETHING." | Anton | — | clamp(52px, 9vw, 120px) | -0.01em |
| Contact label | Courier New | 400 | 8px | 0.16em |
| Contact value | Cormorant Garamond | 600 | 18px | 0 |
| Social links | Courier New | 400 | 10px | 0.14em |
| Colophon | Courier New | 400 | 8px | 0.12em |

---

## WHAT NOT TO DO

- Do not use `#F9F6F0` for the background — use `#EDE4D3`, the aged parchment tone
- Do not make all three headline words the same colour — only "MAKE" is crimson `#8B1E1E`
- Do not apply the magnetic effect on mobile — touch devices have no cursor
- Do not use a standard ease on the magnetic return — use `elastic.out(1, 0.4)` for the rebound
- Do not add a nav, sitemap, or links list to the colophon — this is not a traditional footer
- Do not animate the ink bleeds with opacity — animate with `scale` from 0 to 1
- Do not add any images to this section
- Do not add rounded corners to anything in this section
- Do not use `text-decoration: underline` on links — no underlines anywhere
- Do not forget to clean up the `mousemove` event listeners on component unmount

---

## ACCEPTANCE CRITERIA

1. Background is aged parchment `#EDE4D3` — noticeably warmer and darker than cream
2. Two ink bleed radial gradients: one dark top-right, one crimson bottom-left
3. Headline: "LET'S" black, "MAKE" crimson `#8B1E1E`, "SOMETHING." black — Anton font, full-width stacking
4. On scroll enter — Beat 1: each word drops from above with overshoot bounce, "MAKE" bounces harder (`back.out(2.2)`)
5. On scroll enter — Beat 2: ink bleeds scale from 0 to 1 at different delays, spreading like ink on paper
6. On scroll enter — Beat 3: contact items stagger in with `opacity` + `y` reveal
7. Desktop: magnetic cursor pull on all contact items and social links, strength 12-15px at close range
8. Magnetic return uses `elastic.out(1, 0.4)` — snaps back with a slight rebound
9. Email links to `mailto:`, phone links to `tel:`
10. Social links: Instagram ↗ / Vimeo ↗ / LinkedIn ↗, open in new tab, arrow nudges on hover
11. Colophon strip: copyright year (dynamic) left, "London" right, near-invisible opacity
12. Mobile: magnetic disabled, single column contact grid, headline stays impactful
13. `data-nav-theme="light"` on section wrapper
14. Event listeners cleaned up on unmount
