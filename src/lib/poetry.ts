import { client, isSanityConfigured } from '@/sanity/lib/client';
import { poetryTeaserResolvedQuery } from '@/sanity/lib/queries';
import type { PoetryTeaser } from '@/types/poetryTeaser';

export async function getPoetryTeaser(): Promise<PoetryTeaser | null> {
  if (!isSanityConfigured) return null;
  try {
    return await client.fetch(poetryTeaserResolvedQuery);
  } catch {
    return null;
  }
}

/**
 * Excerpt lines for the teaser: prefer the curated excerptLines, otherwise
 * fall back to the first non-blank lines of the linked poem's body.
 */
export function teaserExcerpt(teaser: PoetryTeaser | null, max = 4): string[] {
  const curated = teaser?.excerptLines?.map((l) => l.trim()).filter(Boolean);
  if (curated && curated.length > 0) return curated.slice(0, max);

  const body = teaser?.bodyFallback;
  if (!body) return [];
  return body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, max);
}
