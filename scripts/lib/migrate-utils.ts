import { createClient } from 'next-sanity';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const LEGACY_BASE = 'https://www.sarathmenonfilms.com';

export type SanityImageRef = {
  _key: string;
  _type: 'image';
  asset: { _type: 'reference'; _ref: string };
};

export function loadEnvLocal() {
  const envPath = join(process.cwd(), '.env.local');
  try {
    const content = readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.warn('No .env.local found — using process.env only');
  }
}

export function createWriteClient() {
  loadEnvLocal();

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() ?? 'production';
  const apiVersion =
    process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim() ?? '2025-01-01';
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();

  if (!projectId) {
    throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local');
  }
  if (!token) {
    throw new Error('Missing SANITY_API_WRITE_TOKEN in .env.local');
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}

export function mediaFilename(url: string): string | null {
  const match = url.match(/\/_next\/static\/media\/([^/?#]+)/);
  return match?.[1] ?? null;
}

function decodeNextImageUrl(encoded: string): string | null {
  try {
    const decoded = decodeURIComponent(encoded);
    if (!decoded.includes('/_next/static/media/')) return null;
    return `${LEGACY_BASE}${decoded}`;
  } catch {
    return null;
  }
}

/** Extract gallery images once per file — avoids next/image + static path duplicates. */
export function extractSeriesImageUrls(html: string): string[] {
  const byFilename = new Map<string, string>();

  for (const match of html.matchAll(/_next\/image\?url=([^&"'\s]+)/g)) {
    const full = decodeNextImageUrl(match[1]);
    if (!full) continue;

    const filename = mediaFilename(full);
    if (!filename || !filename.startsWith('image')) continue;

    if (!byFilename.has(filename)) {
      byFilename.set(filename, full);
    }
  }

  return [...byFilename.entries()]
    .sort(([a], [b]) => {
      const numA = Number(a.match(/image_(\d+)/)?.[1] ?? 0);
      const numB = Number(b.match(/image_(\d+)/)?.[1] ?? 0);
      return numA - numB;
    })
    .map(([, url]) => url);
}

export function imageRef(assetId: string, key?: string): SanityImageRef {
  return {
    _key: key ?? randomUUID(),
    _type: 'image',
    asset: { _type: 'reference', _ref: assetId },
  };
}

export function dedupeGalleryByAsset<T extends { _key?: string; asset?: { _ref?: string } }>(
  gallery: T[],
): (T & { _key: string })[] {
  const seen = new Set<string>();
  const result: (T & { _key: string })[] = [];

  for (const item of gallery) {
    const ref = item.asset?._ref;
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    result.push({ ...item, _key: item._key ?? randomUUID() });
  }

  return result;
}

export async function fetchPage(path: string): Promise<string> {
  const url = `${LEGACY_BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}
