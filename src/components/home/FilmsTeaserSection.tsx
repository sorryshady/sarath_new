'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import { TransitionLink } from '@/components/transitions/TransitionLink';
import { getVideoPosterUrl, resolveVideoSource } from '@/lib/video';
import { urlFor } from '@/sanity/lib/image';
import { filmRoleLabel, type Film } from '@/types/film';

import './films-teaser.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Best still for a film: Sanity thumbnail, falling back to the video poster. */
function filmStill(film: Film, width = 1920): string | null {
  if (film.thumbnail) return urlFor(film.thumbnail).width(width).quality(80).url();
  const source = resolveVideoSource(film);
  return source ? getVideoPosterUrl(source) ?? null : null;
}

export function FilmsTeaserSection({ films }: { films: Film[] }) {
  const reel = films.slice(0, 4);
  const [active, setActive] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const botBarRef = useRef<HTMLDivElement>(null);

  // Auto-crossfade through the featured stills.
  useEffect(() => {
    if (reel.length < 2) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % reel.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [reel.length]);

  // Letterbox crush — the bars close in to a 2.39:1 frame as the section
  // scrolls into view (scrubbed), like a cinema masking down.
  useGSAP(
    () => {
      const top = topBarRef.current;
      const bot = botBarRef.current;
      if (!top || !bot) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set([top, bot], { height: '12%' });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'top 30%',
          scrub: 1,
        },
      });
      tl.fromTo([top, bot], { height: '0%' }, { height: '12%', ease: 'none' }, 0);
    },
    { scope: sectionRef },
  );

  if (reel.length === 0) return null;

  const current = reel[active];
  const credit = ['Dir. Sarath Menon', current.year].filter(Boolean).join(' · ');

  return (
    <section
      ref={sectionRef}
      id="films"
      data-nav-theme="dark"
      className="fts"
      aria-label="Films"
    >
      {/* Crossfading stills with a slow Ken Burns push */}
      <div className="fts-stage" aria-hidden="true">
        {reel.map((film, i) => {
          const still = filmStill(film);
          if (!still) return null;
          return (
            <div
              key={film._id}
              className="fts-still"
              data-active={i === active || undefined}
              style={{ backgroundImage: `url(${still})` }}
            />
          );
        })}
        <div className="fts-scrim" />
      </div>

      {/* Letterbox bars */}
      <div ref={topBarRef} className="fts-bar fts-bar-top" />
      <div ref={botBarRef} className="fts-bar fts-bar-bot" />

      {/* Content */}
      <div className="fts-content">
        <p className="fts-eyebrow">Films</p>
        <h2 className="fts-title">{current.title}</h2>
        <p className="fts-credit">
          {credit}
          {filmRoleLabel(current.role) && (
            <span className="fts-role"> · {filmRoleLabel(current.role)}</span>
          )}
        </p>

        <TransitionLink href="/films" label="Films" className="fts-link">
          Enter the reel →
        </TransitionLink>
      </div>

      {/* Frame counter */}
      <div className="fts-index" aria-hidden="true">
        <span className="fts-index-now">{String(active + 1).padStart(2, '0')}</span>
        <span className="fts-index-sep">/</span>
        <span className="fts-index-total">{String(reel.length).padStart(2, '0')}</span>
      </div>
    </section>
  );
}
