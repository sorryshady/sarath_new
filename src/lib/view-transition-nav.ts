'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import {
  clearWorkHeroTransitionNames,
  prefersReducedMotion,
  runTransition,
  setWorkHeroTransitionName,
  supportsViewTransitions,
  type TransitionVariant,
} from '@/lib/view-transition';

gsap.registerPlugin(ScrollTrigger);

type NavigateWithTransitionOptions = {
  navigate: () => void;
  variant?: TransitionVariant;
  heroSlug?: string;
  heroElement?: HTMLElement | null;
  onBeforeNavigate?: () => void | Promise<void>;
};

function killScrollTriggers() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}

function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}

async function polaroidZoomFallback(
  imageEl: HTMLElement,
  navigate: () => void,
): Promise<void> {
  const rect = imageEl.getBoundingClientRect();
  const clone = imageEl.cloneNode(true) as HTMLElement;

  clone.style.position = 'fixed';
  clone.style.top = `${rect.top}px`;
  clone.style.left = `${rect.left}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.margin = '0';
  clone.style.zIndex = '9999';
  clone.style.pointerEvents = 'none';
  clone.style.objectFit = 'cover';

  document.body.appendChild(clone);

  await gsap.to(clone, {
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    duration: 0.6,
    ease: 'power2.inOut',
  });

  navigate();
  clone.remove();
}

export async function navigateWithTransition({
  navigate,
  variant = 'default',
  heroSlug,
  heroElement,
  onBeforeNavigate,
}: NavigateWithTransitionOptions): Promise<void> {
  if (prefersReducedMotion()) {
    await onBeforeNavigate?.();
    navigate();
    return;
  }

  await onBeforeNavigate?.();

  if (heroSlug && heroElement) {
    setWorkHeroTransitionName(heroElement, heroSlug);
  }

  killScrollTriggers();

  if (supportsViewTransitions()) {
    const transition = document.startViewTransition(() => {
      runTransition(variant);
      navigate();
    });

    try {
      await transition.finished;
    } finally {
      clearWorkHeroTransitionNames();
      refreshScrollTriggers();
    }
    return;
  }

  if (variant === 'polaroid-hero' && heroElement) {
    try {
      await polaroidZoomFallback(heroElement, navigate);
    } finally {
      refreshScrollTriggers();
    }
    return;
  }

  navigate();
  refreshScrollTriggers();
}
