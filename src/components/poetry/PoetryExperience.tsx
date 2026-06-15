'use client';

import Copy from '@/components/copy/Copy';
import { RevealImage } from '@/components/media/RevealImage';
import { TransitionLink } from '@/components/transitions/TransitionLink';
import { poemImageUrl } from '@/lib/poems';
import type { Poem } from '@/types/poem';

import './poetry.css';

/** Image poems longer than ~a viewport of verse pin their image and scroll the text. */
const PINNED_MIN_LINES = 14;

type Treatment = 'pinned' | 'static' | 'solo';

function treatmentFor(poem: Poem): Treatment {
  if (!poem.image) return 'solo';
  const lines = poem.body.split('\n').filter((l) => l.trim().length > 0).length;
  return lines >= PINNED_MIN_LINES ? 'pinned' : 'static';
}

/** Blank-line separated stanzas — each reveals on its own as it scrolls in. */
function toStanzas(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function yearRange(poems: Poem[]): string | null {
  const years = poems
    .map((p) => p.year)
    .filter((y): y is string => Boolean(y))
    .sort();
  if (years.length === 0) return null;
  const lo = years[0];
  const hi = years[years.length - 1];
  return lo === hi ? lo : `${lo}–${hi}`;
}

/** Title + stanza-by-stanza body, shared across all three treatments. */
function PoemText({ poem, solo = false }: { poem: Poem; solo?: boolean }) {
  return (
    <div className={`poe-text${solo ? ' is-solo' : ''}`}>
      <div className="poe-text-head">
        <Copy>
          <h2 className="poe-title">{poem.title}</h2>
        </Copy>
        {poem.year && <span className="poe-year">{poem.year}</span>}
      </div>
      <div className="poe-body-copy">
        {toStanzas(poem.body).map((stanza, i) => (
          <Copy key={i}>
            <p className="poe-stanza">{stanza}</p>
          </Copy>
        ))}
      </div>
    </div>
  );
}

/** The image panel — counter + optional caption overlaid on a develop reveal. */
function PoemImage({
  poem,
  index,
  total,
  fill,
}: {
  poem: Poem;
  index: number;
  total: number;
  fill: boolean;
}) {
  const url = poemImageUrl(poem.image, fill ? 2000 : 1400);
  if (!url) return null;
  const counter = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  return (
    <div className="poe-photo">
      <RevealImage
        src={url}
        alt={poem.title}
        variant="develop"
        fill={fill}
        aspectRatio={fill ? undefined : poem.imageAspectRatio ?? undefined}
        className="poe-photo-img"
      />
      <span className="poe-counter">{counter}</span>
      {poem.imageCaption && <span className="poe-caption">{poem.imageCaption}</span>}
    </div>
  );
}

function PoemBlock({
  poem,
  index,
  total,
}: {
  poem: Poem;
  index: number;
  total: number;
}) {
  const treatment = treatmentFor(poem);
  // Sides alternate poem-to-poem for the two-column treatments.
  const imgLeft = index % 2 === 0;
  const sideClass = imgLeft ? ' is-img-left' : ' is-img-right';

  if (treatment === 'solo') {
    return (
      <section className="poe-poem poe-solo">
        <div className="poe-solo-inner">
          <PoemText poem={poem} solo />
        </div>
      </section>
    );
  }

  if (treatment === 'static') {
    return (
      <section className={`poe-poem poe-static${sideClass}`}>
        <PoemImage poem={poem} index={index} total={total} fill={false} />
        <div className="poe-static-text">
          <PoemText poem={poem} />
        </div>
      </section>
    );
  }

  // pinned — image sticks to the viewport while the verse scrolls past it
  return (
    <section className={`poe-poem poe-pinned${sideClass}`}>
      <div className="poe-pin-img">
        <div className="poe-pin-img-inner">
          <PoemImage poem={poem} index={index} total={total} fill />
        </div>
      </div>
      <div className="poe-pin-text">
        <PoemText poem={poem} />
      </div>
    </section>
  );
}

export function PoetryExperience({ poems }: { poems: Poem[] }) {
  if (poems.length === 0) {
    return (
      <main className="poe-empty">
        <p className="poe-eyebrow">Poetry</p>
        <h1>Poems coming soon.</h1>
        <TransitionLink href="/" label="Home" back className="poe-home-link">
          ← Home
        </TransitionLink>
      </main>
    );
  }

  const range = yearRange(poems);

  return (
    <main className="poe">
      <header className="poe-head">
        <TransitionLink href="/" label="Home" back className="poe-back">
          ← Sarath Menon
        </TransitionLink>
        <span className="poe-head-count">
          {poems.length} Poems{range ? ` · ${range}` : ''}
        </span>
      </header>

      <div className="poe-title-block">
        <p className="poe-eyebrow">Selected Verse</p>
        <h1 className="poe-page-title">Poetry</h1>
      </div>

      <div className="poe-stream">
        {poems.map((poem, i) => (
          <PoemBlock key={poem._id} poem={poem} index={i} total={poems.length} />
        ))}
      </div>
    </main>
  );
}
