'use client';

import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useMedia } from '@/hooks/useMedia';

// Wire Lenis scroll events into ScrollTrigger so GSAP triggers stay in sync
// with Lenis's smooth scroll position instead of native window.scrollY.
function LenisScrollTriggerSync() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    lenis.on('scroll', ScrollTrigger.update);
    return () => {
      lenis.off('scroll', ScrollTrigger.update);
    };
  }, [lenis]);
  return null;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduceMotion = useMedia('(prefers-reduced-motion: reduce)', false);

  if (reduceMotion) {
    return children;
  }

  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true }}>
      <LenisScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
