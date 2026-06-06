'use client';

import { useCallback, useState } from 'react';

import { HeroSection } from '@/components/home/HeroSection';
import { Preloader } from '@/components/home/Preloader';

export function HomePage() {
  const [isPreloaderDone, setIsPreloaderDone] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isHeroComplete, setIsHeroComplete] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    setIsPreloaderDone(true);
  }, []);

  const handleVideoReady = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  const handleHeroComplete = useCallback(() => {
    setIsHeroComplete(true);
  }, []);

  return (
    <>
      {!isPreloaderDone && (
        <Preloader
          isVideoReady={isVideoReady}
          onComplete={handlePreloaderComplete}
        />
      )}
      <main>
        <HeroSection
          isPreloaderDone={isPreloaderDone}
          onVideoReady={handleVideoReady}
          onHeroComplete={handleHeroComplete}
        />
        {/* GhostBar + remaining sections wired as isHeroComplete unlocks nav */}
        {!isHeroComplete && (
          <span className="sr-only" aria-live="polite">
            Hero sequence in progress
          </span>
        )}
      </main>
    </>
  );
}
