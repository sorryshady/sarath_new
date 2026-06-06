'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

import { useTransitionStore } from '@/store/transitionStore';

type WorkHeroProps = {
  slug: string;
  imageSrc: string;
  imageAlt: string;
};

export function WorkHero({ slug, imageSrc, imageAlt }: WorkHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useTransitionStore((s) => s.isTransitioning);
  const clearTransition = useTransitionStore((s) => s.clearTransition);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const content = hero.parentElement?.querySelector('[data-work-content]');

    const animatePageContent = () => {
      if (!content) return;
      gsap.fromTo(
        content,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      );
    };

    if (!isTransitioning) {
      gsap.fromTo(hero, { opacity: 0 }, { opacity: 1, duration: 0.6 });
      animatePageContent();
      return;
    }

    // Home page already zoomed the image to full screen before navigating.
    // Snap the work hero to full viewport instantly to avoid a flash.
    gsap.set(hero, { opacity: 1 });
    clearTransition();
    animatePageContent();
  }, [clearTransition, isTransitioning, slug]);

  return (
    <div
      ref={heroRef}
      data-work-hero
      className="relative h-[70vh] w-full md:h-screen"
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
