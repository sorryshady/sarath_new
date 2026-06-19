'use client';

import Copy from '@/components/copy/Copy';
import { RevealImage } from '@/components/media/RevealImage';
import { TransitionLink } from '@/components/transitions/TransitionLink';
import { seriesImageUrl } from '@/lib/photoSeries';
import type { PhotoSeries } from '@/types/photoSeries';

import './photography-teaser.css';

export function PhotographyTeaserSection({ series }: { series: PhotoSeries[] }) {
  const lead = series[0];
  if (!lead) return null;

  const cover = seriesImageUrl(lead.coverImage, 1600);
  const meta = [lead.category, lead.year, lead.frameCount && `${lead.frameCount} frames`]
    .filter(Boolean)
    .join(' · ');

  return (
    <section
      id="photography"
      data-nav-theme="light"
      className="pht"
      aria-label="Photography"
    >
      <div className="pht-text">
        <Copy>
          <p className="pht-eyebrow">Photography</p>
        </Copy>

        <Copy>
          <h2 className="pht-title">{lead.title}</h2>
        </Copy>

        {meta && (
          <Copy>
            <p className="pht-meta">{meta}</p>
          </Copy>
        )}

        <TransitionLink href="/photography" label="Photography" className="pht-link">
          View all series →
        </TransitionLink>
      </div>

      <div className="pht-frame">
        {cover && (
          <RevealImage
            src={cover}
            alt={lead.title}
            fill
            className="pht-cover"
          />
        )}
        <span className="pht-frame-tag">{lead.frameCount ?? '—'} frames</span>
      </div>
    </section>
  );
}
