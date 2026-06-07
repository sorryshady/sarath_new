'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLenis } from 'lenis/react';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import { RevealImage } from '@/components/media/RevealImage';
import { ViewTransition } from '@/components/transitions/ViewTransition';
import { getAnimationMode } from '@/lib/animationMode';
import { markHomeReturn } from '@/lib/home-scroll';
import type { PhotoSeries } from '@/types/photoSeries';

const HERO_SIZES = '(max-width: 767px) 100vw, 55vw';

type SelectedWorkHeroProps = {
  series: PhotoSeries;
  direction: 'next' | 'prev';
};

export function SelectedWorkHero({ series, direction }: SelectedWorkHeroProps) {
  const router = useRouter();
  const lenis = useLenis();

  const [resting, setResting] = useState(series);
  const [incoming, setIncoming] = useState<PhotoSeries | null>(null);
  const [revealed, setRevealed] = useState(false);
  const incomingRef = useRef<HTMLDivElement>(null);
  const isSliding = useRef(false);

  // Detect a folder change → start a slide (or instant swap when reduced).
  useEffect(() => {
    if (series.slug === resting.slug) return;
    if (getAnimationMode() === 'reduced') {
      setResting(series);
      return;
    }
    setIncoming(series);
  }, [series, resting.slug]);

  // Animate the incoming layer over the resting one, then commit it.
  useGSAP(
    () => {
      if (!incoming) return;
      const layer = incomingRef.current;
      if (!layer) return;

      isSliding.current = true;
      gsap.fromTo(
        layer,
        { yPercent: direction === 'next' ? 100 : -100 },
        {
          yPercent: 0,
          duration: 0.7,
          ease: 'power3.inOut',
          onComplete: () => {
            setResting(incoming);
            setIncoming(null);
            isSliding.current = false;
          },
        },
      );
    },
    { dependencies: [incoming, direction] },
  );

  const open = () => {
    if (isSliding.current) return;
    const scrollY =
      typeof lenis?.scroll === 'number' ? lenis.scroll : window.scrollY;
    markHomeReturn(scrollY);
    router.push(`/work/${resting.slug}`);
  };

  return (
    <div
      className="selected-work__hero"
      role="link"
      tabIndex={0}
      aria-label={`Open ${resting.title}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
    >
      <ViewTransition name={`work-hero-${resting.slug}`} share="morph">
        <div className="selected-work__hero-layer">
          {revealed ? (
            <Image
              src={resting.coverImage}
              alt={resting.title}
              fill
              priority
              sizes={HERO_SIZES}
              className="selected-work__hero-img object-cover"
            />
          ) : (
            <RevealImage
              src={resting.coverImage}
              alt={resting.title}
              trigger="in-view"
              direction="up"
              priority
              sizes={HERO_SIZES}
              className="selected-work__hero-fill"
              imageClassName="selected-work__hero-img object-cover"
              onRevealComplete={() => setRevealed(true)}
            />
          )}
        </div>
      </ViewTransition>

      {incoming ? (
        <div
          ref={incomingRef}
          className="selected-work__hero-layer selected-work__hero-layer--incoming"
        >
          <Image
            src={incoming.coverImage}
            alt={incoming.title}
            fill
            sizes={HERO_SIZES}
            className="selected-work__hero-img object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}
