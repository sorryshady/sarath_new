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

/** Stack fan rotation per card — random between -8 and +8 degrees. */
export function getStackRotation(index: number): number {
  const seed = (index + 1) * 17;
  const normalized = ((seed * 9301 + 49297) % 233280) / 233280;
  return normalized * 16 - 8;
}
