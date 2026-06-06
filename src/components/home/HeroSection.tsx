'use client';

import { useEffect, useId, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { useMedia } from '@/hooks/useMedia';
import { getHeroVideoSource } from '@/lib/video';

import { HeroVideoBackground } from './HeroVideoBackground';
import './hero-section.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type HeroSectionProps = {
  isPreloaderDone: boolean;
  onVideoReady: () => void;
  onHeroComplete: (complete: boolean) => void;
};

const metaLabelStyle = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--size-hero-meta)',
  fontWeight: 'var(--weight-bold)',
  letterSpacing: 'var(--tracking-wide)',
  color: 'var(--hero-meta-text)',
  textTransform: 'uppercase' as const,
  lineHeight: 'var(--leading-data)',
};

export function HeroSection({
  isPreloaderDone,
  onVideoReady,
  onHeroComplete,
}: HeroSectionProps) {
  const maskId = useId().replace(/:/g, '');
  const containerRef = useRef<HTMLDivElement>(null);
  const bgOverlayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollPromptRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const maskRectRef = useRef<SVGRectElement>(null);
  const visibleRectRef = useRef<SVGRectElement>(null);
  const leftTextRef = useRef<SVGTextElement>(null);
  const rightTextRef = useRef<SVGTextElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  const onHeroCompleteRef = useRef(onHeroComplete);
  useEffect(() => {
    onHeroCompleteRef.current = onHeroComplete;
  }, [onHeroComplete]);

  const isMobile = useMedia('(max-width: 767px)', false);
  const isSmallMobile = useMedia('(max-width: 479px)', false);
  const isTablet = useMedia('(min-width: 768px) and (max-width: 1023px)', false);

  const nameFontSize = isSmallMobile
    ? '16vw'
    : isMobile
      ? 'var(--size-hero-mobile)'
      : isTablet
        ? '11vw'
        : 'var(--size-hero-name)';

  const circleRadius = isSmallMobile
    ? '2.4vw'
    : isMobile
      ? '2.1vw'
      : isTablet
        ? '1.7vw'
        : '1.5vw';

  const textYTarget = isMobile ? '68%' : '65%';
  const videoSource = getHeroVideoSource();

  useGSAP(
    () => {
      if (!isPreloaderDone) return;

      const container = containerRef.current;
      const header = headerRef.current;
      const scrollPrompt = scrollPromptRef.current;
      const svg = svgRef.current;
      const maskRect = maskRectRef.current;
      const visibleRect = visibleRectRef.current;
      const leftText = leftTextRef.current;
      const rightText = rightTextRef.current;
      const circle = circleRef.current;
      const bgOverlay = bgOverlayRef.current;

      if (
        !container ||
        !header ||
        !scrollPrompt ||
        !svg ||
        !maskRect ||
        !visibleRect ||
        !leftText ||
        !rightText ||
        !circle ||
        !bgOverlay
      ) {
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1,
          onLeave: () => onHeroCompleteRef.current(true),
          onEnterBack: () => onHeroCompleteRef.current(false),
        },
      });

      tl.to([header, scrollPrompt], { opacity: 0, duration: 0.15 }, 0);

      tl.to(
        [maskRect, visibleRect],
        {
          attr: { height: '100%' },
          duration: 0.8,
          ease: 'power2.inOut',
        },
        0.2,
      );

      tl.to(
        [leftText, rightText],
        {
          attr: { y: textYTarget },
          duration: 0.8,
          ease: 'power2.inOut',
        },
        0.2,
      );

      tl.to(
        circle,
        {
          attr: { cy: textYTarget },
          duration: 0.8,
          ease: 'power2.inOut',
        },
        0.2,
      );

      tl.to(
        svg,
        {
          scale: 250,
          transformOrigin: `50% ${textYTarget}`,
          ease: 'power3.in',
          duration: 1.5,
        },
        0.8,
      );

      tl.to(svg, { opacity: 0, duration: 0.4 }, 1.9);
      tl.to(bgOverlay, { opacity: 0, duration: 0.4 }, 1.9);
    },
    {
      scope: containerRef,
      dependencies: [isPreloaderDone, textYTarget],
      revertOnUpdate: true,
    },
  );

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden">
      <HeroVideoBackground source={videoSource} onReady={onVideoReady} />

      <div
        ref={bgOverlayRef}
        className="absolute inset-0 h-full w-full will-change-transform"
        style={{
          zIndex: 'var(--z-section-overlay)',
          backgroundImage: 'var(--hero-overlay)',
        }}
      />

      <div
        ref={headerRef}
        className="absolute left-0 top-0 z-20 w-full"
        style={{ height: '50%', pointerEvents: 'none' }}
      >
        <div
          className="hero-meta-left absolute block"
          style={{ ...metaLabelStyle, top: '24px', left: '28px' }}
        >
          <div>Photographer</div>
          <div>Filmmaker</div>
        </div>

        <div
          className="hero-meta-center absolute hidden lg:block"
          style={{
            ...metaLabelStyle,
            top: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          <div>London Film School</div>
          <div>Graduate</div>
        </div>

        <div
          className="hero-meta-right absolute block"
          style={{
            ...metaLabelStyle,
            top: '24px',
            right: '28px',
            textAlign: 'right',
          }}
        >
          <div>51.5°N 0.1°W</div>
          <div>London, UK</div>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ zIndex: 10 }}
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId}>
            <rect ref={maskRectRef} width="100%" height="50%" fill="white" />
            <text
              ref={leftTextRef}
              x="46%"
              y="50%"
              dy="0.25em"
              textAnchor="end"
              dominantBaseline="alphabetic"
              fill="black"
              letterSpacing="-0.05em"
              style={{
                fontSize: nameFontSize,
                fontFamily: 'var(--font-display)',
              }}
            >
              SARATH
            </text>
            <circle ref={circleRef} cx="50%" cy="50%" r={circleRadius} fill="black" />
            <text
              ref={rightTextRef}
              x="54%"
              y="50%"
              dy="0.25em"
              textAnchor="start"
              dominantBaseline="alphabetic"
              fill="black"
              letterSpacing="-0.05em"
              style={{
                fontSize: nameFontSize,
                fontFamily: 'var(--font-display)',
              }}
            >
              MENON
            </text>
          </mask>
        </defs>
        <rect
          ref={visibleRectRef}
          width="100%"
          height="50%"
          fill="var(--color-crimson)"
          mask={`url(#${maskId})`}
        />
      </svg>

      <div
        ref={scrollPromptRef}
        className="absolute bottom-7 left-7 z-20 flex items-center gap-2.5"
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: 'var(--size-hero-meta)',
          fontWeight: 'var(--weight-bold)',
          letterSpacing: 'var(--tracking-wider)',
          color: 'var(--hero-prompt-text)',
          textTransform: 'uppercase',
        }}
      >
        <span className="hero-scroll-bounce">↓</span>
        <span>Scroll to enter</span>
      </div>
    </section>
  );
}
