'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { markFromPolaroidTransition } from '@/lib/home-scroll';
import {
  prefersReducedMotion,
  runTransition,
  supportsViewTransitions,
  VIEW_TRANSITION_MS,
  WORK_HERO_MORPH_MS,
  WORK_HERO_VH,
  type TransitionVariant,
} from '@/lib/view-transition';

const NAV_TRANSITION_KEY = 'sm-vt-start';

gsap.registerPlugin(ScrollTrigger);

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    callback: () => void | Promise<void>,
  ) => { finished: Promise<void> };
};

type NavigateWithTransitionOptions = {
  navigate: () => void;
  variant?: TransitionVariant;
  heroSlug?: string;
  heroElement?: HTMLElement | null;
  heroImageSrc?: string;
  onBeforeNavigate?: () => void | Promise<void>;
};

function killPhotographyScrollTriggers() {
  const section = document.querySelector('[data-photography-section]');
  if (!section) return;

  ScrollTrigger.getAll().forEach((trigger) => {
    const el = trigger.trigger;
    if (el === section || (el instanceof Element && section.contains(el))) {
      trigger.kill();
    }
  });
}

function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}

function markTransitionStart(): void {
  sessionStorage.setItem(NAV_TRANSITION_KEY, String(Date.now()));
}

/**
 * GSAP portal zoom — the polaroid image expands to the work hero rect, then we
 * navigate. The portal stays on `document.body` until WorkHero mounts and
 * removes it, so there is no blank frame between routes.
 */
async function polaroidHeroTransition(
  morphEl: HTMLElement,
  imageSrc: string | undefined,
  navigate: () => void,
): Promise<void> {
  const rect = morphEl.getBoundingClientRect();
  const imgEl = morphEl.querySelector('img');
  const src = imgEl?.currentSrc || imgEl?.src || imageSrc;

  if (!src) {
    navigate();
    return;
  }

  if (imgEl) {
    gsap.set(imgEl, { opacity: 0 });
  }

  const portal = document.createElement('img');
  portal.src = src;
  portal.setAttribute('data-transition-portal', 'true');
  portal.style.cssText = [
    'position:fixed',
    `top:${rect.top}px`,
    `left:${rect.left}px`,
    `width:${rect.width}px`,
    `height:${rect.height}px`,
    'object-fit:cover',
    'z-index:9995',
    'pointer-events:none',
    'margin:0',
    'padding:0',
    'border:none',
  ].join(';');

  document.body.appendChild(portal);

  if (!portal.complete) {
    await new Promise<void>((resolve) => {
      portal.onload = () => resolve();
      portal.onerror = () => resolve();
    });
  }

  markTransitionStart();

  await gsap.to(portal, {
    top: 0,
    left: 0,
    width: window.innerWidth,
    height: (window.innerHeight * WORK_HERO_VH) / 100,
    duration: WORK_HERO_MORPH_MS / 1000,
    ease: 'power3.inOut',
  });

  markFromPolaroidTransition();
  navigate();
}

export async function navigateWithTransition({
  navigate,
  variant = 'default',
  heroElement,
  heroImageSrc,
  onBeforeNavigate,
}: NavigateWithTransitionOptions): Promise<void> {
  if (prefersReducedMotion()) {
    await onBeforeNavigate?.();
    navigate();
    return;
  }

  await onBeforeNavigate?.();
  killPhotographyScrollTriggers();

  // Polaroid → work: GSAP portal zoom only (no View Transition root wipe).
  if (variant === 'polaroid-hero' && heroElement) {
    try {
      await polaroidHeroTransition(heroElement, heroImageSrc, navigate);
    } finally {
      refreshScrollTriggers();
    }
    return;
  }

  const doc = document as DocumentWithViewTransition;

  if (supportsViewTransitions() && doc.startViewTransition) {
    const transition = doc.startViewTransition(async () => {
      runTransition(variant);
      navigate();
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
    });

    try {
      await transition.finished;
    } finally {
      refreshScrollTriggers();
    }
    return;
  }

  navigate();
  refreshScrollTriggers();
}

export { NAV_TRANSITION_KEY, VIEW_TRANSITION_MS };
