/**
 * One-time migration: sarathmenonfilms.com → Sanity CMS
 * Idempotent — skips documents that already exist by slug / singleton id.
 *
 * Usage: npm run migrate
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  createWriteClient,
  extractSeriesImageUrls,
  fetchPage,
  imageRef,
  LEGACY_BASE,
  type SanityImageRef,
} from './lib/migrate-utils';

const client = createWriteClient();

// --- helpers ---------------------------------------------------------------

const uploaded = new Map<string, string>();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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

async function uploadImage(
  sourceUrl: string,
  filename: string,
): Promise<SanityImageRef> {
  const cached = uploaded.get(sourceUrl);
  if (cached) {
    return imageRef(cached);
  }

  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`Failed to download ${sourceUrl}: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload('image', buffer, { filename });

  uploaded.set(sourceUrl, asset._id);
  return imageRef(asset._id);
}

async function docExistsBySlug(type: string, slug: string): Promise<boolean> {
  const existing = await client.fetch(
    `*[_type == $type && slug.current == $slug][0]._id`,
    { type, slug },
  );
  return Boolean(existing);
}

async function singletonExists(type: string, id: string): Promise<boolean> {
  const existing = await client.fetch(`*[_id == $id][0]._id`, { id });
  return Boolean(existing);
}

// --- content config --------------------------------------------------------

const PHOTO_SERIES = [
  { slug: 'helena', title: 'Fashion - Helena Antonio', featured: false, order: 0 },
  { slug: 'lake', title: 'Lake District', featured: true, order: 1 },
  { slug: 'rajasthan', title: 'Rajasthan', featured: true, order: 2 },
  { slug: 'pride', title: 'Pride', featured: true, order: 3 },
  { slug: 'hazrat', title: 'Hazrat Nizamuddin Auliya Durgah', featured: false, order: 4 },
  { slug: 'kashmir', title: 'Kashmir', featured: true, order: 5 },
  { slug: 'london', title: 'London', featured: true, order: 6 },
  { slug: 'concert', title: 'Concert', featured: false, order: 7 },
  { slug: 'life', title: 'Life', featured: false, order: 8 },
  { slug: 'portraits', title: 'Portraits', featured: true, order: 9 },
] as const;

const FILMS = [
  {
    slug: 'death-of-don-quixote',
    title: 'The Death of Don Quixote',
    videoProvider: 'vimeo' as const,
    videoId: '409444661',
    description:
      'The Death of Don Quixote is a period drama about a chaotic film set shooting the life and death of Spanish legend Don Quixote.',
    format: 'Short film',
    year: '2018',
    role: 'dop',
    award: 'Best Cinematographer — Pilas En Corto International Film Festival, Spain',
    thumbnailPath: '/_next/static/media/deathOfDon.f50d8f6c.webp',
    featured: true,
    order: 0,
  },
  {
    slug: 'rajakumaran',
    title: 'Rajakumaran',
    description:
      'Rajakumaran is a Kerala State Award winning Malayalam Short Film about a mysterious bedtime story.',
    format: 'Short film',
    year: '',
    role: 'director',
    thumbnailPath: '/_next/static/media/rajakumaran.133a720c.jpg',
    featured: true,
    order: 1,
  },
  {
    slug: 'the-red-ball',
    title: 'The Red Ball',
    description:
      'The Red Ball is a short film made as a part of the CSR Campaign for Association of Mentally Handicapped Adults (AMHA), a Non-Profit Organisation based in Thrissur, Kerala, India.',
    format: 'Short film',
    year: '',
    role: 'director',
    thumbnailPath: '/_next/static/media/redball.b6fbcc0d.jpg',
    featured: true,
    order: 2,
  },
] as const;

const ABOUT_TEASER_BIO =
  'Sarath Menon trained at the London Film School after his debut film was recognised at the 2016 Kerala State Chalachitra Academy Awards. He works across film, photography, and poetry — three disciplines sharing a single eye.';

const PORTRAIT_PATH = '/_next/static/media/SarathMenon.328b60b8.jpg';

// --- parsers ---------------------------------------------------------------

type ParsedPoem = {
  title: string;
  slug: string;
  body: string;
  imageUrl: string | null;
};

function parsePoemsFromMarkdown(md: string): ParsedPoem[] {
  const poems: ParsedPoem[] = [];
  const blocks = md.split(/\n# /).slice(1);

  for (const block of blocks) {
    const [titleLine, ...rest] = block.split('\n');
    const title = titleLine.trim();
    if (!title || title === 'Contact') continue;

    const content = rest.join('\n');
    const imageMatch = content.match(
      /!\[[^\]]*\]\((https:\/\/www\.sarathmenonfilms\.com[^)]+)\)/,
    );
    const imageUrl = imageMatch?.[1] ?? null;

    const body = content
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    poems.push({
      title,
      slug: slugify(title),
      body,
      imageUrl,
    });
  }

  return poems;
}

// --- migrations ------------------------------------------------------------

async function migrateSiteSettings() {
  const id = 'siteSettings';
  if (await singletonExists('siteSettings', id)) {
    console.log('⏭  siteSettings already exists');
    return;
  }

  await client.createOrReplace({
    _id: id,
    _type: 'siteSettings',
    photographerLabel: 'Photographer',
    filmmakerLabel: 'Filmmaker',
    lfsCredit: 'London Film School',
    coordinates: '51.5074° N, 0.1278° W',
    location: 'London, UK',
    contactEmail: 'sarathmenonfilms@gmail.com',
    contactPhone: '+91 7387000371',
    contactLocation: 'London, UK',
    instagramUrl: 'https://www.instagram.com/sarathmenonfilms/',
    seoTitle: 'Sarath Menon — Photographer, Filmmaker, Poet',
    seoDescription:
      'Portfolio of Sarath Menon — photographer, filmmaker, and poet. London Film School alumnus.',
  });

  console.log('✓  siteSettings created');
}

async function migrateAboutTeaser() {
  const id = 'aboutTeaser';
  if (await singletonExists('aboutTeaser', id)) {
    console.log('⏭  aboutTeaser already exists');
    return;
  }

  const portrait = await uploadImage(
    `${LEGACY_BASE}${PORTRAIT_PATH}`,
    'sarath-portrait.jpg',
  );

  await client.createOrReplace({
    _id: id,
    _type: 'aboutTeaser',
    portrait,
    portraitCaption: 'Sarath Menon',
    bioText: ABOUT_TEASER_BIO,
  });

  console.log('✓  aboutTeaser created');
}

async function migratePhotoSeries() {
  for (const series of PHOTO_SERIES) {
    if (await docExistsBySlug('photoSeries', series.slug)) {
      console.log(`⏭  photoSeries/${series.slug} already exists`);
      continue;
    }

    console.log(`→  photoSeries/${series.slug}…`);
    const html = await fetchPage(`/${series.slug}`);
    const imageUrls = extractSeriesImageUrls(html);

    if (imageUrls.length === 0) {
      console.warn(`   ⚠ no images found for ${series.slug}`);
      continue;
    }

    const coverImage = await uploadImage(imageUrls[0], `${series.slug}-cover.jpg`);
    const gallery: SanityImageRef[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      gallery.push(
        await uploadImage(imageUrls[i], `${series.slug}-${i}.jpg`),
      );
    }

    await client.create({
      _type: 'photoSeries',
      title: series.title,
      slug: { _type: 'slug', current: series.slug },
      coverImage,
      gallery,
      frameCount: String(gallery.length),
      featured: series.featured,
      order: series.order,
    });

    console.log(`✓  photoSeries/${series.slug} (${gallery.length} images)`);
  }
}

async function migrateFilms() {
  for (const film of FILMS) {
    if (await docExistsBySlug('film', film.slug)) {
      console.log(`⏭  film/${film.slug} already exists`);
      continue;
    }

    const thumbnail = await uploadImage(
      `${LEGACY_BASE}${film.thumbnailPath}`,
      `${film.slug}-thumb.jpg`,
    );

    await client.create({
      _type: 'film',
      title: film.title,
      slug: { _type: 'slug', current: film.slug },
      videoProvider: 'videoProvider' in film ? film.videoProvider : undefined,
      videoId: 'videoId' in film ? film.videoId : undefined,
      thumbnail,
      description: film.description,
      format: film.format,
      year: film.year || undefined,
      role: film.role,
      award: 'award' in film ? film.award : undefined,
      featured: film.featured,
      order: film.order,
    });

    console.log(`✓  film/${film.slug}`);
  }
}

async function migratePoems() {
  const mdPath = join(process.cwd(), '.firecrawl/poems.md');
  let poems: ParsedPoem[];

  try {
    const md = readFileSync(mdPath, 'utf8');
    poems = parsePoemsFromMarkdown(md);
  } catch {
    console.log('→  Fetching /poems (no cached markdown)…');
    const html = await fetchPage('/poems');
    poems = parsePoemsFromMarkdown(
      html
        .replace(/<h1[^>]*>/gi, '\n# ')
        .replace(/<\/h1>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, ''),
    );
  }

  let firstPoemId: string | null = null;

  for (let i = 0; i < poems.length; i++) {
    const poem = poems[i];
    if (await docExistsBySlug('poem', poem.slug)) {
      console.log(`⏭  poem/${poem.slug} already exists`);
      const id = await client.fetch<string>(
        `*[_type == "poem" && slug.current == $slug][0]._id`,
        { slug: poem.slug },
      );
      if (!firstPoemId && id) firstPoemId = id;
      continue;
    }

    let image: SanityImageRef | undefined;
    if (poem.imageUrl) {
      const staticUrl = poem.imageUrl.includes('_next/image')
        ? decodeNextImageUrl(
            poem.imageUrl.split('url=')[1]?.split('&')[0] ?? '',
          )
        : poem.imageUrl;
      if (staticUrl) {
        image = await uploadImage(staticUrl, `${poem.slug}.jpg`);
      }
    }

    const doc = await client.create({
      _type: 'poem',
      title: poem.title,
      slug: { _type: 'slug', current: poem.slug },
      body: poem.body,
      image,
      featured: i < 3,
      order: i,
    });

    if (!firstPoemId) firstPoemId = doc._id;
    console.log(`✓  poem/${poem.slug}`);
  }

  return firstPoemId;
}

async function migratePoetryTeaser(firstPoemId: string | null) {
  const id = 'poetryTeaser';
  if (await singletonExists('poetryTeaser', id)) {
    console.log('⏭  poetryTeaser already exists');
    return;
  }

  await client.createOrReplace({
    _id: id,
    _type: 'poetryTeaser',
    excerptLines: [
      'The air you breathe',
      'And the curve of your smile',
      'The fall of your hair',
      'And the blush on your cheeks',
    ],
    linkedPoem: firstPoemId
      ? { _type: 'reference', _ref: firstPoemId }
      : undefined,
    poemTitle: 'The Air You Breathe',
    poemYear: '',
  });

  console.log('✓  poetryTeaser created');
}

// --- main ------------------------------------------------------------------

async function main() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
  console.log(`\nMigrating ${LEGACY_BASE} → Sanity (${projectId}/${dataset})\n`);

  await migrateSiteSettings();
  await migrateAboutTeaser();
  await migratePhotoSeries();
  await migrateFilms();
  const firstPoemId = await migratePoems();
  await migratePoetryTeaser(firstPoemId);

  console.log(`\nDone. ${uploaded.size} images uploaded.\n`);
  console.log('Manual gaps to fill in Studio:');
  console.log('  • siteSettings.heroVimeoId + heroPoster');
  console.log('  • siteSettings.vimeoUrl, linkedinUrl');
  console.log('  • poem years, photo series categories/years');
  console.log('  • Confirm contact location (London vs India phone)\n');
}

main().catch((err) => {
  console.error('\nMigration failed:', err);
  process.exit(1);
});
