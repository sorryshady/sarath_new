import type { SanityImageSource } from '@sanity/image-url';

import { client, isSanityConfigured } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { aboutTeaserQuery, siteSettingsQuery } from '@/sanity/lib/queries';
import type { AboutImage, AboutMeta, AboutTeaser } from '@/types/about';

export async function getAboutTeaser(): Promise<AboutTeaser | null> {
  if (!isSanityConfigured) return null;
  try {
    return await client.fetch(aboutTeaserQuery);
  } catch {
    return null;
  }
}

export async function getAboutMeta(): Promise<AboutMeta | null> {
  if (!isSanityConfigured) return null;
  try {
    return await client.fetch(siteSettingsQuery);
  } catch {
    return null;
  }
}

/** URL for the about portrait. */
export function portraitUrl(
  image: AboutImage | null | undefined,
  width = 1200,
): string | null {
  if (!image) return null;
  return urlFor(image as unknown as SanityImageSource)
    .width(width)
    .quality(82)
    .url();
}
