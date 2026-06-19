'use client';

import { useLenis } from 'lenis/react';
import { useEffect, useState } from 'react';

export type NavTheme = 'light' | 'dark';

const SECTION_TO_LINK: Record<string, string> = {
  photography: 'works',
  films: 'films',
  poetry: 'poetry',
  about: 'about',
  contact: 'contact',
};

const ROUTE_TO_LINK: Record<string, string> = {
  '/poetry': 'poetry',
  '/photography': 'works',
  '/films': 'films',
};

const ROUTE_THEME: Record<string, NavTheme> = {
  '/poetry': 'light',
  '/photography': 'dark',
  '/films': 'dark',
};

const OBSERVER_THRESHOLDS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

function resolveRouteLink(pathname: string): string | null {
  if (ROUTE_TO_LINK[pathname]) return ROUTE_TO_LINK[pathname];
  if (pathname.startsWith('/photography')) return 'works';
  return null;
}

function resolveRouteTheme(pathname: string): NavTheme {
  if (ROUTE_THEME[pathname]) return ROUTE_THEME[pathname];
  if (pathname.startsWith('/photography')) return 'dark';
  return 'light';
}

function getNavHeight(): number {
  const styles = getComputedStyle(document.documentElement);
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const token = isMobile ? '--nav-height-mobile' : '--nav-height-desktop';
  return parseInt(styles.getPropertyValue(token), 10) || 72;
}

function getThemeSwitchRatioDown(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(
    '--nav-theme-switch-ratio-down',
  );
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0.8;
}

/** Returns the section whose background sits behind the fixed ghost bar. */
function getSectionBehindNav(): HTMLElement | null {
  const navHeight = getNavHeight();
  const x = Math.round(window.innerWidth / 2);
  const y = Math.max(1, Math.round(navHeight * 0.5));

  const stack = document.elementsFromPoint(x, y);

  for (const el of stack) {
    if (el.closest('.ghost-bar, .mobile-menu, #mobile-menu')) continue;

    const section = el.closest('[data-nav-theme]');
    if (section) return section as HTMLElement;
  }

  return null;
}

function applySection(
  section: HTMLElement,
  setHomeTheme: (theme: NavTheme) => void,
  setHomeActiveLink: (link: string | null) => void,
) {
  const theme = section.dataset.navTheme as NavTheme | undefined;
  if (theme === 'light' || theme === 'dark') {
    setHomeTheme(theme);
  }

  const linkKey = SECTION_TO_LINK[section.id];
  if (linkKey) {
    setHomeActiveLink(linkKey);
  }
}

export function useNavObserver(pathname: string) {
  const lenis = useLenis();
  const isHome = pathname === '/';
  const routeLink = resolveRouteLink(pathname);
  const routeTheme = resolveRouteTheme(pathname);

  const [homeTheme, setHomeTheme] = useState<NavTheme>('light');
  const [homeActiveLink, setHomeActiveLink] = useState<string | null>(null);

  useEffect(() => {
    if (!isHome) return;

    const sections = document.querySelectorAll<HTMLElement>('[data-nav-theme]');
    if (sections.length === 0) return;

    const visibility = new Map<Element, number>();
    let activeSection: HTMLElement | null = null;
    let lastScrollY = window.scrollY;
    let scrollDirection: 'up' | 'down' = 'down';

    const pickActive = () => {
      // Theme must reflect whatever section sits physically behind the bar —
      // in BOTH scroll directions — so the nav colour never lags the
      // background it is painted over. The visibility-ratio pass below is only
      // a fallback for the rare frame where nothing resolves under the bar.
      const behindNav = getSectionBehindNav();
      if (behindNav) {
        activeSection = behindNav;
        applySection(behindNav, setHomeTheme, setHomeActiveLink);
        return;
      }

      const threshold = getThemeSwitchRatioDown();
      let bestElement: HTMLElement | undefined;
      let bestRatio = 0;

      for (const [element, ratio] of visibility) {
        if (ratio >= threshold && ratio > bestRatio) {
          bestRatio = ratio;
          bestElement = element as HTMLElement;
        }
      }

      if (bestElement) {
        activeSection = bestElement;
      }

      if (activeSection) {
        applySection(activeSection, setHomeTheme, setHomeActiveLink);
      }
    };

    const trackScrollDirection = () => {
      const y = window.scrollY;
      if (y > lastScrollY) {
        scrollDirection = 'down';
      } else if (y < lastScrollY) {
        scrollDirection = 'up';
      }
      lastScrollY = y;
      pickActive();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target, entry.intersectionRatio);
        });
        if (scrollDirection === 'down') {
          pickActive();
        }
      },
      { threshold: OBSERVER_THRESHOLDS },
    );

    sections.forEach((section) => observer.observe(section));

    trackScrollDirection();
    window.addEventListener('scroll', trackScrollDirection, { passive: true });
    window.addEventListener('resize', trackScrollDirection, { passive: true });
    lenis?.on('scroll', trackScrollDirection);

    return () => {
      observer.disconnect();
      visibility.clear();
      window.removeEventListener('scroll', trackScrollDirection);
      window.removeEventListener('resize', trackScrollDirection);
      lenis?.off('scroll', trackScrollDirection);
    };
  }, [isHome, lenis]);

  return {
    navTheme: isHome ? homeTheme : routeTheme,
    activeLink: isHome ? homeActiveLink : routeLink,
  };
}
