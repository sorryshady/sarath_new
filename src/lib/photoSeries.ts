import type { SanityImageSource } from '@sanity/image-url';

import { client, isSanityConfigured } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import {
  allPhotoSeriesQuery,
  allPhotoSeriesSlugsQuery,
  featuredPhotoSeriesQuery,
  photoSeriesBySlugQuery,
} from '@/sanity/lib/queries';
import type { PhotoSeries, SeriesImage } from '@/types/photoSeries';

export async function getAllPhotoSeries(): Promise<PhotoSeries[]> {
  if (!isSanityConfigured) return [];
  try {
    return await client.fetch(allPhotoSeriesQuery);
  } catch {
    return [];
  }
}

export async function getFeaturedPhotoSeries(): Promise<PhotoSeries[]> {
  if (!isSanityConfigured) return [];
  try {
    return await client.fetch(featuredPhotoSeriesQuery);
  } catch {
    return [];
  }
}

export async function getPhotoSeries(slug: string): Promise<PhotoSeries | null> {
  if (!isSanityConfigured) return null;
  try {
    return await client.fetch(photoSeriesBySlugQuery, { slug });
  } catch {
    return null;
  }
}

export async function getAllPhotoSeriesSlugs(): Promise<string[]> {
  if (!isSanityConfigured) return [];
  try {
    const rows: { slug?: string }[] = await client.fetch(allPhotoSeriesSlugsQuery);
    return rows.map((r) => r.slug).filter((s): s is string => Boolean(s));
  } catch {
    return [];
  }
}

/** URL for a series cover or gallery frame. */
export function seriesImageUrl(
  image: SeriesImage | null | undefined,
  width = 1920,
): string | null {
  if (!image) return null;
  return urlFor(image as unknown as SanityImageSource)
    .width(width)
    .quality(82)
    .url();
}
