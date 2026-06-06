'use client';

import Image from 'next/image';
import { useCallback, useRef } from 'react';

import { TransitionLink } from '@/components/navigation/TransitionLink';

type PolaroidTransitionLinkProps = {
  href: string;
  slug: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  className?: string;
  onBeforeNavigate?: () => void | Promise<void>;
};

export function PolaroidTransitionLink({
  href,
  slug,
  title,
  imageSrc,
  imageAlt,
  className,
  onBeforeNavigate,
}: PolaroidTransitionLinkProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleBeforeNavigate = useCallback(async () => {
    const card = cardRef.current?.querySelector('a');
    if (!card) return;

    const gsap = (await import('gsap')).default;
    const border = card.querySelector('.polaroid-border');
    const caption = card.querySelector('.polaroid-caption');

    const fadeTargets = [border, caption].filter(Boolean);
    if (fadeTargets.length > 0) {
      gsap.to(fadeTargets, { opacity: 0, duration: 0.15 });
    }

    const section = card.closest('[data-photography-section]');
    if (section) {
      const siblings = section.querySelectorAll('[data-polaroid-card]');
      siblings.forEach((el) => {
        if (el !== cardRef.current) {
          gsap.to(el, { opacity: 0, duration: 0.15 });
        }
      });
    }

    await onBeforeNavigate?.();
  }, [onBeforeNavigate]);

  return (
    <div ref={cardRef} data-polaroid-card className={className}>
      <TransitionLink
        href={href}
        transition="polaroid-hero"
        heroSlug={slug}
        onBeforeNavigate={handleBeforeNavigate}
        className="block"
      >
        <span className="polaroid-border block border-[6px] border-b-[20px] border-white bg-white">
          <span
            className="polaroid-image relative block aspect-[3/4] overflow-hidden"
            data-work-hero
          >
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 200px, 180px"
              className="object-cover"
            />
          </span>
        </span>
        <span className="polaroid-caption mt-2 block text-center text-xs uppercase tracking-widest">
          {title}
        </span>
      </TransitionLink>
    </div>
  );
}
