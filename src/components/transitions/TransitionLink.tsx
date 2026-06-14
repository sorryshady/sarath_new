'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import gsap from 'gsap';

import { useTransition, type NavigateOptions } from './TransitionProvider';

type TransitionLinkProps = {
  href: string;
  /** Slate label shown during the cover. Defaults to the link's text. */
  label?: string;
  /** Back-navigation variant: faster, slate-less, exits off the bottom. */
  back?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function TransitionLink({
  href,
  label,
  back,
  className,
  children,
}: TransitionLinkProps) {
  const { navigate } = useTransition();

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Let modified clicks (new tab, etc.) behave natively.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();

      // The clicked label nudges up as the cover comes in.
      gsap.to(e.currentTarget, {
        y: -8,
        duration: 0.28,
        ease: 'power2.out',
      });

      const options: NavigateOptions = { back };
      if (label !== undefined) options.label = label;
      else if (typeof children === 'string') options.label = children;
      navigate(href, options);
    },
    [href, label, back, children, navigate],
  );

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
