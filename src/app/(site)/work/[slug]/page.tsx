import { notFound } from 'next/navigation';

import Copy from '@/components/copy/Copy';
import { SiteNav } from '@/components/navigation/SiteNav';
import { WorkHero } from '@/components/work/WorkHero';
import { client, isSanityConfigured } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { photoSeriesBySlugQuery } from '@/sanity/lib/queries';

type WorkPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: WorkPageProps) {
  const { slug } = await params;

  if (!isSanityConfigured) {
    return {
      title: slug.replace(/-/g, ' '),
      description: 'Photo series detail.',
    };
  }

  const series = await client.fetch(photoSeriesBySlugQuery, { slug });

  if (!series) {
    return { title: 'Not found' };
  }

  return {
    title: series.title,
    description: series.category
      ? `${series.title} — ${series.category}`
      : series.title,
  };
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { slug } = await params;

  if (!isSanityConfigured) {
    const title = slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return (
      <>
        <SiteNav />
        <main style={{ background: 'var(--color-cream)', color: 'var(--color-ink)' }}>
          <div className="flex min-h-[40vh] items-center justify-center px-6 py-32 md:px-16">
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
          </div>
        </main>
      </>
    );
  }

  const series = await client.fetch(photoSeriesBySlugQuery, { slug });

  if (!series?.coverImage) {
    notFound();
  }

  const imageSrc = urlFor(series.coverImage).width(2400).quality(85).url();

  return (
    <>
      <SiteNav />
      <main style={{ background: 'var(--color-cream)', color: 'var(--color-ink)' }}>
        <WorkHero slug={slug} imageSrc={imageSrc} imageAlt={series.title} />
        <div className="px-6 py-16 md:px-16 md:py-24">
          <Copy animateOnScroll={false}>
            <h1
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: 'var(--size-section-title)',
                fontWeight: 'var(--weight-light)',
              }}
            >
              {series.title}
            </h1>
          </Copy>
          {(series.category || series.year) && (
            <p
              className="mt-4"
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: 'var(--size-label)',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                color: 'var(--color-ink-45)',
              }}
            >
              {[series.category, series.year].filter(Boolean).join(' · ')}
            </p>
          )}
          <p
            className="mt-8 max-w-lg"
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 'var(--size-label)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: 'var(--color-ink-45)',
            }}
          >
            Full gallery build coming in Phase 2.
          </p>
        </div>
      </main>
    </>
  );
}
