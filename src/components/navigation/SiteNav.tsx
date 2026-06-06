import { TransitionLink } from '@/components/navigation/TransitionLink';

const links = [
  { href: '/', label: 'Home' },
  { href: '/works', label: 'Works' },
  { href: '/films', label: 'Films' },
  { href: '/poetry', label: 'Poetry' },
  { href: '/about', label: 'About' },
] as const;

export function SiteNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed top-0 left-0 right-0 z-[var(--z-nav)] flex items-center justify-between px-6 py-5 md:px-16"
      style={{ fontFamily: 'var(--font-data)' }}
    >
      <TransitionLink
        href="/"
        className="text-[var(--size-nav)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-parchment-text)] mix-blend-difference"
      >
        Sarath Menon
      </TransitionLink>
      <ul className="flex gap-6 md:gap-8">
        {links.slice(1).map(({ href, label }) => (
          <li key={href}>
            <TransitionLink
              href={href}
              className="text-[var(--size-nav)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-parchment-text)] mix-blend-difference transition-opacity hover:opacity-70"
            >
              {label}
            </TransitionLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
