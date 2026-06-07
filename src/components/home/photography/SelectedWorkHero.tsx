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

  // Detect a folder change → start the curtain glide (or instant swap when reduced).
  useEffect(() => {
    if (series.slug === resting.slug) return;
    if (getAnimationMode() === 'reduced') {
      setResting(series);
      return;
    }
    setIncoming(series);
  }, [series, resting.slug]);

  // Reveal the incoming image with a clip-path curtain + parallax glide, then commit it.
  useGSAP(
    () => {
      if (!incoming) return;
      const layer = incomingRef.current;
      if (!layer) return;
      const inner = layer.querySelector('.selected-work__hero-parallax');

      isSliding.current = true;

      // next → curtain pulls up (reveals bottom→top); prev → pulls down.
      const hidden =
        direction === 'next' ? 'inset(100% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)';
      const glide = direction === 'next' ? 14 : -14;

      const tl = gsap.timeline({
        onComplete: () => {
          setResting(incoming);
          setIncoming(null);
          isSliding.current = false;
        },
      });

      gsap.set(layer, { clipPath: hidden });
      gsap.set(inner, { yPercent: glide, scale: 1.14 });
      tl.to(
        layer,
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut' },
        0,
      );
      tl.to(
        inner,
        { yPercent: 0, scale: 1, duration: 1.2, ease: 'power4.inOut' },
        0,
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
          <div className="selected-work__hero-parallax">
            <Image
              src={incoming.coverImage}
              alt={incoming.title}
              fill
              sizes={HERO_SIZES}
              className="selected-work__hero-img object-cover"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
