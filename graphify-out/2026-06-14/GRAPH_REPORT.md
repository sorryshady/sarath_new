# Graph Report - .  (2026-06-07)

## Corpus Check
- 94 files · ~52,868 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 406 nodes · 585 edges · 31 communities (24 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.77)
- Token cost: 106,510 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Sanity Data Layer|Sanity Data Layer]]
- [[_COMMUNITY_Page Routes & Nav Observer|Page Routes & Nav Observer]]
- [[_COMMUNITY_Home Page & Preloader Scroll|Home Page & Preloader Scroll]]
- [[_COMMUNITY_Sanity Migration Scripts|Sanity Migration Scripts]]
- [[_COMMUNITY_Project Dependencies|Project Dependencies]]
- [[_COMMUNITY_View Transitions Engine|View Transitions Engine]]
- [[_COMMUNITY_Providers & Layout Effects|Providers & Layout Effects]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Sanity Schema Definitions|Sanity Schema Definitions]]
- [[_COMMUNITY_Hero Video Section|Hero Video Section]]
- [[_COMMUNITY_Poetry Anthology Content|Poetry Anthology Content]]
- [[_COMMUNITY_Cinematic Design System|Cinematic Design System]]
- [[_COMMUNITY_npm Scripts|npm Scripts]]
- [[_COMMUNITY_Films & Artist Profile|Films & Artist Profile]]
- [[_COMMUNITY_Animation & Transition Patterns|Animation & Transition Patterns]]
- [[_COMMUNITY_Photography & Poetry Content Specs|Photography & Poetry Content Specs]]
- [[_COMMUNITY_Photography Section & Store|Photography Section & Store]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_Agent Coding Principles|Agent Coding Principles]]
- [[_COMMUNITY_Brand Identity|Brand Identity]]
- [[_COMMUNITY_Films Section Build Spec|Films Section Build Spec]]
- [[_COMMUNITY_Page Enter Transition|Page Enter Transition]]
- [[_COMMUNITY_Sitemap|Sitemap]]
- [[_COMMUNITY_Next Config|Next Config]]
- [[_COMMUNITY_npm Wrapper Script|npm Wrapper Script]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_README & Setup|README & Setup]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `Poetry Anthology (Live Site)` - 15 edges
3. `useMedia()` - 12 edges
4. `scripts` - 11 edges
5. `navigateWithTransition()` - 8 edges
6. `extractSeriesImageUrls()` - 7 edges
7. `migratePoems()` - 7 edges
8. `main()` - 7 edges
9. `GhostBar()` - 7 edges
10. `GSAP + ScrollTrigger Animation Stack` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Agent Rules (Breaking Changes)` --semantically_similar_to--> `Think Before Coding`  [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md
- `Copy()` --calls--> `useMedia()`  [INFERRED]
  reference files/copy/copy.tsx → src/hooks/useMedia.ts
- `Vimeo Player & Lightbox` --references--> `The Death of Don Quixote (Film)`  [INFERRED]
  reference files/films-section-build-prompt.md → .firecrawl/home.md
- `/poetry Page (Pinned Image Anthology)` --references--> `Poetry Anthology (Live Site)`  [INFERRED]
  reference files/poetry-section-build-prompt.md → .firecrawl/poems.md
- `Contact Section Build Prompt` --references--> `Sarath Menon (Artist | Filmmaker)`  [INFERRED]
  reference files/contact-section-build-prompt.md → .firecrawl/home.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Home Page Section Build Suite** — reference_files_preloader_build_prompt_section, reference_files_hero_section_build_prompt_section, reference_files_navbar_build_prompt_section, reference_files_photography_section_build_prompt_section, reference_files_about_teaser_build_prompt_section, reference_files_films_section_build_prompt_section, reference_files_poetry_section_build_prompt_section, reference_files_contact_section_build_prompt_section [INFERRED 0.85]
- **Shared Crimson/Cream + GSAP + Sanity Design System** — concept_crimson_cream_palette, concept_gsap_scrolltrigger_stack, concept_sanity_cms [INFERRED 0.85]
- **Preloader to Hero Handoff Flow** — reference_files_preloader_build_prompt_counter_logic, reference_files_hero_section_build_prompt_preloader_handshake, reference_files_hero_section_build_prompt_vimeo_background, reference_files_hero_section_build_prompt_scroll_timeline [INFERRED 0.85]

## Communities (31 total, 7 thin omitted)

### Community 0 - "Sanity Data Layer"
Cohesion: 0.09
Nodes (25): client, FEATURED_SERIES, builder, urlFor(), { sanityFetch, SanityLive }, mapSanityRow(), parseFrameCount(), SanityFeaturedSeriesRow (+17 more)

### Community 1 - "Page Routes & Nav Observer"
Cohesion: 0.08
Nodes (21): metadata, metadata, placeholderMetadata(), PlaceholderPage(), PlaceholderPageProps, getNavHeight(), getSectionBehindNav(), NavTheme (+13 more)

### Community 2 - "Home Page & Preloader Scroll"
Cohesion: 0.08
Nodes (25): HomePage(), HomePageProps, Preloader(), PreloaderProps, useSprocketCount(), AnimationMode, getAnimationMode(), getStackRotation() (+17 more)

### Community 3 - "Sanity Migration Scripts"
Cohesion: 0.11
Nodes (33): createWriteClient(), decodeNextImageUrl(), dedupeGalleryByAsset(), extractSeriesImageUrls(), fetchPage(), imageRef(), loadEnvLocal(), mediaFilename() (+25 more)

### Community 4 - "Project Dependencies"
Cohesion: 0.06
Nodes (33): dependencies, gsap, @gsap/react, lenis, next, next-sanity, react, react-dom (+25 more)

### Community 5 - "View Transitions Engine"
Cohesion: 0.12
Nodes (22): markFromPolaroidTransition(), DocumentWithViewTransition, ENTER, DocumentWithViewTransition, killPhotographyScrollTriggers(), markTransitionStart(), navigateWithTransition(), NavigateWithTransitionOptions (+14 more)

### Community 6 - "Providers & Layout Effects"
Cohesion: 0.13
Nodes (11): PaperGrain(), ScrollRestoration(), useMedia(), waitForPageEnter(), GSAPProvider(), LenisProvider(), Copy(), CopyProps (+3 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 8 - "Sanity Schema Definitions"
Cohesion: 0.15
Nodes (9): aboutTeaser, film, photoSeries, poem, poetryTeaser, siteSettings, singleton(), structure() (+1 more)

### Community 9 - "Hero Video Section"
Cohesion: 0.21
Nodes (11): HeroSection(), HeroSectionProps, metaLabelStyle, HeroVideoBackground(), HeroVideoBackgroundProps, getHeroVideoSource(), getVideoPosterUrl(), getVimeoPosterUrl() (+3 more)

### Community 10 - "Poetry Anthology Content"
Cohesion: 0.14
Nodes (14): 7 Minutes (Poem), Always (Poem), Poetry Anthology (Live Site), Blood of God (Poem), Life (Poem), My friend Tony (Poem), Rain (Poem), Sleep (Poem) (+6 more)

### Community 11 - "Cinematic Design System"
Cohesion: 0.22
Nodes (11): Crimson #8B1E1E / Cream #EFD9B6 Palette, Paper Texture (Global mix-blend-mode), Preloader Handshake, Hero Scroll Timeline (Crimson Drop + Zoom), Hero Section Build Prompt, Colour Inversion System, Ghost Bar Navigation Build Prompt, Non-Linear Counter Logic (00 to 100) (+3 more)

### Community 12 - "npm Scripts"
Cohesion: 0.18
Nodes (11): scripts, audit:check, build, dev, lint, migrate, npm, repair:films (+3 more)

### Community 13 - "Films & Artist Profile"
Cohesion: 0.29
Nodes (8): The Death of Don Quixote (Film), Sarath Menon Home (Live Site), Rajakumaran (Film), Sarath Menon (Artist | Filmmaker), The Red Ball (Film), Colophon Strip, Magnetic Cursor Effect, Contact Section Build Prompt

### Community 14 - "Animation & Transition Patterns"
Cohesion: 0.33
Nodes (7): GSAP + ScrollTrigger Animation Stack, Full-Screen Mobile Menu Overlay, Polaroid Scatter Sequence, Photography Section Build Prompt, Zustand Transition Store, GSAP Flip Zoom Page Transition, Scroll-Linked Image Transition

### Community 15 - "Photography & Poetry Content Specs"
Cohesion: 0.29
Nodes (7): Sanity CMS Data Source, Rajasthan (Photography Series), About Teaser Section Build Prompt, PhotoSeries Sanity Schema, Poetry Home CTA Section, /poetry Page (Pinned Image Anthology), Poetry Section Build Prompt

### Community 16 - "Photography Section & Store"
Cohesion: 0.33
Nodes (4): gridTransforms, PhotographySection(), TransitionState, useTransitionStore

### Community 17 - "Root Layout & Fonts"
Cohesion: 0.33
Nodes (3): metadata, anton, cormorant

### Community 18 - "Agent Coding Principles"
Cohesion: 0.40
Nodes (5): Next.js Agent Rules (Breaking Changes), Goal-Driven Execution, Simplicity First, Surgical Changes, Think Before Coding

### Community 19 - "Brand Identity"
Cohesion: 0.50
Nodes (5): Elegant Artistic Personal Brand Identity, Sarath Menon Portfolio Brandmark, Deep Maroon on Transparent Palette, Calligraphic Looping Monogram Motif, Minimal Hand-Drawn Line-Art Style

### Community 20 - "Films Section Build Spec"
Cohesion: 0.40
Nodes (5): Accordion Carousel, Lights-Down Transition, Films Section Build Prompt, Vimeo Player & Lightbox, Vimeo Video Background

## Knowledge Gaps
- **148 isolated node(s):** `eslintConfig`, `projectRoot`, `nextConfig`, `name`, `version` (+143 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useMedia()` connect `Providers & Layout Effects` to `Hero Video Section`, `Home Page & Preloader Scroll`, `Page Routes & Nav Observer`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `GhostBar()` connect `Page Routes & Nav Observer` to `Sanity Data Layer`, `Home Page & Preloader Scroll`, `Providers & Layout Effects`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `useMedia()` (e.g. with `Copy()` and `Copy()`) actually correct?**
  _`useMedia()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `projectRoot`, `nextConfig` to the rest of the system?**
  _150 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Sanity Data Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.08771929824561403 - nodes in this community are weakly interconnected._
- **Should `Page Routes & Nav Observer` be split into smaller, more focused modules?**
  _Cohesion score 0.07539118065433854 - nodes in this community are weakly interconnected._
- **Should `Home Page & Preloader Scroll` be split into smaller, more focused modules?**
  _Cohesion score 0.07965860597439545 - nodes in this community are weakly interconnected._