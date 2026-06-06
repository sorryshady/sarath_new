/**
 * Repair migrated photo series:
 * - Remove duplicate gallery images (same asset referenced twice)
 * - Add missing _key on gallery items
 *
 * Usage: npm run repair:photos
 */

import {
  createWriteClient,
  dedupeGalleryByAsset,
  extractSeriesImageUrls,
  fetchPage,
  imageRef,
  type SanityImageRef,
} from './lib/migrate-utils';

const PHOTO_SLUGS = [
  'helena',
  'lake',
  'rajasthan',
  'pride',
  'hazrat',
  'kashmir',
  'london',
  'concert',
  'life',
  'portraits',
] as const;

type PhotoSeriesDoc = {
  _id: string;
  title: string;
  slug: string;
  coverImage?: SanityImageRef;
  gallery?: Array<{
    _key?: string;
    _type: 'image';
    asset: { _ref: string };
  }>;
};

const client = createWriteClient();

async function main() {
  console.log('\nRepairing photo series galleries…\n');

  for (const slug of PHOTO_SLUGS) {
    const doc = await client.fetch<PhotoSeriesDoc | null>(
      `*[_type == "photoSeries" && slug.current == $slug][0]{
        _id, title, "slug": slug.current, coverImage, gallery
      }`,
      { slug },
    );

    if (!doc) {
      console.log(`⏭  ${slug} — not found`);
      continue;
    }

    const before = doc.gallery?.length ?? 0;
    const gallery = dedupeGalleryByAsset(doc.gallery ?? []) as SanityImageRef[];

    const html = await fetchPage(`/${slug}`);
    const expected = extractSeriesImageUrls(html).length;

    if (gallery.length !== expected) {
      console.warn(
        `   ⚠ ${slug}: ${gallery.length} after dedupe, legacy has ${expected} — check manually`,
      );
    }

    const coverImage = gallery[0]
      ? imageRef(gallery[0].asset._ref, gallery[0]._key)
      : doc.coverImage;

    await client
      .patch(doc._id)
      .set({
        gallery,
        coverImage,
        frameCount: String(gallery.length),
      })
      .commit();

    console.log(`✓  ${slug}: ${before} → ${gallery.length} images (expected ~${expected})`);
  }

  console.log('\nDone. Refresh Studio — gallery lists should be editable now.\n');
}

main().catch((err) => {
  console.error('\nRepair failed:', err);
  process.exit(1);
});
