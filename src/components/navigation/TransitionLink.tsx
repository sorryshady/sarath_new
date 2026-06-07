'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, type ComponentProps } from 'react';

import { navigateWithTransition } from '@/lib/view-transition-nav';
import type { TransitionVariant } from '@/lib/view-transition';

type TransitionLinkProps = ComponentProps<typeof Link> & {
  transition?: TransitionVariant;
  heroSlug?: string;
  onBeforeNavigate?: () => void | Promise<void>;
};

export function TransitionLink({
  href,
  transition = 'default',
  heroSlug,
  onBeforeNavigate,
  onClick,
  children,
  ...props
}: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      const url =
        typeof href === 'string'
          ? href
          : typeof href === 'object' && href.pathname
            ? href.pathname
            : null;

      if (
        !url ||
        url.startsWith('http') ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();

      const heroElement =
        transition === 'polaroid-hero'
          ? (event.currentTarget.querySelector(
              '[data-work-hero-morph]',
            ) as HTMLElement | null)
          : null;

      void navigateWithTransition({
        navigate: () => router.push(url),
        variant: transition,
        heroElement,
        onBeforeNavigate,
      });
    },
    [heroSlug, href, onBeforeNavigate, onClick, router, transition],
  );

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
