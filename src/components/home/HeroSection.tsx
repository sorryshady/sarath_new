'use client';

import { useEffect, useId, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Player from '@vimeo/player';

import { useMedia } from '@/hooks/useMedia';
import { getHeroVimeoVideoId, getVimeoPosterUrl } from '@/lib/video';

import './hero-section.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type HeroSectionProps = {
  isPreloaderDone: boolean;
  onVideoReady: () => void;
  onHeroComplete: () => void;
};

const metaLabelStyle = {
  fontFamily: 'var(--font-data)',
  fontSize: 'var(--size-label)',
  letterSpacing: 'var(--tracking-wide)',
  color: 'color-mix(in srgb, var(--color-cream) 45%, transparent)',
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
  const vimeoContainerRef = useRef<HTMLDivElement>(null);
  const bgOverlayRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const scrollPromptRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const maskRectRef = useRef<SVGRectElement>(null);
  const visibleRectRef = useRef<SVGRectElement>(null);
  const leftTextRef = useRef<SVGTextElement>(null);
  const rightTextRef = useRef<SVGTextElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  const onVideoReadyRef = useRef(onVideoReady);
  const onHeroCompleteRef = useRef(onHeroComplete);
  onVideoReadyRef.current = onVideoReady;
  onHeroCompleteRef.current = onHeroComplete;

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
    ? '5vw'
    : isMobile
      ? '4vw'
      : isTablet
        ? '2.8vw'
        : '2.2vw';

  const textYTarget = isMobile ? '68%' : '65%';
  const vimeoId = getHeroVimeoVideoId();
  const posterUrl = getVimeoPosterUrl(vimeoId);

  useEffect(() => {
    const container = vimeoContainerRef.current;
    if (!container) return;

    let resolved = false;
    const resolveReady = () => {
      if (resolved) return;
      resolved = true;
      onVideoReadyRef.current();
    };

    const player = new Player(container, {
      id: vimeoId,
      background: true,
      muted: true,
      autoplay: true,
      loop: true,
      responsive: true,
    });

    player
      .ready()
      .then(() => player.play())
      .catch(() => {});

    player.on('bufferend', resolveReady);
    const fallback = window.setTimeout(resolveReady, 8000);

    return () => {
      window.clearTimeout(fallback);
      player.destroy();
    };
  }, [vimeoId]);

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
          onLeave: () => onHeroCompleteRef.current(),
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

      tl.to(svg, { opacity: 0, duration: 0.3 }, 1.9);
      tl.to(bgOverlay, { opacity: 0, duration: 0.5 }, 1.9);
    },
    {
      scope: containerRef,
      dependencies: [isPreloaderDone, textYTarget],
      revertOnUpdate: true,
    },
  );

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden">
      <div
        ref={vimeoContainerRef}
        className="hero-vimeo-bg absolute inset-0 z-0 h-full w-full overflow-hidden"
        style={{
          pointerEvents: 'none',
          backgroundImage: `url('${posterUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div
        ref={bgOverlayRef}
        className="absolute inset-0"
        style={{
          zIndex: 'var(--z-section-overlay)',
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.25) 100%)',
        }}
      />

      <div
        ref={headerRef}
        className="absolute left-0 top-0 z-20 w-full"
        style={{ height: '50%', pointerEvents: 'none' }}
      >
        <div
          className="hero-meta-left absolute hidden md:block"
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
          className="hero-meta-right absolute hidden md:block"
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
        className="absolute inset-0 h-full w-full"
        style={{ zIndex: 10 }}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId}>
            <rect ref={maskRectRef} x="0" y="0" width="100" height="50" fill="white" />
            <text
              ref={leftTextRef}
              x="46%"
              y="50%"
              textAnchor="end"
              dominantBaseline="middle"
              fill="black"
              letterSpacing="0.02em"
              style={{
                fontSize: nameFontSize,
                fontFamily: 'var(--font-editorial)',
                fontWeight: 'var(--weight-bold)',
              }}
            >
              SARATH
            </text>
            <circle ref={circleRef} cx="50%" cy="50%" r={circleRadius} fill="black" />
            <text
              ref={rightTextRef}
              x="54%"
              y="50%"
              textAnchor="start"
              dominantBaseline="middle"
              fill="black"
              letterSpacing="0.02em"
              style={{
                fontSize: nameFontSize,
                fontFamily: 'var(--font-editorial)',
                fontWeight: 'var(--weight-bold)',
              }}
            >
              MENON
            </text>
          </mask>
        </defs>
        <rect
          ref={visibleRectRef}
          x="0"
          y="0"
          width="100"
          height="50"
          fill="var(--color-crimson)"
          mask={`url(#${maskId})`}
        />
      </svg>

      <div
        ref={scrollPromptRef}
        className="absolute bottom-7 left-7 z-20 hidden items-center gap-2.5 md:flex"
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: 'var(--size-label)',
          letterSpacing: 'var(--tracking-wider)',
          color: 'color-mix(in srgb, var(--color-cream) 40%, transparent)',
          textTransform: 'uppercase',
        }}
      >
        <span className="hero-scroll-bounce">↓</span>
        <span>Scroll to enter</span>
      </div>
    </section>
  );
}
