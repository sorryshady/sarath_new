'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import { workHeroTransitionName } from '@/lib/view-transition';

type WorkHeroProps = {
  slug: string;
  imageSrc: string;
  imageAlt: string;
};

export function WorkHero({ slug, imageSrc, imageAlt }: WorkHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    hero.style.viewTransitionName = workHeroTransitionName(slug);

    return () => {
      hero.style.viewTransitionName = '';
    };
  }, [slug]);

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
