'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';

import Copy from '@/components/copy/Copy';
import { TransitionLink } from '@/components/transitions/TransitionLink';
import { useTransition } from '@/components/transitions/TransitionProvider';
import { seriesImageUrl } from '@/lib/photoSeries';
import type { PhotoSeries } from '@/types/photoSeries';

import './photography.css';

gsap.registerPlugin(useGSAP, CustomEase);
CustomEase.create('mainEase', '0.65, 0, 0, 1');
CustomEase.create('transitionEase', '0.75, 0, 0, 1');

const CLIP_SEAM = 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)';
const CLIP_FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

export function PhotographyExperience({ series }: { series: PhotoSeries[] }) {
  const { navigate } = useTransition();
  const [index, setIndex] = useState(0);
  const wheelLock = useRef(0);
  const dirRef = useRef(1);
  const prevIndexRef = useRef(0);
  const rootRef = useRef<HTMLElement>(null);

  // Image stack
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Nav thumbnails — base layer (old image) + overlay layer (new image wipes in)
  const prevBaseRef = useRef<HTMLSpanElement>(null);
  const prevOverRef = useRef<HTMLSpanElement>(null);
  const nextBaseRef = useRef<HTMLSpanElement>(null);
  const nextOverRef = useRef<HTMLSpanElement>(null);

  const n = series.length;
  const wrap = useCallback((i: number) => ((i % n) + n) % n, [n]);

  // Preload current + neighbours so the clip animation starts on a loaded image.
  useEffect(() => {
    [index, wrap(index + 1), wrap(index - 1)].forEach((i) => {
      const url = seriesImageUrl(series[i].coverImage, 2000);
      if (url) { const img = new window.Image(); img.src = url; }
    });
  }, [index, series, wrap]);

  const go = useCallback(
    (dir: number) => {
      dirRef.current = dir;
      setIndex((i) => wrap(i + dir));
    },
    [wrap],
  );

  useEffect(() => {
    if (n <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, n]);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (n <= 1) return;
      const now = Date.now();
      if (now - wheelLock.current < 900) return;
      if (Math.abs(e.deltaY) < 12) return;
      wheelLock.current = now;
      go(e.deltaY > 0 ? 1 : -1);
    },
    [go, n],
  );

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prev = prevIndexRef.current;
      const cur = index;
      const dir = dirRef.current;

      // Left panel — centre-seam image reveal.
      bgRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.killTweensOf(el);
        if (i === cur) {
          if (reduced) { gsap.set(el, { clipPath: CLIP_FULL, zIndex: 2 }); return; }
          gsap.set(el, { clipPath: CLIP_SEAM, zIndex: 2 });
          gsap.to(el, { clipPath: CLIP_FULL, duration: 1.35, ease: 'transitionEase' });
        } else if (i === prev && prev !== cur) {
          gsap.set(el, { clipPath: CLIP_FULL, zIndex: 1 });
        } else {
          gsap.set(el, { clipPath: CLIP_SEAM, zIndex: 0 });
        }
      });

      // Nav thumbs — new image wipes in on top of the old image.
      // Base layer shows the old image (stays fully visible).
      // Overlay layer shows the new image and wipes in left→right (prev) or right→left (next).
      const oldPrevUrl = seriesImageUrl(series[wrap(prev - 1)].coverImage, 400);
      const newPrevUrl = seriesImageUrl(series[wrap(cur - 1)].coverImage, 400);
      const oldNextUrl = seriesImageUrl(series[wrap(prev + 1)].coverImage, 400);
      const newNextUrl = seriesImageUrl(series[wrap(cur + 1)].coverImage, 400);

      if (prev === cur) {
        // Initial mount — no animation, just show images.
        gsap.set(prevBaseRef.current, { backgroundImage: `url(${newPrevUrl})`, clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set(prevOverRef.current, { backgroundImage: `url(${newPrevUrl})`, clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set(nextBaseRef.current, { backgroundImage: `url(${newNextUrl})`, clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set(nextOverRef.current, { backgroundImage: `url(${newNextUrl})`, clipPath: 'inset(0% 0% 0% 0%)' });
      } else if (!reduced) {
        // Wipe direction: inward (toward centre) on next, outward on prev.
        // dir >= 0 → next: prev thumb wipes L→R, next thumb wipes R→L.
        // dir < 0  → prev: prev thumb wipes R→L, next thumb wipes L→R.
        const prevStartClip = dir >= 0 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)';
        const nextStartClip = dir >= 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)';
        // Base = old image, fully visible underneath.
        gsap.set(prevBaseRef.current, { backgroundImage: `url(${oldPrevUrl})`, clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set(nextBaseRef.current, { backgroundImage: `url(${oldNextUrl})`, clipPath: 'inset(0% 0% 0% 0%)' });
        // Overlay = new image, wipes in on top.
        gsap.set(prevOverRef.current, { backgroundImage: `url(${newPrevUrl})`, clipPath: prevStartClip });
        gsap.to(prevOverRef.current, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'transitionEase' });
        gsap.set(nextOverRef.current, { backgroundImage: `url(${newNextUrl})`, clipPath: nextStartClip });
        gsap.to(nextOverRef.current, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'transitionEase', delay: 0.06 });
      } else {
        gsap.set([prevBaseRef.current, prevOverRef.current], { backgroundImage: `url(${newPrevUrl})`, clipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set([nextBaseRef.current, nextOverRef.current], { backgroundImage: `url(${newNextUrl})`, clipPath: 'inset(0% 0% 0% 0%)' });
      }

      prevIndexRef.current = cur;
    },
    { dependencies: [index], scope: rootRef },
  );

  if (n === 0) {
    return (
      <main className="ph-empty">
        <p className="ph-eyebrow">Photography</p>
        <h1>Photo series coming soon.</h1>
        <TransitionLink href="/" label="Home" back className="ph-home-link">
          ← Home
        </TransitionLink>
      </main>
    );
  }

  const current = series[index];
  const prevS = series[wrap(index - 1)];
  const nextS = series[wrap(index + 1)];
  const counter = String(index + 1).padStart(2, '0');
  const total = String(n).padStart(2, '0');
  const enter = () => navigate(`/photography/${current.slug}`, { label: current.title });

  return (
    <main className="ph-hero ph-dispatch" onWheel={onWheel} ref={rootRef}>
      {/* Left — full-bleed image with centre-seam reveal */}
      <div className="ph-dispatch-img" aria-hidden="true">
        {series.map((s, i) => {
          const url = seriesImageUrl(s.coverImage, 2000);
          return url ? (
            <div
              key={s._id}
              className="ph-bg"
              ref={(el) => { bgRefs.current[i] = el; }}
              style={{ backgroundImage: `url(${url})` }}
            />
          ) : null;
        })}
        <div className="ph-dispatch-img-scrim" />
      </div>

      {/* Right — editorial dispatch column */}
      <aside className="ph-dispatch-col">
        <header className="ph-dispatch-hd">
          <TransitionLink href="/" label="Home" back className="ph-hero-home">
            ← Sarath Menon
          </TransitionLink>
          <span className="ph-hero-eyebrow">Photography</span>
        </header>

        <div className="ph-dispatch-body">
          <div className="ph-dispatch-text">
            <Copy key={`eyebrow-${index}`} animateOnScroll={false}>
              <p className="ph-dispatch-eyebrow">
                {current.category ?? 'Series'} — {counter}/{total}
              </p>
            </Copy>
            <Copy key={`title-${index}`} animateOnScroll={false} delay={0.1}>
              <h1 className="ph-dispatch-title">{current.title}</h1>
            </Copy>
            <Copy key={`meta-${index}`} animateOnScroll={false} delay={0.2}>
              <p className="ph-dispatch-meta">
                {[current.year, current.frameCount && `${current.frameCount} frames`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </Copy>
          </div>

          <button type="button" className="ph-dispatch-enter" onClick={enter}>
            Enter Series →
          </button>
        </div>

        <nav className="ph-dispatch-nav">
          <button
            type="button"
            onClick={() => go(-1)}
            className="ph-dispatch-nav-btn"
            aria-label="Previous"
          >
            ←
          </button>
          <div className="ph-dispatch-thumbs">
            <div className="ph-dispatch-thumb-col">
              <span className="ph-dispatch-thumb-label">Prev</span>
              <div className="ph-dispatch-thumb-wrap">
                <span ref={prevBaseRef} className="ph-dispatch-thumb" />
                <span ref={prevOverRef} className="ph-dispatch-thumb ph-dispatch-thumb-over"
                  style={{ backgroundImage: `url(${seriesImageUrl(prevS.coverImage, 400)})` }}
                />
              </div>
            </div>
            <div className="ph-dispatch-thumb-col">
              <span className="ph-dispatch-thumb-label">Next</span>
              <div className="ph-dispatch-thumb-wrap">
                <span ref={nextBaseRef} className="ph-dispatch-thumb" />
                <span ref={nextOverRef} className="ph-dispatch-thumb ph-dispatch-thumb-over"
                  style={{ backgroundImage: `url(${seriesImageUrl(nextS.coverImage, 400)})` }}
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            className="ph-dispatch-nav-btn"
            aria-label="Next"
          >
            →
          </button>
        </nav>
      </aside>
    </main>
  );
}
