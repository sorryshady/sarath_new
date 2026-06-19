'use client';

import Copy from '@/components/copy/Copy';
import { TransitionLink } from '@/components/transitions/TransitionLink';
import { teaserExcerpt } from '@/lib/poetry';
import type { PoetryTeaser } from '@/types/poetryTeaser';

import './poetry-teaser.css';

export function PoetryTeaserSection({ teaser }: { teaser: PoetryTeaser | null }) {
  const lines = teaserExcerpt(teaser, 4);
  if (lines.length === 0) return null;

  const attribution = [teaser?.title, teaser?.year].filter(Boolean).join(', ');

  return (
    <section
      id="poetry"
      data-nav-theme="light"
      className="poet"
      aria-label="Poetry"
    >
      <div className="poet-inner">
        <Copy>
          <p className="poet-eyebrow">Poetry</p>
        </Copy>

        <Copy>
          <blockquote className="poet-verse">
            {lines.map((line, i) => (
              <span key={i} className="poet-line">
                {line}
              </span>
            ))}
          </blockquote>
        </Copy>

        {attribution && (
          <Copy>
            <p className="poet-attr">— {attribution}</p>
          </Copy>
        )}

        <TransitionLink href="/poetry" label="Poetry" className="poet-link">
          Read the anthology →
        </TransitionLink>
      </div>
    </section>
  );
}
