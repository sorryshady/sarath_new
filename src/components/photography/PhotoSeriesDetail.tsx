'use client';

import { useRef, useState } from 'react';
import { useLenis } from 'lenis/react';

import { RevealImage } from '@/components/media/RevealImage';
import { TransitionLink } from '@/components/transitions/TransitionLink';
import { seriesImageUrl } from '@/lib/photoSeries';
import type { PhotoSeries } from '@/types/photoSeries';

import './photo-series-detail.css';

/** Opening frame and ultra-wide panoramas break out to full width. */
function isWide(index: number, aspectRatio?: number | null): boolean {
  return index === 0 || (aspectRatio ?? 0) >= 2.6;
}

export function PhotoSeriesDetail({ series }: { series: PhotoSeries }) {
  const cover = seriesImageUrl(series.coverImage, 2400);
  const meta = [series.category, series.year, series.frameCount]
    .filter(Boolean)
    .join(' · ');
  const gallery = series.gallery ?? [];

  // Hide the back nav on scroll-down, reveal on scroll-up (so you never have to
  // scroll back to the top to leave). Driven by Lenis scroll direction.
  const [navHidden, setNavHidden] = useState(false);
  const hiddenRef = useRef(false);
  useLenis((lenis) => {
    const shouldHide = lenis.scroll > 120 && lenis.direction === 1;
    if (shouldHide !== hiddenRef.current) {
      hiddenRef.current = shouldHide;
      setNavHidden(shouldHide);
    }
  });

  return (
    <main className="psd">
      {/* Hero — the series cover is the page's opening image. */}
      <header className="psd-hero">
        {cover && (
          <div
            className="psd-hero-img"
            style={{ backgroundImage: `url(${cover})` }}
          />
        )}
        <div className="psd-hero-scrim" />
        <div className={`psd-hero-chrome${navHidden ? ' is-hidden' : ''}`}>
          <TransitionLink
            href="/photography"
            label="Photography"
            back
            className="psd-back"
          >
            ← Photography
          </TransitionLink>
        </div>
        <div className="psd-hero-title">
          <h1>{series.title}</h1>
          {meta && <p>{meta}</p>}
        </div>
      </header>

      {/* Gallery — 2-column masonry with full-width breakouts. */}
      <div className="psd-gallery">
        {gallery.map((frame, i) => {
          const url = seriesImageUrl(frame, 1800);
          if (!url) return null;
          const wide = isWide(i, frame.aspectRatio);
          return (
            <figure
              key={frame._key ?? i}
              className={`psd-frame${wide ? ' is-wide' : ''}`}
            >
              <RevealImage
                src={url}
                alt={frame.caption ?? ''}
                aspectRatio={frame.aspectRatio ?? undefined}
                className="psd-frame-img"
              />
              {frame.caption && <figcaption>{frame.caption}</figcaption>}
            </figure>
          );
        })}
      </div>
    </main>
  );
}
