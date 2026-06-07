'use client';

import Image from 'next/image';
import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

import {
  consumeFromPolaroidTransition,
  removeTransitionPortal,
} from '@/lib/home-scroll';

type WorkHeroProps = {
  slug: string;
  imageSrc: string;
  imageAlt: string;
};

export function WorkHero({ slug, imageSrc, imageAlt }: WorkHeroProps) {
  const morphRef = useRef<HTMLDivElement>(null);
  const fromPolaroidRef = useRef(false);

  useLayoutEffect(() => {
    const morph = morphRef.current;
    if (!morph) return;

    fromPolaroidRef.current = consumeFromPolaroidTransition();

    if (fromPolaroidRef.current) {
      gsap.set(morph, { opacity: 1 });
      return;
    }

    gsap.fromTo(morph, { opacity: 0 }, { opacity: 1, duration: 0.6 });
  }, [slug]);

  const handleImageLoad = () => {
    if (!fromPolaroidRef.current) return;
    fromPolaroidRef.current = false;
    removeTransitionPortal();
  };

  return (
    <div
      ref={morphRef}
      data-work-hero-morph={slug}
      className="work-hero-morph relative w-full"
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        onLoad={handleImageLoad}
      />
    </div>
  );
}
