import type { SanityImageSource } from '@sanity/image-url';

import { FEATURED_SERIES } from '@/lib/featuredSeries';
import type { PhotoSeries } from '@/types/photoSeries';
import { client, isSanityConfigured } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { featuredPhotoSeriesQuery } from '@/sanity/lib/queries';

type SanityFeaturedSeriesRow = {
  title: string;
  slug: string;
  coverImage: SanityImageSource;
  category?: string | null;
  year?: string | null;
  frameCount?: string | null;
  order?: number | null;
};

function parseFrameCount(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapSanityRow(row: SanityFeaturedSeriesRow, index: number): PhotoSeries {
  return {
    title: row.title,
    slug: row.slug,
    coverImage: urlFor(row.coverImage).width(800).height(1067).quality(82).url(),
    category: row.category ?? '',
    year: row.year ?? '',
    frameCount: parseFrameCount(row.frameCount),
    featured: true,
    order: row.order ?? index + 1,
  };
}

export async function getFeaturedPhotoSeries(): Promise<PhotoSeries[]> {
  if (!isSanityConfigured) {
    return FEATURED_SERIES;
  }

  try {
    const rows = await client.fetch<SanityFeaturedSeriesRow[]>(
      featuredPhotoSeriesQuery,
    );

    if (!rows?.length) {
      return FEATURED_SERIES;
    }

    return rows.map(mapSanityRow).sort((a, b) => a.order - b.order);
  } catch {
    return FEATURED_SERIES;
  }
}
