'use client';

import { useCallback, useState } from 'react';

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

  const handlePreloaderComplete = useCallback(() => {
    setIsPreloaderDone(true);
  }, []);

  const handleVideoReady = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  const handleHeroComplete = useCallback((complete: boolean) => {
    setIsHeroComplete(complete);
  }, []);

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
