export const VIEW_TRANSITION_MS = 1500;
/** Work page hero height — morph target for polaroid → work transitions. */
export const WORK_HERO_VH = 75;
export const WORK_HERO_MORPH_MS = 650;
/** When page-enter animations start relative to the route transition (0–1). */
export const PAGE_ENTER_AT = 0.58;
export const PAGE_ENTER_BUFFER_S = 0;

/** Stagger offsets from the page-enter sync point (seconds). */
export const ENTER = {
  headline: 0.1,
  subtext: 0.22,
  cta: 0.34,
  image: 0.05,
  liveLink: 0.28,
  /** Work grid — starts mid headline reveal, not after copy finishes. */
  cards: 0.45,
} as const;

export const ENTER_DURATION = 0.75;
export const ENTER_STAGGER = 0.06;
export const ENTER_EASE = 'power4.out';

const NAV_TRANSITION_KEY = 'sm-vt-start';

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    callback: () => void | Promise<void>,
  ) => { finished: Promise<void> };
  activeViewTransition?: { finished: Promise<void> };
};

export type TransitionVariant =
  | 'default'
  | 'polaroid-hero'
  | 'poetry'
  | 'about';

export function workHeroTransitionName(slug: string): string {
  return `work-hero-${slug}`;
}

export function setWorkHeroTransitionName(
  element: HTMLElement,
  slug: string,
): void {
  element.style.viewTransitionName = workHeroTransitionName(slug);
}

export function workHeroMorphSelector(slug: string): string {
  return `[data-work-hero-morph="${CSS.escape(slug)}"]`;
}

export function clearWorkHeroTransitionNames(): void {
  if (typeof document === 'undefined') return;

  document.querySelectorAll('[data-work-hero-morph]').forEach((node) => {
    if (node instanceof HTMLElement) {
      node.style.viewTransitionName = '';
    }
  });
}

/**
 * Next.js renders the destination route asynchronously. The View Transitions
 * callback must not resolve until the work hero morph target exists in the DOM
 * with a matching view-transition-name.
 */
export function waitForWorkHeroMorph(
  slug: string,
  timeoutMs = 4000,
): Promise<HTMLElement | null> {
  if (typeof document === 'undefined') return Promise.resolve(null);

  const selector = workHeroMorphSelector(slug);
  const existing = document.querySelector(selector);
  if (existing instanceof HTMLElement) {
    return Promise.resolve(existing);
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (el: HTMLElement | null) => {
      if (settled) return;
      settled = true;
      observer.disconnect();
      window.clearTimeout(timeoutId);
      resolve(el);
    };

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el instanceof HTMLElement) {
        finish(el);
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const timeoutId = window.setTimeout(() => finish(null), timeoutMs);
  });
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function supportsViewTransitions(): boolean {
  if (typeof document === 'undefined') return false;
  return typeof (document as DocumentWithViewTransition).startViewTransition ===
    'function';
}

/**
 * Wait until page-enter animations should begin — overlapped with the route
 * transition so content reveals as the new page clip finishes, not after a pause.
 */
export async function waitForPageEnter(): Promise<void> {
  if (typeof document === 'undefined') return;

  const startedAt = sessionStorage.getItem(NAV_TRANSITION_KEY);

  if (!startedAt) {
    const doc = document as DocumentWithViewTransition;
    if (doc.activeViewTransition) {
      const targetMs = VIEW_TRANSITION_MS * PAGE_ENTER_AT;
      await new Promise((resolve) => setTimeout(resolve, targetMs));
    }
    return;
  }

  const targetMs = VIEW_TRANSITION_MS * PAGE_ENTER_AT;
  const elapsed = Date.now() - Number(startedAt);
  const remaining = Math.max(0, targetMs - elapsed);

  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}

export function slideInOut() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(NAV_TRANSITION_KEY, String(Date.now()));
  }

  document.documentElement.animate(
    [
      {
        opacity: 1,
        transform: 'translateY(0) scale(1)',
      },
      {
        opacity: 0.2,
        transform: 'translateY(-30%) scale(0.90)',
      },
    ],
    {
      duration: VIEW_TRANSITION_MS,
      easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
      fill: 'forwards',
      pseudoElement: '::view-transition-old(root)',
    },
  );

  document.documentElement.animate(
    [
      {
        clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
      },
      {
        clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)',
      },
    ],
    {
      duration: VIEW_TRANSITION_MS,
      easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
      fill: 'forwards',
      pseudoElement: '::view-transition-new(root)',
    },
  );

  window.setTimeout(() => {
    sessionStorage.removeItem(NAV_TRANSITION_KEY);
  }, VIEW_TRANSITION_MS + 100);
}

export function runTransition(variant: TransitionVariant) {
  switch (variant) {
    case 'polaroid-hero':
      // Handled by GSAP portal zoom in view-transition-nav — no root wipe.
      return;
    case 'default':
    default:
      slideInOut();
  }
}
