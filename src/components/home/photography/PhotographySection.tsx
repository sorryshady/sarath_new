'use client';

import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';

import type { PhotoSeries } from '@/types/photoSeries';

import { FolderMeta } from './FolderMeta';
import { FolderRail } from './FolderRail';
import { SelectedWorkHero } from './SelectedWorkHero';
import './photography-section.css';

type PhotographySectionProps = {
  series: PhotoSeries[];
  /** Accepted for compatibility with HomePage; not used by the new layout. */
  scrollReady?: boolean;
};

export function PhotographySection({ series }: PhotographySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const directionRef = useRef<'next' | 'prev'>('next');

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex((prev) => {
      if (index === prev) return prev;
      directionRef.current = index > prev ? 'next' : 'prev';
      return index;
    });
  }, []);

  if (series.length === 0) return null;

  const selected = series[selectedIndex];
  const countLabel = `${String(series.length).padStart(2, '0')} Series`;

  return (
    <section
      id="photography"
      data-nav-theme="light"
      data-photography-section
      className="selected-work"
      aria-label="Photography"
    >
      <header className="selected-work__header">
        <h2 className="selected-work__title">Selected Work</h2>
        <span className="selected-work__count">{countLabel}</span>
      </header>

      <div className="selected-work__body">
        <SelectedWorkHero series={selected} direction={directionRef.current} />

        <div className="selected-work__panel">
          <FolderMeta series={selected} />
          <FolderRail
            series={series}
            selectedIndex={selectedIndex}
            onSelect={handleSelect}
          />
          <Link href="/works" className="selected-work__view-all">
            <span className="selected-work__view-all-text">View all works</span>
            <span className="selected-work__view-all-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
