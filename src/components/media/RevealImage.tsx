'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type RevealVariant = 'lift' | 'develop' | 'rackFocus';

type RevealImageProps = {
  src: string;
  alt?: string;
  className?: string;
  /** Aspect ratio for the frame (reserves height so ScrollTrigger measures right). */
  aspectRatio?: number;
  /** 'lift' = clip + rise (default); 'develop' = darkroom emerge (brightness/blur). */
  variant?: RevealVariant;
  /** Upward travel distance in px (lift variant). */
  distance?: number;
  /** ScrollTrigger start. */
  start?: string;
  /** Fill the parent (cover, 100% height) instead of using aspectRatio — for full-bleed panels. */
  fill?: boolean;
};

/**
 * Reusable scroll reveal. `lift` clips + lifts the frame; `develop` brings it
 * up out of near-black + blur like a print developing. Reduced-motion shows
 * it immediately.
 */
export function RevealImage({
  src,
  alt = '',
  className,
  aspectRatio,
  variant = 'lift',
  distance = 48,
  start = 'top 85%',
  fill = false,
}: RevealImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const img = wrap.querySelector('img');

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(wrap, {
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          y: 0,
          filter: 'none',
        });
        if (img) gsap.set(img, { scale: 1 });
        return;
      }

      // rackFocus is scroll-LINKED (scrub): the frame pulls from defocused to
      // sharp as the section travels through the viewport — a literal rack focus.
      if (variant === 'rackFocus') {
        const rtl = gsap.timeline({
          scrollTrigger: { trigger: wrap, start: 'top 85%', end: 'center 55%', scrub: true },
        });
        rtl.fromTo(
          wrap,
          { filter: 'blur(18px)', opacity: 0.45 },
          { filter: 'blur(0px)', opacity: 1, ease: 'none' },
          0,
        );
        if (img) {
          rtl.fromTo(img, { scale: 1.08 }, { scale: 1, ease: 'none' }, 0);
        }
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: wrap, start, once: true },
      });

      if (variant === 'develop') {
        tl.fromTo(
          wrap,
          { opacity: 0, filter: 'brightness(0.25) contrast(1.3) blur(12px)' },
          {
            opacity: 1,
            filter: 'brightness(1) contrast(1) blur(0px)',
            duration: 1.2,
            ease: 'power2.out',
          },
          0,
        );
        if (img) {
          tl.fromTo(
            img,
            { scale: 1.08 },
            { scale: 1, duration: 1.3, ease: 'power3.out' },
            0,
          );
        }
        return;
      }

      tl.fromTo(
        wrap,
        { opacity: 0, y: distance, clipPath: 'inset(14% 0% 14% 0%)' },
        {
          opacity: 1,
          y: 0,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1,
          ease: 'power3.out',
        },
        0,
      );
      if (img) {
        tl.fromTo(
          img,
          { scale: 1.1 },
          { scale: 1, duration: 1.2, ease: 'power3.out' },
          0,
        );
      }
    },
    { scope: wrapRef, dependencies: [variant] },
  );

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        overflow: 'hidden',
        ...(fill ? { width: '100%', height: '100%' } : null),
        ...(aspectRatio && !fill ? { aspectRatio: String(aspectRatio) } : null),
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="eager"
        onLoad={() => ScrollTrigger.refresh()}
        style={{
          display: 'block',
          width: '100%',
          height: fill || aspectRatio ? '100%' : 'auto',
          objectFit: 'cover',
        }}
      />
    </div>
  );
}
