'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

import { getAnimationMode } from '@/lib/animationMode';
import type { PhotoSeries } from '@/types/photoSeries';

gsap.registerPlugin(SplitText, useGSAP);

type FolderMetaProps = {
  series: PhotoSeries;
};

export function FolderMeta({ series }: FolderMetaProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const targets = Array.from(
        root.querySelectorAll<HTMLElement>('[data-meta-line]'),
      );
      if (targets.length === 0) return;

      if (getAnimationMode() === 'reduced') {
        gsap.set(root, { autoAlpha: 1 });
        return;
      }

      const splits = targets.map((el) =>
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'meta-line++',
        }),
      );
      const lines = splits.flatMap((s) => s.lines);

      gsap.set(root, { autoAlpha: 1 });
      gsap.set(lines, { yPercent: 110 });
      gsap.to(lines, {
        yPercent: 0,
        duration: 1.0,
        stagger: 0.14,
        ease: 'power4.out',
      });

      return () => splits.forEach((s) => s.revert());
    },
    { scope: rootRef, dependencies: [series.slug] },
  );

  return (
    <div
      ref={rootRef}
      className="selected-work__meta"
      style={{ visibility: 'hidden' }}
    >
      <h3 data-meta-line className="selected-work__meta-title">
        {series.title}
      </h3>
      <p data-meta-line className="selected-work__meta-sub">
        {series.category} · {series.year}
      </p>
      <p data-meta-line className="selected-work__meta-frames">
        {series.frameCount} frames
      </p>
    </div>
  );
}
