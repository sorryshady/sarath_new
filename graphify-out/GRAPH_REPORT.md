# Graph Report - sarath_menon  (2026-06-15)

## Corpus Check
- 101 files · ~86,877 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 787 nodes · 1015 edges · 47 communities (34 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e654c239`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 46|Community 46]]

## God Nodes (most connected - your core abstractions)
1. `Photography Section — AI Build Prompt` - 21 edges
2. `Films Section — AI Build Prompt` - 20 edges
3. `Poetry Section (Home CTA) + /poetry Page — AI Build Prompt` - 18 edges
4. `compilerOptions` - 17 edges
5. `Preloader Component — AI Build Prompt` - 16 edges
6. `Contact Section — AI Build Prompt` - 15 edges
7. `Ghost Bar Navigation Component — AI Build Prompt` - 15 edges
8. `Poetry Anthology (Live Site)` - 15 edges
9. `About Teaser Section — AI Build Prompt` - 14 edges
10. `useMedia()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Agent Rules (Breaking Changes)` --semantically_similar_to--> `Think Before Coding`  [INFERRED] [semantically similar]
  AGENTS.md → CLAUDE.md
- `Copy()` --calls--> `useMedia()`  [INFERRED]
  reference files/copy/copy.tsx → src/hooks/useMedia.ts
- `/poetry Page (Pinned Image Anthology)` --references--> `Poetry Anthology (Live Site)`  [INFERRED]
  reference files/poetry-section-build-prompt.md → .firecrawl/poems.md
- `VIMEO LIGHTBOX` --references--> `The Death of Don Quixote (Film)`  [INFERRED]
  reference files/films-section-build-prompt.md → .firecrawl/home.md
- `Contact Section Build Prompt` --references--> `Sarath Menon (Artist | Filmmaker)`  [INFERRED]
  reference files/contact-section-build-prompt.md → .firecrawl/home.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Home Page Section Build Suite** — reference_files_preloader_build_prompt_section, reference_files_hero_section_build_prompt_section, reference_files_navbar_build_prompt_section, reference_files_photography_section_build_prompt_section, reference_files_about_teaser_build_prompt_section, reference_files_films_section_build_prompt_section, reference_files_poetry_section_build_prompt_section, reference_files_contact_section_build_prompt_section [INFERRED 0.85]
- **Shared Crimson/Cream + GSAP + Sanity Design System** — concept_crimson_cream_palette, concept_gsap_scrolltrigger_stack, concept_sanity_cms [INFERRED 0.85]
- **Preloader to Hero Handoff Flow** — reference_files_preloader_build_prompt_counter_logic, reference_files_hero_section_build_prompt_preloader_handshake, reference_files_hero_section_build_prompt_vimeo_background, reference_files_hero_section_build_prompt_scroll_timeline [INFERRED 0.85]

## Communities (47 total, 13 thin omitted)

### Community 0 - "Sanity Data Layer"
Cohesion: 0.15
Nodes (20): FilmLightbox(), FilmLightboxProps, filmStill(), HeroSection(), HeroSectionProps, metaLabelStyle, HeroVideoBackground(), HeroVideoBackgroundProps (+12 more)

### Community 1 - "Page Routes & Nav Observer"
Cohesion: 0.12
Nodes (24): CRAFTS, CraftStub(), CraftStubProps, urlFor(), getAllPhotoSeries(), getAllPhotoSeriesSlugs(), getPhotoSeries(), seriesImageUrl() (+16 more)

### Community 2 - "Home Page & Preloader Scroll"
Cohesion: 0.05
Nodes (42): ACCEPTANCE CRITERIA, Arrow navigation buttons, Auto-play reveal on enter, Beat 1 — Stack enters (on section enter), Beat 2 — Scatter (scroll progress 0% → 50%), Beat 3 — Flip (scroll progress 50% → 80%), Beat 4 — Series names type in (scroll progress 75% → 95%), Beat 5 — Settle and release (scroll progress 95% → 100%) (+34 more)

### Community 3 - "Sanity Migration Scripts"
Cohesion: 0.11
Nodes (33): createWriteClient(), decodeNextImageUrl(), dedupeGalleryByAsset(), extractSeriesImageUrls(), fetchPage(), imageRef(), loadEnvLocal(), mediaFilename() (+25 more)

### Community 4 - "Project Dependencies"
Cohesion: 0.04
Nodes (44): dependencies, gsap, @gsap/react, lenis, next, next-sanity, react, react-dom (+36 more)

### Community 5 - "View Transitions Engine"
Cohesion: 0.05
Nodes (39): ACCEPTANCE CRITERIA, Advancing right (next film), Background and wrapper, Card states, Card width calculations, CAROUSEL HEIGHT, COLOUR TOKEN REFERENCE, Concept (+31 more)

### Community 6 - "Providers & Layout Effects"
Cohesion: 0.07
Nodes (24): PaperGrain(), useMedia(), getNavHeight(), getSectionBehindNav(), NavTheme, OBSERVER_THRESHOLDS, resolveRouteLink(), resolveRouteTheme() (+16 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 8 - "Sanity Schema Definitions"
Cohesion: 0.09
Nodes (16): aboutTeaser, film, photoSeries, poem, poetryTeaser, siteSettings, client, builder (+8 more)

### Community 9 - "Hero Video Section"
Cohesion: 0.05
Nodes (36): ACCEPTANCE CRITERIA — HOME CTA, ACCEPTANCE CRITERIA — /POETRY PAGE, Attribution + CTA fade in, Attribution row, Background, Bottom row — attribution + CTA, COLOUR TOKEN REFERENCE, Concept (+28 more)

### Community 10 - "Poetry Anthology Content"
Cohesion: 0.23
Nodes (15): 7 Minutes, Always, Poetry Anthology (Live Site), Blood of God, Contact, Life, My friend Tony, Rain (+7 more)

### Community 11 - "Cinematic Design System"
Cohesion: 0.06
Nodes (46): Crimson #8B1E1E / Cream #EFD9B6 Palette, GSAP + ScrollTrigger Animation Stack, Sanity CMS Data Source, About, Contact, The Death of Don Quixote (Film), Filmography, More options (+38 more)

### Community 12 - "npm Scripts"
Cohesion: 0.06
Nodes (31): ACCEPTANCE CRITERIA, Background, Beat 1 — Ready state (0.4s), Beat 2 — Frame dissolve (0.5s), Beat 3 — Panel slide up (0.6s), Bottom Meta Bar, COLOUR TOKENS (for reference), COMPONENT STRUCTURE (+23 more)

### Community 13 - "Films & Artist Profile"
Cohesion: 0.07
Nodes (28): About Teaser Section — AI Build Prompt, ACCEPTANCE CRITERIA, Bio text, Bio text reveal, COLOUR TOKEN REFERENCE, COMPONENT STRUCTURE, CONTEXT, Divider rule (+20 more)

### Community 14 - "Animation & Transition Patterns"
Cohesion: 0.07
Nodes (27): ACCEPTANCE CRITERIA, ACTIVE SECTION INDICATOR, Active state styles, COLOUR INVERSION SYSTEM, COLOUR TOKEN REFERENCE, COMPONENT INTERFACE, CONTEXT, Dark Mode (used over crimson `#8B1E1E` and dark video sections) (+19 more)

### Community 15 - "Photography & Poetry Content Specs"
Cohesion: 0.07
Nodes (26): 10. WHAT COMES AFTER THE HERO, 1. COLOUR CORRECTION, 2. TYPOGRAPHY — THE NAME, 3. BACKGROUND — VIMEO VIDEO PLAYER, 4. DARK OVERLAY REFINEMENT, 5. META TEXT CORNERS — REPLACING THE HEADER, 6. SCROLL TIMELINE — REFINEMENTS, 7. PRELOADER HANDSHAKE (+18 more)

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
Cohesion: 0.09
Nodes (21): ACCEPTANCE CRITERIA, Background, Beat 1 — Headline word drop (scroll triggered), Beat 2 — Ink bleeds spread, Beat 3 — Contact details stagger in, COLOUR TOKEN REFERENCE, CONTACT DETAILS GRID, Contact Section — AI Build Prompt (+13 more)

### Community 31 - "Community 31"
Cohesion: 0.13
Nodes (14): 1. Enable the engine, 2. Shared-element morph (polaroid → work hero), 3. Directional page slides + anchored GhostBar, 4. Page-enter GSAP reveals (`Copy.tsx`), 5. Reduced motion & browser support, 6. The skill — `~/.claude/skills/nextjs-view-transitions/SKILL.md`, Architecture, Decisions (+6 more)

### Community 32 - "Community 32"
Cohesion: 0.15
Nodes (12): File structure (what each unit owns), Native View Transitions (Next 16) Implementation Plan, Reference facts (verified during planning), Self-review (completed by planner), Task 1: Enable the engine and create the wrapper, Task 2: Shared-element morph — destination (WorkHero) and source (PolaroidCard), Task 3: Simplify PhotographySection navigation, Task 4: Directional page slides + GhostBar migration (+4 more)

### Community 33 - "Community 33"
Cohesion: 0.15
Nodes (12): File structure, Reference facts (verified during planning), Selected Work Redesign Implementation Plan, Self-review (completed by planner), Task 1: Reusable `RevealImage` component, Task 2: `FolderMeta` (SplitText line-mask metadata), Task 3: `FolderRail` (thumbnail list / strip), Task 4: `SelectedWorkHero` (reveal + slide-swap + morph) (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (12): Architecture, Component breakdown, Data flow, Decisions (resolved via grilling), `FolderMeta` (SplitText line-mask), Hero slide-swap (in `SelectedWorkHero`), Mobile (`max-width: 767px`), Problem (+4 more)

### Community 35 - "Community 35"
Cohesion: 0.20
Nodes (9): Content model (Sanity), Dependencies, Design tokens, Getting started, Overrides, Premise, Sarath Menon Portfolio, Scripts (+1 more)

### Community 36 - "Community 36"
Cohesion: 0.29
Nodes (5): 1. Think Before Coding, 2. Simplicity First, 3. Surgical Changes, 4. Goal-Driven Execution, graphify

### Community 41 - "Community 41"
Cohesion: 0.09
Nodes (27): metadata, FilmsExperience(), FilmsPage(), metadata, placeholderMetadata(), PlaceholderPage(), PlaceholderPageProps, getAllFilms() (+19 more)

### Community 42 - "Community 42"
Cohesion: 0.13
Nodes (14): 0. Design constraint — Hero images on every page, 1. Architecture — Hybrid (teaser → page), 2. Page transition — the crimson shutter (the heartbeat), 3. Home panels — each a unique signature, 4. Craft pages, 5. Reusable motion system (configurable primitives), 6. Cross-cutting defaults (veto-able), 7. CMS reconciliation (+6 more)

### Community 44 - "Community 44"
Cohesion: 0.33
Nodes (5): Adaptation for our Photography index, Build notes, Site Teardown: Jason Bergh (hero slider), The effect, deconstructed, THE REVEAL — the viewfinder alignment trick

### Community 46 - "Community 46"
Cohesion: 0.11
Nodes (24): AboutTeaserSection(), rolesLine(), HomePage(), HomePageProps, Preloader(), PreloaderProps, useSprocketCount(), getAboutMeta() (+16 more)

## Knowledge Gaps
- **426 isolated node(s):** `version`, `configurations`, `PreToolUse`, `eslintConfig`, `projectRoot` (+421 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Films Section — AI Build Prompt` connect `View Transitions Engine` to `Cinematic Design System`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `VIMEO LIGHTBOX` connect `Cinematic Design System` to `View Transitions Engine`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `useMedia()` connect `Providers & Layout Effects` to `Sanity Data Layer`, `Page Routes & Nav Observer`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `version`, `configurations`, `PreToolUse` to the rest of the system?**
  _428 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Sanity Data Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.1455026455026455 - nodes in this community are weakly interconnected._
- **Should `Page Routes & Nav Observer` be split into smaller, more focused modules?**
  _Cohesion score 0.11942959001782531 - nodes in this community are weakly interconnected._
- **Should `Home Page & Preloader Scroll` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._