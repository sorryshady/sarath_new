'use client';

import Image from 'next/image';
import { forwardRef, useMemo } from 'react';

import type { PhotoSeries } from '@/types/photoSeries';

type PolaroidCardProps = {
  series: PhotoSeries;
  index: number;
  hoverEnabled?: boolean;
  isActive?: boolean;
  animationMode?: 'full' | 'reduced';
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const PolaroidCard = forwardRef<HTMLDivElement, PolaroidCardProps>(
  function PolaroidCard(
    {
      series,
      index,
      hoverEnabled = false,
      isActive = false,
      animationMode = 'full',
      className = '',
      onClick,
      onMouseEnter,
      onMouseLeave,
    },
    ref,
  ) {
    const frameNumber = String(index + 1).padStart(2, '0');
    const metaLabel = `${series.category} · ${series.year}`;

    const nameChars = useMemo(
      () => series.title.split(''),
      [series.title],
    );

    return (
      <div
        ref={ref}
        data-polaroid-card
        className={[
          'polaroid-card',
          hoverEnabled ? 'polaroid-card--hover-enabled' : '',
          isActive ? 'polaroid-card--active' : '',
          animationMode === 'reduced' ? 'polaroid-card--reduced' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={hoverEnabled ? onClick : undefined}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={
          hoverEnabled
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        role={hoverEnabled ? 'button' : undefined}
        tabIndex={hoverEnabled ? 0 : undefined}
      >
        <div className="polaroid-card__shell">
          <div className="polaroid-card__flipper">
            <div className="polaroid-card__face polaroid-card__back">
              <span className="polaroid-card__back-monogram">SM</span>
              <span className="polaroid-card__back-frame">{frameNumber}</span>
            </div>

            <div className="polaroid-card__face polaroid-card__front">
              <div className="polaroid-border polaroid-card__border">
                <div
                  className="polaroid-card__image-wrap"
                  data-work-hero-morph={series.slug}
                >
                  <Image
                    src={series.coverImage}
                    alt={series.title}
                    fill
                    sizes="(max-width: 767px) 200px, (max-width: 1023px) 150px, 200px"
                    className="polaroid-image polaroid-card__image"
                  />
                  <div className="polaroid-card__hover-overlay">
                    <span className="polaroid-card__hover-title">
                      {series.title}
                    </span>
                    <span className="polaroid-card__hover-frames">
                      {series.frameCount} frames
                    </span>
                  </div>
                </div>

                <div className="polaroid-caption polaroid-card__caption">
                  <span className="polaroid-card__series-name">
                    {nameChars.map((char, charIndex) => (
                      <span
                        key={`${series.slug}-${charIndex}`}
                        className="polaroid-card__series-name-char"
                        data-char
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                  <span className="polaroid-card__series-meta">{metaLabel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
