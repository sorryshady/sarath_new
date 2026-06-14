'use client';

import { useCallback, useEffect, useState } from 'react';

import { filmPlayerUrl } from '@/lib/films';
import { filmRoleLabel, type Film } from '@/types/film';

type FilmLightboxProps = {
  film: Film;
  onClose: () => void;
};

export function FilmLightbox({ film, onClose }: FilmLightboxProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    window.setTimeout(onClose, 280);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleClose]);

  const playerUrl = filmPlayerUrl(film);
  const role = filmRoleLabel(film.role);
  const meta = [role, film.year, film.format].filter(Boolean).join(' · ');

  return (
    <div
      className="film-lightbox"
      data-closing={closing || undefined}
      role="dialog"
      aria-modal="true"
      aria-label={film.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <button
        type="button"
        className="film-lightbox-close"
        onClick={handleClose}
        aria-label="Close"
      >
        ✕
      </button>

      <div className="film-lightbox-inner">
        <div className="film-lightbox-frame">
          {playerUrl ? (
            <iframe
              src={playerUrl}
              title={film.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="film-lightbox-novideo">Video unavailable</div>
          )}
        </div>

        <div className="film-lightbox-credits">
          <h2>{film.title}</h2>
          {meta && <p>{meta}</p>}
          {film.award && <p className="film-lightbox-award">{film.award}</p>}
        </div>
      </div>
    </div>
  );
}
