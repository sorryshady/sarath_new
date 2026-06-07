'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

import type { PhotoSeries } from '@/types/photoSeries';

type FolderRailProps = {
  series: PhotoSeries[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function FolderRail({ series, selectedIndex, onSelect }: FolderRailProps) {
  const railRef = useRef<HTMLDivElement>(null);

  // Keep the active thumbnail in view on both axes (vertical desktop / horizontal mobile).
  useEffect(() => {
    const active = railRef.current?.querySelector(
      '.selected-work__thumb--active',
    );
    active?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }, [selectedIndex]);

  return (
    <div
      ref={railRef}
      className="selected-work__rail"
      role="tablist"
      aria-label="Photo folders"
    >
      {series.map((item, index) => (
        <button
          key={item.slug}
          type="button"
          role="tab"
          aria-selected={index === selectedIndex}
          aria-label={item.title}
          className={`selected-work__thumb${
            index === selectedIndex ? ' selected-work__thumb--active' : ''
          }`}
          onClick={() => onSelect(index)}
        >
          <span className="selected-work__thumb-img">
            <Image
              src={item.coverImage}
              alt={item.title}
              fill
              sizes="120px"
              className="object-cover"
            />
          </span>
        </button>
      ))}
    </div>
  );
}
