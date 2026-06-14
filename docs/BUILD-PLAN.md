# Sarath Menon — Cinematic Build Plan

> Outcome of a full design interview (grill-me). Every decision below is **locked**
> unless explicitly reopened. This is the contract the increments build against.
>
> **North star:** the whole site is *looking through a lens*. The Hero opens with a
> crimson camera aperture; the experience travels through three crafts; About turns
> the lens on the operator; Contact closes the shutter. Vocabulary throughout:
> **aperture, letterbox, grain, develop, rack-focus, slate** — camera & darkroom.

---

## 1. Architecture — Hybrid (teaser → page)

The **home** is a vertical scroll of cinematic, full-viewport teaser panels. The three
**crafts** are dedicated routes reached via a shutter transition. **About** and
**Contact** are home sections, not pages.

**Home order:**

```
Hero → Films → Photography → Poetry → About → Contact
```

- **Films / Photography / Poetry** — teaser panel on home → real route (`/films`,
  `/photography`, `/poetry`) via the crimson shutter.
- **About** — rich full-viewport home section, no page.
- **Contact** — closing home section (the "fin"), no page.

Film leads because it is the headline craft (LFS graduate). Order arc: **motion →
stills → words → the person → the invitation**.

---

## 2. Page transition — the crimson shutter (the heartbeat)

One **common** transition for all route navigation. **No shared-element morphs** (the
previous attempt failed; matching DOM across dissimilar pages is the hassle we are
deliberately avoiding). A single full-screen overlay panel — bulletproof.

**Entering a craft page (ceremony):**

1. The clicked label (teaser title or nav item) **nudges up** slightly — a whisper of
   continuity, no fragile shared element.
2. A **crimson panel wipes down** to cover the screen.
3. The **slate** holds (~550ms): destination name in display type, optional hairline
   rule / index number — a film slate / chapter card.
4. The panel **slides off the top** to reveal the new page.

**Back navigation (speed):** faster (~300ms), **no slate**, panel slides off the
**bottom** for spatial logic. Asymmetry is intentional — depth-in feels ceremonial,
back-out feels quick.

> The shutter is reserved for **navigation only**. Watching a film uses a different
> reveal (see Films). About/Contact are same-page scrolls — no shutter.

---

## 3. Home panels — each a unique signature

Full-viewport, each themed to its craft and each with a **distinct** scroll-in move.
No repeated reveal — every panel announces a different world.

| Panel | Background | Signature scroll-in | Content source |
|---|---|---|---|
| **Films** | cinema-dark | **Letterbox crush** — bars close the frame to 2.39:1; featured-film still pushes in (Ken Burns); auto-crossfades 3–4 featured films; credit-style caption (`DIR. SARATH MENON · 2024`) | featured `film` (thumbnails) |
| **Photography** | cream | **Develop** — cover rises out of near-black high-contrast grain; exposure/clarity climb until the frame resolves; title + frame count fade up | featured `photoSeries` |
| **Poetry** | cream/paper | **Settle onto paper** — lines of verse rise and ink in one after another (Oaksun line-reveal); poem title + year | `poetryTeaser` (excerptLines + linkedPoem) |
| **About** | crimson | **Rack-focus portrait** — portrait starts defocused, pulls sharp as you scroll; bio + identity meta resolve beside it | `aboutTeaser` + `siteSettings` |
| **Contact** | parchment-aged | **Iris-shut close** — end-card settles; the Hero's crimson `●` returns and irises shut like a closing shutter | `siteSettings` |

**Color arc:** crimson Hero → … → crimson About → parchment Contact (deliberate bookend).

---

## 4. Craft pages

### `/films` — typographic reel index
- Big display-type list of film **titles**, one per row.
- Hovering a title **swaps in that film's still** (Bergh-style hero-image-swap).
- Click → **cinema-dark fade** (NOT the crimson shutter) into a **letterboxed
  Vimeo/YouTube player** — full quality, sound, title + credits. Watching a film is a
  different act than navigating, so it gets its own reveal.
- Scales gracefully from 4 to 14 films.

### `/photography` — index → series detail (two levels)
- **Index:** cinematic list/grid of series, each with a **develop-reveal** cover,
  category, year, frame count.
- Click → `/photography/[slug]` **detail page**: the rich Bergh-style scroll —
  **pinned sections, hero-image swap, two-image swaps**, at #4-level complexity.
  Built on the shared `<PinnedMediaScroll>` primitive (§5).
- **Text swap is metadata only** (confirmed from the Bergh reference): the swapping
  text is just **series/client name + short meta** (category, year, index) — NOT
  long-form narrative. So `photoSeries`'s existing `category` / `year` / `frameCount`
  cover it; **no `statement` field needed.** (§7 concern resolved.)

### `/poetry` — single flat reader (intentionally no detail level)
Three layout treatments keep the rhythm from feeling mechanical:

1. **Alternating pinned two-column** (image poems > ~1 viewport): image **pins**,
   poem **scrolls**, text **reveals stanza-by-stanza**; sides alternate poem-to-poem
   (img-left/poem-right, then img-right/poem-left); poem releases the pin when done.
2. **Static two-column** (short image poems): image + poem side by side, no pin,
   revealed together — a natural breather (avoids janky micro-pins).
3. **Centered solo type** (image-less poems): poem alone, larger type, the
   settle/ink-in reveal carries it — a deliberate change of pace.

**Mobile:** stacked single column — image first (static / faint parallax), poem below
revealing line-by-line. No pinning, no alternation.

> `/poetry` and the photography **detail page** share the **same** pinned-media-scroll
> engine — one hard primitive, configured two ways.

---

## 5. Reusable motion system (configurable primitives)

Each panel's signature is unique, but composed from a small shared library. Props for
direction, easing, stagger, trigger, threshold. Reduced-motion aware (§6).

- **`<RevealImage>`** — base media reveal (mask/clip/opacity); variants: `develop`
  (photography), `rackFocus` (about), plain.
- **`<RevealText>`** — line/stanza reveal (poetry teaser, poem body, slate).
- **`<PinnedMediaScroll>`** — pinned media + scrolling content; powers photography
  detail **and** poetry pinned poems. Config: side, pin/no-pin (content-length driven),
  swap behavior.
- **`<Letterbox>`** — animatable 2.39:1 bars (films teaser crush + film player).
- **`<PageTransition>` / `<Shutter>` + `<Slate>`** — the crimson shutter (§2).
- **`<ApertureMark>`** — the crimson `●` (Hero open, Contact close).

Motion tokens (easing curves, durations) live in `src/styles/tokens.css` alongside
color/type — single source of truth.

---

## 6. Cross-cutting defaults (veto-able)

- **Reduced motion** (`prefers-reduced-motion`): disable pins, parallax, rack-focus,
  letterbox-crush, develop — replace with simple fades; the shutter becomes an instant
  crossfade. Content always fully reachable.
- **Scroll tech:** Lenis smooth-scroll + GSAP ScrollTrigger. Pinning via ScrollTrigger
  with `invalidateOnRefresh` and content-driven end distances. On route change, reset
  scroll to top (`lenis.scrollTo(0, { immediate: true })`) and `ScrollTrigger.refresh()`
  after images settle. (Replaces the deleted return-from-work machinery with something
  far simpler.)
- **Nav (GhostBar):** persistent across the site. Home — defer until Hero completes,
  then appear. Inner pages — present from top, **auto-hide on scroll-down / reveal on
  scroll-up**. Items: Films/Photography/Poetry shutter to routes; About/Contact
  smooth-scroll home anchors. Label is **"Photography"**.
- **Preloader:** keep the current liked version. Optional later polish referencing
  Blacklead/Jason Bergh — out of scope for the core build.
- **Grain:** global `PaperGrain` stays. Films gets a heavier grain / gate-weave on top.
- **Fonts:** existing `--font-display` / `--font-editorial` / `--font-data` (data =
  camera-stamp meta).

---

## 7. CMS reconciliation

Existing Sanity schemas already cover the plan — `film`, `photoSeries`, `poem`,
`aboutTeaser`, `poetryTeaser`, `siteSettings`. No structural changes required.

**Resolved:** the photography detail page's text-swaps are **metadata only** (series/
client name + category/year/index), per the Bergh reference — no long-form narrative.
`photoSeries`'s existing fields cover it. **No schema changes required anywhere.**

---

## 8. Build increments

Foundation first (shared system + flow), then sections in home order, hardening the
pinned primitive on Photography before Poetry reuses it.

- **Phase 0 — Foundation:** motion tokens; `<RevealImage>`, `<RevealText>`,
  `<Letterbox>` primitives; `<PageTransition>`/`<Shutter>`/`<Slate>`; nav rework
  (routes + auto-hide); route scroll-reset. *Verify: shutter navigates between two stub
  routes; reduced-motion fallback works.*
- **Phase 1 — Films:** teaser (letterbox crush) + `/films` typographic index +
  hover-swap + cinema-dark lightbox player.
- **Phase 2 — Photography:** teaser (develop) + `/photography` index +
  `/photography/[slug]` detail. **Build `<PinnedMediaScroll>` here.**
- **Phase 3 — Poetry:** teaser (settle) + `/poetry` (reuse `<PinnedMediaScroll>`;
  three treatments + mobile stack).
- **Phase 4 — About:** rack-focus home section (crimson).
- **Phase 5 — Contact:** end-card section + iris-shut `<ApertureMark>` close (parchment).
- **Phase 6 — Polish:** reduced-motion audit, grain pass, preloader polish, QA.

---

## 9. Decisions locked (provenance)

Architecture: hybrid C · Films-first · About = home section (B) · Contact = home
section. Transition: crimson single-panel shutter, nudge + slate-in + slide-off-top,
asymmetric back-nav, no shared element. Films: stills-as-cinema teaser, typographic
index, cinema-dark lightbox. Photography: index→detail, develop reveal,
Bergh/#4 detail choreography. Poetry: pinned alternating two-column / static / solo,
stanza reveal on scroll, mobile stacks, shared pinned primitive. About: rack-focus on
crimson. Contact: end-card + crimson `●` iris close + one invitation line. Nav:
"Photography" label, persistent, inner-page auto-hide. Showreel exclusive to Hero.
