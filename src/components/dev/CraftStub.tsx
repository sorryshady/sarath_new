/**
 * TEMPORARY Phase-0 scaffold. A bare full-viewport page that cross-links the
 * three craft routes through the crimson shutter so the transition can be
 * verified end-to-end. Each of these routes will be replaced by its real
 * section build (Films, Photography, Poetry) in later phases.
 */
import { TransitionLink } from '@/components/transitions/TransitionLink';

const CRAFTS = [
  { href: '/films', label: 'Films' },
  { href: '/photography', label: 'Photography' },
  { href: '/poetry', label: 'Poetry' },
];

type CraftStubProps = {
  name: string;
  background?: string;
  foreground?: string;
};

export function CraftStub({
  name,
  background = 'var(--color-cinema-dark)',
  foreground = 'var(--color-parchment-text)',
}: CraftStubProps) {
  return (
    <main
      style={{
        minHeight: '100svh',
        background,
        color: foreground,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        padding: '2rem',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--size-series-title)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-widest)',
        }}
      >
        {name}
      </h1>
      <nav
        style={{
          display: 'flex',
          gap: '1.75rem',
          fontFamily: 'var(--font-data)',
          fontSize: 'var(--size-nav)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--tracking-label)',
        }}
      >
        {CRAFTS.filter((c) => c.label !== name).map((c) => (
          <TransitionLink key={c.href} href={c.href} label={c.label}>
            {c.label}
          </TransitionLink>
        ))}
        <TransitionLink href="/" label="Home" back>
          ← Home
        </TransitionLink>
      </nav>
    </main>
  );
}
