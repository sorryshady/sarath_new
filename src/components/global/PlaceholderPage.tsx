import type { Metadata } from 'next';

import Copy from '@/components/copy/Copy';
import { GhostBar } from '@/components/navigation/GhostBar';

type PlaceholderPageProps = {
  title: string;
  description: string;
  background?: string;
  foreground?: string;
  navTheme?: 'light' | 'dark';
};

export function PlaceholderPage({
  title,
  description,
  background = 'var(--color-cream)',
  foreground = 'var(--color-ink)',
  navTheme = 'light',
}: PlaceholderPageProps) {
  return (
    <>
      <GhostBar />
      <main
        data-nav-theme={navTheme}
        className="flex min-h-screen flex-col justify-center px-6 py-32 md:px-16"
        style={{ background, color: foreground }}
      >
        <Copy animateOnScroll={false}>
          <h1
            style={{
              fontFamily: 'var(--font-editorial)',
              fontSize: 'var(--size-section-title)',
              fontWeight: 'var(--weight-light)',
            }}
          >
            {title}
          </h1>
        </Copy>
        <p
          className="mt-6 max-w-lg"
          style={{
            fontFamily: 'var(--font-data)',
            fontSize: 'var(--size-label)',
            letterSpacing: 'var(--tracking-wide)',
            textTransform: 'uppercase',
            color: 'var(--color-ink-45)',
          }}
        >
          {description}
        </p>
      </main>
    </>
  );
}

export function placeholderMetadata(title: string, description: string): Metadata {
  return { title, description };
}
