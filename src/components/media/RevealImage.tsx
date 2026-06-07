'use client';

import Image from 'next/image';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { getAnimationMode } from '@/lib/animationMode';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type RevealTrigger = 'in-view' | 'scroll-linked' | 'immediate';
export type RevealDirection = 'up' | 'down' | 'left' | 'right';

export interface RevealImageProps {
  src: string;
  alt: string;
  /** 'in-view' plays once on scroll-in; 'scroll-linked' scrubs to scroll; 'immediate' plays on mount. */
  trigger?: RevealTrigger;
  /** Curtain axis. 'up' reveals bottom→top (curtain pulls up). */
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  ease?: string;
  /** ScrollTrigger start for 'in-view'/'scroll-linked'. */
  start?: string;
  once?: boolean;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  onRevealComplete?: () => void;
}

// clip-path inset(top right bottom left). Each hidden state collapses the visible
// box against one edge so the reveal grows away from that edge.
const HIDDEN: Record<RevealDirection, string> = {
  up: 'inset(100% 0% 0% 0%)',
  down: 'inset(0% 0% 100% 0%)',
  left: 'inset(0% 0% 0% 100%)',
  right: 'inset(0% 100% 0% 0%)',
};
const SHOWN = 'inset(0% 0% 0% 0%)';

export function RevealImage({
  src,
  alt,
  trigger = 'in-view',
  direction = 'up',
  delay = 0,
  duration = 0.9,
  ease = 'power4.inOut',
  start = 'top 80%',
  once = true,
  fill = true,
  sizes,
  priority,
  className = '',
  imageClassName = '',
  onRevealComplete,
}: RevealImageProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = wrapRef.current;
      if (!el) return;

      if (getAnimationMode() === 'reduced') {
        gsap.set(el, { clipPath: SHOWN });
        onRevealComplete?.();
        return;
      }

      gsap.set(el, { clipPath: HIDDEN[direction] });

      if (trigger === 'immediate') {
        gsap.to(el, {
          clipPath: SHOWN,
          duration,
          delay,
          ease,
          onComplete: onRevealComplete,
        });
        return;
      }

      if (trigger === 'scroll-linked') {
        gsap.to(el, {
          clipPath: SHOWN,
          ease: 'none',
          scrollTrigger: { trigger: el, start, end: 'bottom top', scrub: true },
        });
        return;
      }

      gsap.to(el, {
        clipPath: SHOWN,
        duration,
        delay,
        ease,
        scrollTrigger: { trigger: el, start, once },
        onComplete: onRevealComplete,
      });
    },
    {
      scope: wrapRef,
      dependencies: [src, trigger, direction, delay, duration, ease, start, once],
    },
  );

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: 'relative', clipPath: HIDDEN[direction] }}
    >
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={imageClassName}
      />
    </div>
  );
}
