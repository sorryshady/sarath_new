'use client';

import Image from 'next/image';

import { ViewTransition } from '@/components/transitions/ViewTransition';

type WorkHeroProps = {
  slug: string;
  imageSrc: string;
  imageAlt: string;
};

export function WorkHero({ slug, imageSrc, imageAlt }: WorkHeroProps) {
  return (
    <ViewTransition name={`work-hero-${slug}`} share="morph">
      <div className="work-hero-morph relative h-[85vh] w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
    </ViewTransition>
  );
}
