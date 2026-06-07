'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';

import {
  consumeHomeScrollRestore,
  dispatchHomeScrollRestored,
  HOME_LAYOUT_READY_EVENT,
  HOME_SCROLL_RESTORED_EVENT,
  isReturningToHome,
} from '@/lib/home-scroll';

gsap.registerPlugin(ScrollTrigger);

function scrollToY(y: number, lenis: ReturnType<typeof useLenis>) {
  if (lenis) {
    lenis.scrollTo(y, { immediate: true });
  } else {
    window.scrollTo(0, y);
  }
}

function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}

export function ScrollRestoration() {
  const pathname = usePathname();
  const lenis = useLenis();

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    if (pathname !== '/') {
      scrollToY(0, lenis);
      refreshScrollTriggers();
      return;
    }

    if (!isReturningToHome()) {
      scrollToY(0, lenis);
      refreshScrollTriggers();
      dispatchHomeScrollRestored();
      return;
    }

    let cancelled = false;
    let restored = false;

    const finishRestore = () => {
      if (cancelled || restored) return;
      restored = true;

      refreshScrollTriggers();

      const targetY = consumeHomeScrollRestore() ?? 0;
      scrollToY(targetY, lenis);

      requestAnimationFrame(() => {
        refreshScrollTriggers();
        dispatchHomeScrollRestored();
      });
    };

    const onReady = () => finishRestore();

    window.addEventListener(HOME_LAYOUT_READY_EVENT, onReady, { once: true });

    const fallbackId = window.setTimeout(finishRestore, 800);

    return () => {
      cancelled = true;
      window.removeEventListener(HOME_LAYOUT_READY_EVENT, onReady);
      window.clearTimeout(fallbackId);
    };
  }, [pathname, lenis]);

  useLayoutEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && pathname === '/') {
        refreshScrollTriggers();
        window.dispatchEvent(new CustomEvent(HOME_SCROLL_RESTORED_EVENT));
      }
    };

    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, [pathname]);

  return null;
}
