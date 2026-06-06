'use client';

import { useEffect, useRef } from 'react';
import Player from '@vimeo/player';

import {
  getVideoPosterUrl,
  videoEmbedUrl,
  type VideoSource,
} from '@/lib/video';

import './hero-section.css';

export type HeroVideoBackgroundProps = {
  source: VideoSource;
  /** Fires once the video has buffered/can play — signals the preloader. */
  onReady: () => void;
  /** Safety net if the provider never emits a ready event. */
  readyTimeoutMs?: number;
};

/**
 * Full-bleed, muted, looping background video for the hero.
 *
 * Supports three providers:
 *  - `local`   — a <video> element (test reel from /public/assets)
 *  - `vimeo`   — Vimeo Player SDK in background mode (production)
 *  - `youtube` — YouTube IFrame embed in background mode (production)
 *
 * The wrapper carries the poster frame as a background image so something is
 * visible instantly; the player fades in over it once buffered.
 */
export function HeroVideoBackground({
  source,
  onReady,
  readyTimeoutMs = 8000,
}: HeroVideoBackgroundProps) {
  const vimeoMountRef = useRef<HTMLDivElement>(null);

  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const poster = getVideoPosterUrl(source);

  // Vimeo SDK player lifecycle (provider === 'vimeo' only).
  useEffect(() => {
    if (source.provider !== 'vimeo') return;
    const mount = vimeoMountRef.current;
    if (!mount) return;

    let resolved = false;
    const resolveReady = () => {
      if (resolved) return;
      resolved = true;
      onReadyRef.current();
    };

    const player = new Player(mount, {
      id: Number(source.id),
      background: true,
      muted: true,
      autoplay: true,
      loop: true,
      responsive: true,
    });

    player
      .ready()
      .then(() => player.play())
      .catch(() => {});

    player.on('bufferend', resolveReady);
    const fallback = window.setTimeout(resolveReady, readyTimeoutMs);

    return () => {
      window.clearTimeout(fallback);
      player.destroy().catch(() => {});
    };
  }, [source.provider, source.id, readyTimeoutMs]);

  // Safety net for iframe-based YouTube (no reliable cross-origin ready event).
  useEffect(() => {
    if (source.provider !== 'youtube') return;
    const fallback = window.setTimeout(() => onReadyRef.current(), readyTimeoutMs);
    return () => window.clearTimeout(fallback);
  }, [source.provider, source.id, readyTimeoutMs]);

  const wrapperStyle: React.CSSProperties = {
    pointerEvents: 'none',
    backgroundColor: 'var(--color-cinema-dark)',
    ...(poster
      ? {
          backgroundImage: `url('${poster}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {}),
  };

  return (
    <div
      className="hero-video-bg absolute inset-0 z-0 h-full w-full overflow-hidden"
      style={wrapperStyle}
      aria-hidden="true"
    >
      {source.provider === 'local' && (
        <video
          src={source.id}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={() => onReadyRef.current()}
        />
      )}

      {source.provider === 'youtube' && (
        <iframe
          src={videoEmbedUrl(source)}
          title="Showreel"
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
          onLoad={() => onReadyRef.current()}
        />
      )}

      {source.provider === 'vimeo' && <div ref={vimeoMountRef} className="h-full w-full" />}
    </div>
  );
}
