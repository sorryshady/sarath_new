'use client';

import Image from 'next/image';

import { ViewTransition } from '@/components/transitions/ViewTransition';

type WorkHeroProps = {
  slug: string;
  imageSrc: string;
  imageAlt: string;
  aspectRatio: number;
};

export function WorkHero({ slug, imageSrc, imageAlt, aspectRatio }: WorkHeroProps) {
  return (
    <ViewTransition name={`work-hero-${slug}`} share="morph">
      <div
        className="work-hero-morph relative"
        style={{
          aspectRatio: String(aspectRatio),
          width: `min(100%, calc(92svh * ${aspectRatio}))`,
          marginInline: 'auto',
        }}
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
    </ViewTransition>
  );
}
