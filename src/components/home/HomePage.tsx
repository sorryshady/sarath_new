'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLenis } from 'lenis/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AboutTeaserSection } from '@/components/about/AboutTeaserSection';
import { ContactSection } from '@/components/contact/ContactSection';
import { FilmsTeaserSection } from '@/components/home/FilmsTeaserSection';
import { GhostBar } from '@/components/navigation/GhostBar';
import { HeroSection } from '@/components/home/HeroSection';
import { PhotographyTeaserSection } from '@/components/home/PhotographyTeaserSection';
import { PoetryTeaserSection } from '@/components/home/PoetryTeaserSection';
import { Preloader } from '@/components/home/Preloader';
import type { AboutMeta, AboutTeaser } from '@/types/about';
import type { ContactSettings } from '@/types/contact';
import type { Film } from '@/types/film';
import type { PhotoSeries } from '@/types/photoSeries';
import type { PoetryTeaser } from '@/types/poetryTeaser';

export function HomePage({
  films = [],
  photoSeries = [],
  poetryTeaser = null,
  aboutTeaser = null,
  aboutMeta = null,
  contactSettings = null,
}: {
  films?: Film[];
  photoSeries?: PhotoSeries[];
  poetryTeaser?: PoetryTeaser | null;
  aboutTeaser?: AboutTeaser | null;
  aboutMeta?: AboutMeta | null;
  contactSettings?: ContactSettings | null;
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

        <FilmsTeaserSection films={films} />

        <PhotographyTeaserSection series={photoSeries} />

        <PoetryTeaserSection teaser={poetryTeaser} />

        <AboutTeaserSection teaser={aboutTeaser} meta={aboutMeta} />

        <ContactSection settings={contactSettings} />
      </main>
    </>
  );
}
