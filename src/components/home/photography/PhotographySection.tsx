'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { PolaroidCard } from '@/components/home/photography/PolaroidCard';
import { getAnimationMode, getStackRotation } from '@/lib/animationMode';
import { markHomeReturn } from '@/lib/home-scroll';
import { navigateWithTransition } from '@/lib/view-transition-nav';
import type { PhotoSeries } from '@/types/photoSeries';
import { useMedia } from '@/hooks/useMedia';
import { useLenis } from 'lenis/react';

import './photography-section.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// The scatter is scroll-linked (scrubbed); the flip + text reveal are
// scroll-triggered (they autoplay once and run to completion so the cards always
// settle face-up and stay clickable).
const SCATTER_DURATION = 0.8;
const FLIP_DURATION = 0.6;
const FLIP_STAGGER = 0.08;
// How far the section pins. Kept short so the flip happens soon after scrolling
// into the section rather than after a long scrub.
const PIN_DISTANCE = '+=130%';
// Scrub progress at which the scatter has landed and the reveal should fire.
const REVEAL_AT = 0.5;

// Resting tilt per card (degrees) — applied via GSAP so it can coexist with the
// scatter/hover transforms without an inline-vs-stylesheet transform conflict.
const GRID_ROTATIONS = [-2.5, 1.8, -1.2, 3, -2, 1.4];

function padSeriesCount(count: number): string {
  return String(count).padStart(2, '0');
}

function getRevealScrollTop(section: HTMLElement): number {
  ScrollTrigger.refresh();

  const probe = ScrollTrigger.create({
    trigger: section,
    start: 'top top',
    end: PIN_DISTANCE,
  });

  const revealScroll = probe.start + (probe.end - probe.start) * REVEAL_AT;
  probe.kill();

  return revealScroll;
}

function applySettledState(
  cards: HTMLDivElement[],
  flippers: Element[],
  scrollHint: HTMLDivElement | null,
  viewAll: HTMLAnchorElement | null,
  isReduced: boolean,
) {
  cards.forEach((el, i) => {
    gsap.set(el, {
      x: 0,
      y: 0,
      rotation: GRID_ROTATIONS[i] ?? 0,
      autoAlpha: 1,
      opacity: 1,
    });
  });

  cards.forEach((card) => {
    card.querySelectorAll('[data-char]').forEach((char) => {
      gsap.set(char, { opacity: 1 });
    });

    const meta = card.querySelector('.polaroid-card__series-meta');
    if (meta) gsap.set(meta, { opacity: 1 });

    const border = card.querySelector('.polaroid-border');
    const caption = card.querySelector('.polaroid-caption');
    if (border) gsap.set(border, { opacity: 1 });
    if (caption) gsap.set(caption, { opacity: 1 });
  });

  if (!isReduced && flippers.length > 0) {
    gsap.set(flippers, { rotateY: 180 });
  }

  if (scrollHint) gsap.set(scrollHint, { autoAlpha: 0 });
  if (viewAll) gsap.set(viewAll, { opacity: 1 });
}

type PhotographySectionProps = {
  series: PhotoSeries[];
  scrollReady?: boolean;
};

export function PhotographySection({
  series,
  scrollReady = true,
}: PhotographySectionProps) {
  const lenis = useLenis();
  const router = useRouter();
  const isMobile = useMedia('(max-width: 767px)', false);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const viewAllRef = useRef<HTMLAnchorElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const polaroidRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationModeRef = useRef<'full' | 'reduced'>('full');
  const hasAutoPlayedRef = useRef(false);

  const [hoverEnabled, setHoverEnabled] = useState(false);
  const [mobileViewAllVisible, setMobileViewAllVisible] = useState(false);
  const [stripIndex, setStripIndex] = useState(0);
  const [arrowsHidden, setArrowsHidden] = useState(false);

  useEffect(() => {
    animationModeRef.current = getAnimationMode();
  }, [series]);

  const setPolaroidRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      polaroidRefs.current[index] = el;
    },
    [],
  );

  const handleSeriesClick = useCallback(
    async (slug: string, imageSrc: string, cardRef: HTMLDivElement) => {
      const morphEl = cardRef.querySelector(
        '[data-work-hero-morph]',
      ) as HTMLElement | null;
      if (!morphEl) return;

      const scrollY =
        typeof lenis?.scroll === 'number' ? lenis.scroll : window.scrollY;
      markHomeReturn(scrollY);

      const border = cardRef.querySelector('.polaroid-border');
      const caption = cardRef.querySelector('.polaroid-caption');

      await navigateWithTransition({
        navigate: () => router.push(`/work/${slug}`),
        variant: 'polaroid-hero',
        heroElement: morphEl,
        heroImageSrc: imageSrc,
        onBeforeNavigate: async () => {
          const tweens: gsap.core.Tween[] = [];

          if (border) {
            tweens.push(gsap.to(border, { opacity: 0, duration: 0.15 }));
          }
          if (caption) {
            tweens.push(gsap.to(caption, { opacity: 0, duration: 0.15 }));
          }

          polaroidRefs.current.forEach((el) => {
            if (el && el !== cardRef) {
              tweens.push(gsap.to(el, { opacity: 0, duration: 0.25 }));
            }
          });

          if (tweens.length > 0) {
            await Promise.all(tweens);
          }
        },
      });
    },
    [lenis, router],
  );

  // Hover lift/straighten is GSAP-driven because the card's transform is owned
  // by GSAP after the scatter (an inline transform would override CSS :hover).
  const handleCardEnter = useCallback(
    (index: number) => {
      if (!hoverEnabled || isMobile) return;
      const el = polaroidRefs.current[index];
      if (!el) return;
      gsap.to(el, { rotation: 0, y: -6, duration: 0.3, ease: 'power2.out' });
    },
    [hoverEnabled, isMobile],
  );

  const handleCardLeave = useCallback(
    (index: number) => {
      if (!hoverEnabled || isMobile) return;
      const el = polaroidRefs.current[index];
      if (!el) return;
      gsap.to(el, {
        rotation: GRID_ROTATIONS[index] ?? 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    },
    [hoverEnabled, isMobile],
  );

  /* --- Desktop pinned scroll sequence --- */
  useGSAP(
    () => {
      if (isMobile || !scrollReady) return;

      const section = sectionRef.current;
      const stage = stageRef.current;
      const cards = polaroidRefs.current.filter(Boolean) as HTMLDivElement[];
      const scrollHint = scrollHintRef.current;
      const viewAll = viewAllRef.current;

      if (!section || !stage || cards.length === 0) return;

      const mode = getAnimationMode();
      const isReduced = mode === 'reduced';

      const flippers = cards
        .map((card) => card.querySelector('.polaroid-card__flipper'))
        .filter(Boolean) as Element[];

      const currentScroll =
        typeof lenis?.scroll === 'number' ? lenis.scroll : window.scrollY;
      const revealScrollTop = getRevealScrollTop(section);
      const shouldStartSettled = currentScroll >= revealScrollTop - 8;

      if (shouldStartSettled) {
        applySettledState(cards, flippers, scrollHint, viewAll, isReduced);
        setHoverEnabled(true);
        return;
      }

      cards.forEach((el, i) => {
        gsap.set(el, {
          willChange: 'transform',
          autoAlpha: 1,
          clearProps: 'x,y,rotation',
        });
        gsap.set(el, { rotation: GRID_ROTATIONS[i] ?? 0 });
      });

      // --- Reveal: SCROLL-TRIGGERED (not scrubbed) ---
      // The flip + text run on a normal, time-based timeline that plays once and
      // always reaches the end regardless of scroll speed. This is what makes the
      // cards reliably settle face-up so the links stay clickable (a scrubbed
      // reveal could be left half-done if the user stops mid-scroll).
      let revealPlayed = false;
      const revealTl = gsap.timeline({
        paused: true,
        onComplete: () => setHoverEnabled(true),
      });

      if (flippers.length > 0) {
        if (!isReduced) {
          revealTl.to(
            flippers,
            {
              rotateY: 180,
              duration: FLIP_DURATION,
              ease: 'power2.inOut',
              stagger: FLIP_STAGGER,
            },
            0,
          );
        } else {
          // Reduced motion: no 3D flip — cards sit face-up; only the text reveals.
          gsap.set(flippers, { rotateY: 180 });
        }
      }

      cards.forEach((card, i) => {
        const chars = card.querySelectorAll('[data-char]');
        const meta = card.querySelector('.polaroid-card__series-meta');
        const at = 0.3 + i * FLIP_STAGGER;

        if (chars.length > 0) {
          revealTl.to(
            chars,
            { opacity: 1, duration: 0.2, stagger: 0.03, ease: 'none' },
            at,
          );
        }

        if (meta) {
          revealTl.to(meta, { opacity: 1, duration: 0.25, ease: 'none' }, at + 0.15);
        }
      });

      if (viewAll) {
        revealTl.to(viewAll, { opacity: 1, duration: 0.3, ease: 'none' }, '>-0.1');
      }

      // --- Scatter: SCROLL-LINKED (scrubbed) ---
      const tl = gsap.timeline({
        scrollTrigger: {
          // Pin the whole section so the "Selected Work" header stays fixed
          // alongside the stage for the duration of the sequence.
          trigger: section,
          start: 'top top',
          end: PIN_DISTANCE,
          pin: true,
          scrub: 1,
          // Lower priority than the hero so this section refreshes after the
          // hero's pin-spacer is in place (this section is created first on
          // mount, before the preloader-gated hero trigger exists).
          refreshPriority: 0,
          // Once the scatter has essentially landed, fire the reveal once. It
          // then runs to completion on its own clock. We also freeze the
          // scrubbed scatter (killTweensOf the cards/heading/hint) so scrolling
          // back up does NOT re-stack the now-flipped cards — the flip is
          // one-way, so a partial reverse would look broken.
          onUpdate: (self) => {
            if (self.progress >= REVEAL_AT && !revealPlayed) {
              revealPlayed = true;
              revealTl.play();
              gsap.killTweensOf(cards);
              if (scrollHint) gsap.killTweensOf(scrollHint);
            }
          },
        },
      });

      // Measure each card's natural grid centre, then animate it FROM the shared
      // stack centre (the middle of the stage) TO its grid slot.
      const sectionRect = section.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const targetCx = stageRect.left - sectionRect.left + stageRect.width / 2;
      const targetCy = stageRect.top - sectionRect.top + stageRect.height / 2;

      cards.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const elCx = rect.left - sectionRect.left + rect.width / 2;
        const elCy = rect.top - sectionRect.top + rect.height / 2;

        const dx = targetCx - elCx;
        const dy = targetCy - elCy;

        tl.fromTo(
          el,
          {
            x: dx,
            y: dy,
            rotation: getStackRotation(i),
          },
          {
            x: 0,
            y: 0,
            rotation: GRID_ROTATIONS[i] ?? 0,
            duration: SCATTER_DURATION,
            ease: 'power2.out',
          },
          0,
        );
      });

      if (scrollHint) {
        tl.to(scrollHint, { autoAlpha: 0, duration: 0.1, ease: 'none' }, 0);
      }

      // Trailing pad so the scatter occupies only the first part of the pinned
      // range, leaving scroll room for the reveal to fire and play while pinned.
      // Sized so the scatter completes right around REVEAL_AT.
      tl.to({}, { duration: SCATTER_DURATION });

      // Lock timeline at progress 0 = stacked deck, before user scrolls
      tl.progress(0);
      ScrollTrigger.refresh();
    },
    {
      scope: sectionRef,
      dependencies: [isMobile, scrollReady, lenis],
      revertOnUpdate: true,
    },
  );

  /* --- Mobile auto-play reveal --- */
  useEffect(() => {
    if (!isMobile || hasAutoPlayedRef.current) return;

    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasAutoPlayedRef.current) return;
        hasAutoPlayedRef.current = true;

        const cards = polaroidRefs.current.filter(Boolean) as HTMLDivElement[];
        const mode = animationModeRef.current;
        const viewAll = viewAllRef.current;

        const tl = gsap.timeline({
          onComplete: () => {
            setHoverEnabled(true);
            setMobileViewAllVisible(true);
          },
        });

        cards.forEach((card, i) => {
          const flipper = card.querySelector('.polaroid-card__flipper');
          const chars = card.querySelectorAll('[data-char]');
          const meta = card.querySelector('.polaroid-card__series-meta');
          const start = i * 0.08;

          if (flipper) {
            if (mode === 'full') {
              tl.to(
                flipper,
                { rotateY: 180, duration: 0.6, ease: 'power2.inOut' },
                start,
              );
            } else {
              tl.fromTo(
                flipper,
                { scale: 0.9, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.inOut' },
                start,
              );
            }
          }

          if (chars.length > 0) {
            tl.to(
              chars,
              { opacity: 1, stagger: 0.04, duration: 0.01 },
              start + 0.6,
            );
          }

          if (meta) {
            tl.to(meta, { opacity: 1, duration: 0.3 }, start + 0.6 + chars.length * 0.04);
          }
        });

        if (viewAll) {
          tl.to(viewAll, { opacity: 1, duration: 0.5 }, '-=0.3');
        }

        tl.duration(2.8);
      },
      { threshold: 0.3 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [isMobile]);

  /* --- Mobile strip scroll tracking --- */
  useEffect(() => {
    if (!isMobile) return;

    const strip = stripRef.current;
    if (!strip) return;

    const cards = polaroidRefs.current.filter(Boolean) as HTMLDivElement[];

    const updateActive = () => {
      const stripRect = strip.getBoundingClientRect();
      const center = stripRect.left + stripRect.width / 2;

      let closest = 0;
      let closestDist = Infinity;

      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const dist = Math.abs(center - cardCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });

      setStripIndex(closest);

      cards.forEach((card, i) => {
        card.classList.toggle('polaroid-card--active', i === closest);
      });
    };

    strip.addEventListener('scroll', updateActive, { passive: true });
    updateActive();

    return () => strip.removeEventListener('scroll', updateActive);
  }, [isMobile, series.length]);

  const scrollStrip = useCallback(
    (direction: 'left' | 'right') => {
      const strip = stripRef.current;
      const card = polaroidRefs.current[
        direction === 'left' ? Math.max(stripIndex - 1, 0) : Math.min(stripIndex + 1, series.length - 1)
      ];
      if (!strip || !card) return;

      const offset =
        card.offsetLeft - strip.clientWidth / 2 + card.clientWidth / 2;

      strip.scrollTo({ left: offset, behavior: 'smooth' });
    },
    [series.length, stripIndex],
  );

  const handleStripTouch = useCallback(() => {
    setArrowsHidden(true);
  }, []);

  const seriesCountLabel = `${padSeriesCount(series.length)} Series`;

  return (
    <section
      ref={sectionRef}
      id="photography"
      data-nav-theme="light"
      data-photography-section
      className={`photography-section ${isMobile ? 'photography-mobile' : ''}`}
      aria-label="Photography"
    >
      <header className="photography-header">
        <h2 className="photography-header__title">Selected Work</h2>
        <span className="photography-header__count">{seriesCountLabel}</span>
      </header>

      <div ref={stageRef} className="photography-stage">
        {!isMobile && (
          <div ref={scrollHintRef} className="photography-stage__scroll-hint">
            ↓ SCROLL TO OPEN
          </div>
        )}

        {isMobile ? (
          <div className="photography-strip-wrap">
            <div
              className={[
                'photography-strip-hint',
                arrowsHidden ? 'photography-strip-hint--hidden' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden="true"
            >
              <span className="photography-strip-hint__line" />
              <span className="photography-strip-hint__label">Swipe</span>
              <span className="photography-strip-hint__arrow">→</span>
            </div>

            <button
              type="button"
              className={[
                'photography-strip-arrow photography-strip-arrow--left',
                stripIndex === 0 || arrowsHidden
                  ? 'photography-strip-arrow--hidden'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label="Previous series"
              onClick={() => scrollStrip('left')}
            >
              ←
            </button>

            <div
              ref={stripRef}
              className="photography-strip"
              onTouchStart={handleStripTouch}
            >
              {series.map((item, index) => (
                <PolaroidCard
                  key={item.slug}
                  ref={setPolaroidRef(index)}
                  series={item}
                  index={index}
                  hoverEnabled={hoverEnabled}
                  isActive={index === stripIndex}
                  animationMode={animationModeRef.current}
                  onClick={() =>
                    handleSeriesClick(
                      item.slug,
                      item.coverImage,
                      polaroidRefs.current[index]!,
                    )
                  }
                />
              ))}
            </div>

            <button
              type="button"
              className={[
                'photography-strip-arrow photography-strip-arrow--right',
                stripIndex === series.length - 1 || arrowsHidden
                  ? 'photography-strip-arrow--hidden'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label="Next series"
              onClick={() => scrollStrip('right')}
            >
              →
            </button>

            <div className="photography-strip-dots" aria-hidden="true">
              {series.map((item, index) => (
                <span
                  key={item.slug}
                  className={[
                    'photography-strip-dot',
                    index === stripIndex ? 'photography-strip-dot--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              ))}
            </div>
          </div>
        ) : (
          <div ref={gridRef} className="polaroid-grid">
            {series.map((item, index) => (
              <PolaroidCard
                key={item.slug}
                ref={setPolaroidRef(index)}
                series={item}
                index={index}
                hoverEnabled={hoverEnabled}
                animationMode={animationModeRef.current}
                onMouseEnter={() => handleCardEnter(index)}
                onMouseLeave={() => handleCardLeave(index)}
                onClick={() =>
                  handleSeriesClick(
                    item.slug,
                    item.coverImage,
                    polaroidRefs.current[index]!,
                  )
                }
              />
            ))}
          </div>
        )}

        <Link
          ref={viewAllRef}
          href="/works"
          className={[
            'photography-view-all',
            isMobile && mobileViewAllVisible ? 'photography-view-all--visible' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="photography-view-all__text">View all works</span>
          <span className="photography-view-all__arrow">→</span>
        </Link>
      </div>
    </section>
  );
}
