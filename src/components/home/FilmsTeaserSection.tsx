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
  const reel = films.slice(0, 5);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const botBarRef = useRef<HTMLDivElement>(null);

  // Auto-advance through the featured stills; pauses while the strip is hovered.
  useEffect(() => {
    if (reel.length < 2 || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % reel.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [reel.length, paused]);

  // Letterbox crush — the bars close in toward a 2.39:1 frame as the section
  // scrolls into view (scrubbed), like a cinema masking down.
  useGSAP(
    () => {
      const top = topBarRef.current;
      const bot = botBarRef.current;
      if (!top || !bot) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set([top, bot], { height: '11%' });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'top 28%',
          scrub: 1,
        },
      });
      tl.fromTo([top, bot], { height: '0%' }, { height: '11%', ease: 'none' }, 0);
    },
    { scope: sectionRef },
  );

  if (reel.length === 0) return null;

  const current = reel[active];
  const credit = ['Dir. Sarath Menon', current.year].filter(Boolean).join(' · ');
  const role = filmRoleLabel(current.role);

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

      {/* Top marquee */}
      <div className="fts-marquee">
        <span className="fts-now">
          <span className="fts-rec" aria-hidden="true" /> Now showing
        </span>
        <span className="fts-index" aria-hidden="true">
          {String(active + 1).padStart(2, '0')}
          <span className="fts-index-sep"> / </span>
          {String(reel.length).padStart(2, '0')}
        </span>
      </div>

      {/* Title block */}
      <div className="fts-content">
        <p className="fts-eyebrow">Films</p>
        <h2 className="fts-title" key={current._id}>
          {current.title}
        </h2>
        <p className="fts-credit">
          {credit}
          {role && <span className="fts-role"> · {role}</span>}
        </p>

        <TransitionLink href="/films" label="Films" className="fts-link">
          <span className="fts-play" aria-hidden="true">▶</span>
          Watch the reel
        </TransitionLink>
      </div>

      {/* Filmstrip rail — hover/focus to swap the hero still */}
      <div
        className="fts-strip"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <span className="fts-strip-perf" aria-hidden="true" />
        <div className="fts-strip-cells" role="tablist" aria-label="Featured films">
          {reel.map((film, i) => {
            const still = filmStill(film, 480);
            return (
              <button
                key={film._id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={film.title}
                className="fts-cell"
                data-active={i === active || undefined}
                style={still ? { backgroundImage: `url(${still})` } : undefined}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
              />
            );
          })}
        </div>
        <span className="fts-strip-perf" aria-hidden="true" />
      </div>
    </section>
  );
}
