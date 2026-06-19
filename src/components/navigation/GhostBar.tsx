'use client';

import { useLenis } from 'lenis/react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { useNavObserver } from '@/hooks/useNavObserver';
import { useMedia } from '@/hooks/useMedia';

import Link from 'next/link';
import './ghost-bar.css';

gsap.registerPlugin(ScrollTrigger);

/** Scroll position where `el` top meets the viewport top (GSAP pin-aware). */
function getSectionScrollTop(el: HTMLElement): number {
  ScrollTrigger.refresh();

  const trigger = ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: 'bottom top',
  });

  const scrollTop = trigger.start;
  trigger.kill();

  return scrollTop;
}

export type GhostBarProps = {
  /** When true, the hero scroll sequence has finished and the nav may appear. */
  isHeroComplete?: boolean;
  /** Home page only — hide until hero completes, then slide in. */
  deferUntilHeroComplete?: boolean;
};

type NavItem = {
  id: string;
  label: string;
  href: string;
  sectionId?: string;
};

// Order mirrors the home scroll: Films → Works → Poetry → About → Contact.
const NAV_ITEMS: NavItem[] = [
  { id: 'films', label: 'Films', href: '/#films', sectionId: 'films' },
  { id: 'works', label: 'Works', href: '/#photography', sectionId: 'photography' },
  { id: 'poetry', label: 'Poetry', href: '/poetry' },
  { id: 'about', label: 'About', href: '/about', sectionId: 'about' },
  { id: 'contact', label: 'Contact', href: '/#contact', sectionId: 'contact' },
];

function NavLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      aria-hidden
      width={80}
      height={112}
      className={className}
      priority
    />
  );
}

function NavBrand({
  className,
  logoClassName,
  initialsClassName,
  onClick,
}: {
  className?: string;
  logoClassName?: string;
  initialsClassName?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      className={className}
      onClick={onClick}
      transitionTypes={['nav-back']}
    >
      <NavLogo className={logoClassName} />
      {/* <span className={initialsClassName}>SM</span> */}
      <span className="sr-only">Sarath Menon home</span>
    </Link>
  );
}

export function GhostBar({
  isHeroComplete = true,
  deferUntilHeroComplete = false,
}: GhostBarProps) {
  const pathname = usePathname();
  const lenis = useLenis();
  const isMobile = useMedia('(max-width: 767px)', false);
  const { navTheme, activeLink } = useNavObserver(pathname);

  const navRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const hasEnteredOnceRef = useRef(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOverlayMounted, setIsOverlayMounted] = useState(false);

  const shouldShow = deferUntilHeroComplete ? isHeroComplete : true;

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    if (!deferUntilHeroComplete) {
      gsap.set(nav, { opacity: 1, y: 0 });
      nav.classList.add('ghost-bar--visible');
      return;
    }

    if (shouldShow) {
      nav.classList.add('ghost-bar--visible');
      const isFirstEntry = !hasEnteredOnceRef.current;
      hasEnteredOnceRef.current = true;

      gsap.to(nav, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
        delay: isFirstEntry ? 0.2 : 0,
        overwrite: true,
      });
      return;
    }

    nav.classList.remove('ghost-bar--visible');
    gsap.to(nav, {
      opacity: 0,
      y: '-100%',
      duration: 0.45,
      ease: 'power3.in',
      overwrite: true,
    });
  }, [shouldShow, deferUntilHeroComplete]);

  useEffect(() => {
    if (!isMenuOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const el = document.getElementById(sectionId);
      if (!el) return;

      const targetY = getSectionScrollTop(el);

      if (lenis) {
        lenis.scrollTo(targetY, { duration: 1.2 });
      } else {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    },
    [lenis],
  );

  const handleSectionClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
      if (!item.sectionId || pathname !== '/') return;
      event.preventDefault();
      scrollToSection(item.sectionId);
    },
    [pathname, scrollToSection],
  );

  const openMenu = useCallback(() => {
    if (!shouldShow) return;
    setIsOverlayMounted(true);
    setIsMenuOpen(true);
  }, [shouldShow]);

  const closeMenu = useCallback(() => {
    const overlay = overlayRef.current;
    const links = linksRef.current?.querySelectorAll('.mobile-menu__link');
    if (!overlay) {
      setIsMenuOpen(false);
      setIsOverlayMounted(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsMenuOpen(false);
        setIsOverlayMounted(false);
      },
    });

    if (links && links.length > 0) {
      tl.to(links, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
    }

    tl.to(
      overlay,
      {
        y: '100%',
        duration: 0.45,
        ease: 'power3.in',
      },
      links && links.length > 0 ? '-=0.05' : 0,
    );
  }, []);

  useEffect(() => {
    if (!isMenuOpen || !isOverlayMounted) return;

    const overlay = overlayRef.current;
    const links = linksRef.current?.querySelectorAll('.mobile-menu__link');
    if (!overlay) return;

    gsap.set(overlay, { y: '100%' });
    if (links) gsap.set(links, { opacity: 0, y: 24 });

    const tl = gsap.timeline();
    tl.to(overlay, {
      y: 0,
      duration: 0.5,
      ease: 'power3.out',
    });

    if (links && links.length > 0) {
      tl.to(links, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.07,
      }, 0.75);
    }
  }, [isMenuOpen, isOverlayMounted]);

  const handleMobileLinkClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
      if (item.sectionId && pathname === '/') {
        event.preventDefault();
        closeMenu();
        setTimeout(() => scrollToSection(item.sectionId!), 500);
        return;
      }
      closeMenu();
    },
    [closeMenu, pathname, scrollToSection],
  );

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Primary"
        className="ghost-bar"
        data-theme={navTheme}
        style={{ viewTransitionName: 'ghost-bar' }}
      >
        <NavBrand
          className="ghost-bar__brand"
          logoClassName="ghost-bar__logo"
          initialsClassName="ghost-bar__initials"
        />

        <ul className="ghost-bar__links">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`ghost-bar__link${activeLink === item.id ? ' ghost-bar__link--active' : ''}`}
                transitionTypes={['nav-forward']}
                onClick={(event) => handleSectionClick(event, item)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="ghost-bar__menu-trigger"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Open menu"
          onClick={openMenu}
        >
          <span className="ghost-bar__burger" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </nav>

      {isOverlayMounted && (
        <div
          ref={overlayRef}
          id="mobile-menu"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div className="mobile-menu__header">
            <NavBrand
              className="mobile-menu__brand"
              logoClassName="mobile-menu__logo"
              initialsClassName="mobile-menu__initials"
              onClick={closeMenu}
            />
            <button
              type="button"
              className="mobile-menu__close"
              onClick={closeMenu}
            >
              ✕ Close
            </button>
          </div>

          <div ref={linksRef} className="mobile-menu__links">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`mobile-menu__link${activeLink === item.id ? ' mobile-menu__link--active' : ''}`}
                transitionTypes={['nav-forward']}
                onClick={(event) => handleMobileLinkClick(event, item)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mobile-menu__meta">
            <span>Photographer · Filmmaker · Poet</span>
            <span>London</span>
          </div>
        </div>
      )}
    </>
  );
}
