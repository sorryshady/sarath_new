import type { SanityImageSource } from '@sanity/image-url';

import { client, isSanityConfigured } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { allPoemsQuery } from '@/sanity/lib/queries';
import type { Poem, PoemImage } from '@/types/poem';

export async function getAllPoems(): Promise<Poem[]> {
  if (!isSanityConfigured) return [];
  try {
    return await client.fetch(allPoemsQuery);
  } catch {
    return [];
  }
}

/** URL for a poem's companion image. */
export function poemImageUrl(
  image: PoemImage | null | undefined,
  width = 1600,
): string | null {
  if (!image) return null;
  return urlFor(image as unknown as SanityImageSource)
    .width(width)
    .quality(82)
    .url();
}
