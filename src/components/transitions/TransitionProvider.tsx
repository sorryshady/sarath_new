'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useMedia } from '@/hooks/useMedia';

import './page-transition.css';

gsap.registerPlugin(ScrollTrigger);

/** Durations in seconds — mirror the --shutter-* tokens in tokens.css. */
const COVER = 0.5;
const HOLD = 0.5;
const CRACK = 0.5;
const FLASH = 0.16;
const SPLIT = 0.85;
const BACK = 0.3;
const BACK_SPLIT = 0.5;

/** Crack opens each strip by 14% of its 50vh height ≈ 7vh, per side. */
const CRACK_PCT = 14;

export type NavigateOptions = {
  /** Back-navigation: faster, no slate, no crack. */
  back?: boolean;
  /** Slate label shown on the closed shutter during the held beat. */
  label?: string;
};

type TransitionContextValue = {
  navigate: (href: string, options?: NavigateOptions) => void;
  /** True while a shutter transition is in flight. */
  isTransitioning: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error('useTransition must be used within <TransitionProvider>');
  }
  return ctx;
}

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const reduceMotion = useMedia('(prefers-reduced-motion: reduce)', false);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const slateRef = useRef<HTMLDivElement>(null);
  const pendingRef = useRef<{ href: string; back: boolean } | null>(null);

  const [slateText, setSlateText] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  /** Park the strips off-screen (top above, bottom below) and clear layers. */
  const resetShutter = useCallback(() => {
    gsap.set(topRef.current, { yPercent: -100 });
    gsap.set(botRef.current, { yPercent: 100 });
    gsap.set(scrimRef.current, { opacity: 0 });
    gsap.set(slateRef.current, { opacity: 0 });
  }, []);

  const navigate = useCallback(
    (href: string, options: NavigateOptions = {}) => {
      // Ignore re-entrancy and no-op navigations.
      if (pendingRef.current) return;
      if (href === pathname) return;

      const back = !!options.back;

      // Reduced motion: skip the shutter entirely, navigate plainly.
      if (reduceMotion) {
        router.push(href);
        return;
      }

      const root = rootRef.current;
      const top = topRef.current;
      const bot = botRef.current;
      if (!root || !top || !bot) {
        router.push(href);
        return;
      }

      pendingRef.current = { href, back };
      setIsTransitioning(true);
      setSlateText(back ? '' : options.label ?? '');

      // Prime: strips parked off-screen, scrim + slate hidden.
      root.setAttribute('data-active', '');
      resetShutter();

      const coverDur = back ? BACK : COVER;
      const tl = gsap.timeline({
        onComplete: () => {
          // Scroll reset is hidden behind the closed shutter, then navigate.
          if (lenis) lenis.scrollTo(0, { immediate: true });
          else window.scrollTo(0, 0);
          router.push(href);
        },
      });

      // COVER — the two strips snap shut to meet at centre.
      tl.to(top, { yPercent: 0, duration: coverDur, ease: 'power3.inOut' }, 0);
      tl.to(bot, { yPercent: 0, duration: coverDur, ease: 'power3.inOut' }, 0);

      // SLATE — forward only: resolve the destination name, hold the beat.
      if (!back) {
        tl.to(
          slateRef.current,
          { opacity: 1, duration: 0.3, ease: 'power2.out' },
          '-=0.15',
        );
        tl.to({}, { duration: HOLD });
      }
    },
    [pathname, reduceMotion, router, lenis, resetShutter],
  );

  // REVEAL — fires once the route has committed (pathname changed) while a
  // transition is pending. Waits two frames so the new page has painted
  // behind the shutter, then plays the focus-pull split.
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    const top = topRef.current;
    const bot = botRef.current;
    const scrim = scrimRef.current;
    const slate = slateRef.current;
    const { back } = pending;

    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const splitDur = back ? BACK_SPLIT : SPLIT;
        const tl = gsap.timeline({
          onComplete: () => {
            rootRef.current?.removeAttribute('data-active');
            resetShutter();
            pendingRef.current = null;
            setIsTransitioning(false);
            setSlateText('');
          },
        });

        // Scrim appears behind the still-closed strips (faded page beneath).
        tl.set(scrim, { opacity: 0.5 }, 0);
        if (!back) tl.to(slate, { opacity: 0, duration: 0.2, ease: 'power1.in' }, 0);

        // Forward: reluctant crack to a faded sliver, then a held flash.
        if (!back) {
          tl.to(top, { yPercent: -CRACK_PCT, duration: CRACK, ease: 'power2.in' }, 0.05);
          tl.to(bot, { yPercent: CRACK_PCT, duration: CRACK, ease: 'power2.in' }, '<');
          tl.to({}, { duration: FLASH });
        }

        // Full split + scrim fade — the page resolves soft → sharp.
        tl.to(top, { yPercent: -100, duration: splitDur, ease: 'power4.inOut' });
        tl.to(bot, { yPercent: 100, duration: splitDur, ease: 'power4.inOut' }, '<');
        tl.to(scrim, { opacity: 0, duration: splitDur * 0.7, ease: 'power2.out' }, '<');
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname, resetShutter]);

  // Recompute scroll bounds after every client navigation. The index page is
  // height:100svh/overflow:hidden, so Lenis caches a ~0 scroll limit; without
  // an explicit resize the next (tall) page won't scroll until a reload.
  useEffect(() => {
    if (!lenis) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [pathname, lenis]);

  return (
    <TransitionContext.Provider value={{ navigate, isTransitioning }}>
      {children}
      <div ref={rootRef} className="page-transition" aria-hidden="true">
        <div ref={scrimRef} className="pt-scrim" />
        <div ref={topRef} className="pt-strip pt-strip-top" />
        <div ref={botRef} className="pt-strip pt-strip-bot" />
        <div ref={slateRef} className="pt-slate">
          {slateText}
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
