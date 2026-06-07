export type AnimationMode = 'full' | 'reduced';

export function getAnimationMode(): AnimationMode {
  if (typeof window === 'undefined') return 'full';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'reduced';
  }

  if (navigator.hardwareConcurrency < 4) {
    return 'reduced';
  }

  return 'full';
}