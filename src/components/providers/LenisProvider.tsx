'use client';

import { ReactLenis } from 'lenis/react';

import { useMedia } from '@/hooks/useMedia';

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduceMotion = useMedia('(prefers-reduced-motion: reduce)', false);

  if (reduceMotion) {
    return children;
  }

  return (
    <ReactLenis root options={{ lerp: 0.08, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
