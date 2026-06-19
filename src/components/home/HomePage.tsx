'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLenis } from 'lenis/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AboutTeaserSection } from '@/components/about/AboutTeaserSection';
import { GhostBar } from '@/components/navigation/GhostBar';
import { HeroSection } from '@/components/home/HeroSection';
import { Preloader } from '@/components/home/Preloader';
import type { AboutMeta, AboutTeaser } from '@/types/about';

export function HomePage({
  aboutTeaser = null,
  aboutMeta = null,
}: {
  aboutTeaser?: AboutTeaser | null;
  aboutMeta?: AboutMeta | null;
} = {}) {
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isHeroComplete, setIsHeroComplete] = useState(false);
  const lenis = useLenis();

  const handlePreloaderComplete = useCallback(() => {
    setIsPreloaderDone(true);
  }, []);

  const handleVideoReady = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  const handleHeroComplete = useCallback((complete: boolean) => {
    setIsHeroComplete(complete);
  }, []);

  // When the preloader exits, the hero ScrollTrigger creates a pin spacer
  // (~300vh) that grows the page. Lenis cached its scroll limit at mount and
  // doesn't know about the spacer — so it caps scroll before the hero can
  // exit. Two RAFs ensure useGSAP has run and the spacer is in the DOM.
  useEffect(() => {
    if (!isPreloaderDone) return;
    let r1: number, r2: number;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        lenis?.resize();
        ScrollTrigger.refresh();
      });
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [isPreloaderDone, lenis]);

  return (
    <>
      {!isPreloaderDone && (
        <Preloader
          isVideoReady={isVideoReady}
          onComplete={handlePreloaderComplete}
        />
      )}
      <GhostBar isHeroComplete={isHeroComplete} deferUntilHeroComplete />
      <main>
        <HeroSection
          isPreloaderDone={isPreloaderDone}
          onVideoReady={handleVideoReady}
          onHeroComplete={handleHeroComplete}
        />

        <AboutTeaserSection teaser={aboutTeaser} meta={aboutMeta} />

        <section
          id="films"
          data-nav-theme="dark"
          className="min-h-screen"
          style={{ background: 'var(--color-cinema-dark)' }}
          aria-label="Films"
        />

        <section
          id="contact"
          data-nav-theme="light"
          className="min-h-screen"
          style={{ background: 'var(--color-parchment-aged)' }}
          aria-label="Contact"
        />
      </main>
    </>
  );
}
