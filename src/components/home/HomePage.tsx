'use client';

import { useCallback, useEffect, useState } from 'react';

import { GhostBar } from '@/components/navigation/GhostBar';
import { HeroSection } from '@/components/home/HeroSection';
import { PhotographySection } from '@/components/home/photography/PhotographySection';
import { Preloader } from '@/components/home/Preloader';
import {
  dispatchHomeLayoutReady,
  HOME_SCROLL_RESTORED_EVENT,
  isReturningToHome,
} from '@/lib/home-scroll';
import type { PhotoSeries } from '@/types/photoSeries';

type HomePageProps = {
  featuredSeries: PhotoSeries[];
};

export function HomePage({ featuredSeries }: HomePageProps) {
  const [returningToHome] = useState(() => isReturningToHome());
  const [isPreloaderDone, setIsPreloaderDone] = useState(returningToHome);
  const [isVideoReady, setIsVideoReady] = useState(returningToHome);
  const [isHeroComplete, setIsHeroComplete] = useState(returningToHome);
  const [isScrollRestored, setIsScrollRestored] = useState(!returningToHome);

  const handlePreloaderComplete = useCallback(() => {
    setIsPreloaderDone(true);
  }, []);

  const handleVideoReady = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  const handleHeroComplete = useCallback((complete: boolean) => {
    setIsHeroComplete(complete);
  }, []);

  useEffect(() => {
    if (!isPreloaderDone) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        dispatchHomeLayoutReady();
      });
    });
  }, [isPreloaderDone]);

  useEffect(() => {
    if (!returningToHome) return;

    const onRestored = () => setIsScrollRestored(true);

    window.addEventListener(HOME_SCROLL_RESTORED_EVENT, onRestored, {
      once: true,
    });

    return () => {
      window.removeEventListener(HOME_SCROLL_RESTORED_EVENT, onRestored);
    };
  }, [returningToHome]);

  return (
    <>
      {!isPreloaderDone && !returningToHome && (
        <Preloader
          isVideoReady={isVideoReady}
          onComplete={handlePreloaderComplete}
        />
      )}
      <GhostBar
        isHeroComplete={isHeroComplete}
        deferUntilHeroComplete={!returningToHome}
      />
      <main>
        <HeroSection
          isPreloaderDone={isPreloaderDone}
          onVideoReady={handleVideoReady}
          onHeroComplete={handleHeroComplete}
        />

        <PhotographySection
          series={featuredSeries}
          scrollReady={isScrollRestored}
        />

        <section
          id="about"
          data-nav-theme="dark"
          className="min-h-screen"
          style={{ background: 'var(--color-crimson)' }}
          aria-label="About teaser"
        />

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
