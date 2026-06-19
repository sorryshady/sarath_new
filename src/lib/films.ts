import { client, isSanityConfigured } from '@/sanity/lib/client';
import { allFilmsQuery, featuredFilmsQuery } from '@/sanity/lib/queries';
import type { Film } from '@/types/film';

import { resolveVideoSource } from './video';

export async function getAllFilms(): Promise<Film[]> {
  if (!isSanityConfigured) return [];
  try {
    return await client.fetch(allFilmsQuery);
  } catch {
    return [];
  }
}

export async function getFeaturedFilms(): Promise<Film[]> {
  if (!isSanityConfigured) return [];
  try {
    return await client.fetch(featuredFilmsQuery);
  } catch {
    return [];
  }
}

/**
 * Embed URL for the lightbox player — autoplay WITH sound and controls
 * (distinct from the muted background embeds in lib/video.ts).
 */
export function filmPlayerUrl(film: Film): string | null {
  const source = resolveVideoSource(film);
  if (!source) return null;

  if (source.provider === 'youtube') {
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
    });
    return `https://www.youtube.com/embed/${source.id}?${params.toString()}`;
  }

  const params = new URLSearchParams({
    autoplay: '1',
    title: '0',
    byline: '0',
    portrait: '0',
  });
  return `https://player.vimeo.com/video/${source.id}?${params.toString()}`;
}
