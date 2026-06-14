'use client';

import { useState } from 'react';

import { TransitionLink } from '@/components/transitions/TransitionLink';
import { getVideoPosterUrl, resolveVideoSource } from '@/lib/video';
import { urlFor } from '@/sanity/lib/image';
import { filmRoleLabel, type Film } from '@/types/film';

import { FilmLightbox } from './FilmLightbox';
import './films.css';

/** Best still for a film: Sanity thumbnail, falling back to the video poster. */
function filmStill(film: Film, width = 1920): string | null {
  if (film.thumbnail) return urlFor(film.thumbnail).width(width).quality(80).url();
  const source = resolveVideoSource(film);
  return source ? getVideoPosterUrl(source) ?? null : null;
}

export function FilmsExperience({ films }: { films: Film[] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<Film | null>(null);

  if (films.length === 0) {
    return (
      <main className="films-empty">
        <p className="films-eyebrow">Films</p>
        <h1>Filmography coming soon.</h1>
        <TransitionLink href="/" label="Home" back className="films-home-link">
          ← Home
        </TransitionLink>
      </main>
    );
  }

  return (
    <main className="films">
      {/* Hero stage — the active film still is the page's hero image. */}
      <div className="films-stage" aria-hidden="true">
        {films.map((film, i) => {
          const still = filmStill(film);
          if (!still) return null;
          return (
            <div
              key={film._id}
              className="films-still"
              data-active={i === active || undefined}
              style={{ backgroundImage: `url(${still})` }}
            />
          );
        })}
        <div className="films-scrim" />
      </div>

      <header className="films-header">
        <TransitionLink href="/" label="Home" back className="films-home-link">
          ← Sarath Menon
        </TransitionLink>
        <span className="films-count">
          Films <span>({String(films.length).padStart(2, '0')})</span>
        </span>
      </header>

      {/* Typographic reel index. Hover swaps the hero still; click plays. */}
      <ul className="films-reel">
        {films.map((film, i) => {
          const role = filmRoleLabel(film.role);
          const meta = [film.year, role].filter(Boolean).join(' · ');
          return (
            <li key={film._id} className="films-reel-item">
              <button
                type="button"
                className="films-reel-button"
                data-active={i === active || undefined}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setLightbox(film)}
              >
                <span className="films-reel-title">{film.title}</span>
                {meta && <span className="films-reel-meta">{meta}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {lightbox && (
        <FilmLightbox film={lightbox} onClose={() => setLightbox(null)} />
      )}
    </main>
  );
}
