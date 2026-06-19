'use client';

import Copy from '@/components/copy/Copy';
import { RevealImage } from '@/components/media/RevealImage';
import { TransitionLink } from '@/components/transitions/TransitionLink';
import { portraitUrl } from '@/lib/about';
import type { AboutMeta, AboutTeaser } from '@/types/about';

import './about-teaser.css';

const FALLBACK_BIO =
  'Sarath Menon trained at the London Film School after his debut film was recognised at the 2016 Kerala State Chalachitra Academy Awards. He works across film, photography, and poetry — three disciplines sharing a single eye.';

function rolesLine(meta: AboutMeta | null): string {
  const photographer = meta?.photographerLabel ?? 'Photographer';
  const filmmaker = meta?.filmmakerLabel ?? 'Filmmaker';
  return [photographer, filmmaker, 'Poet'].join(' · ');
}

export function AboutTeaserSection({
  teaser,
  meta,
}: {
  teaser: AboutTeaser | null;
  meta: AboutMeta | null;
}) {
  const portrait = portraitUrl(teaser?.portrait, 1200);
  const bio = teaser?.bioText?.trim() || FALLBACK_BIO;
  const caption = teaser?.portraitCaption;
  const subline = [meta?.lfsCredit, meta?.location].filter(Boolean).join(' · ');

  return (
    <section id="about" data-nav-theme="dark" className="abt" aria-label="About">
      {/* Portrait — racks from defocused to sharp as the section scrolls in */}
      <div className="abt-portrait">
        {portrait && (
          <div className="abt-portrait-frame">
            <RevealImage
              src={portrait}
              alt="Sarath Menon"
              variant="rackFocus"
              fill
              className="abt-portrait-img"
            />
            <div className="abt-portrait-tint" aria-hidden="true" />
          </div>
        )}
        {portrait && caption && <span className="abt-portrait-cap">{caption}</span>}
      </div>

      {/* Text — name, bio, identity meta, full-story link */}
      <div className="abt-text">
        <Copy>
          <p className="abt-eyebrow">About</p>
        </Copy>

        <Copy>
          <h2 className="abt-name">Sarath Menon</h2>
        </Copy>

        <div className="abt-rule" aria-hidden="true" />

        <Copy>
          <p className="abt-bio">{bio}</p>
        </Copy>

        <Copy>
          <div className="abt-meta">
            <span className="abt-roles">{rolesLine(meta)}</span>
            {subline && <span className="abt-subline">{subline}</span>}
          </div>
        </Copy>

        <TransitionLink href="/about" label="About" className="abt-link">
          Full story →
        </TransitionLink>
      </div>
    </section>
  );
}
