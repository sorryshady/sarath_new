/**
 * Normalize film video fields to videoProvider + videoId.
 *
 * Usage: npm run repair:films
 */

import { createWriteClient } from './lib/migrate-utils';

const client = createWriteClient();

type FilmDoc = {
  _id: string;
  title: string;
  vimeoId?: string;
  youtubeId?: string;
  videoProvider?: string;
  videoId?: string;
};

async function main() {
  console.log('\nRepairing film video fields…\n');

  const films = await client.fetch<FilmDoc[]>(
    `*[_type == "film"]{ _id, title, vimeoId, youtubeId, videoProvider, videoId }`,
  );

  for (const film of films) {
    const provider =
      film.videoProvider ??
      (film.youtubeId ? 'youtube' : film.vimeoId ? 'vimeo' : undefined);
    const videoId = film.videoId ?? film.youtubeId ?? film.vimeoId;

    if (!provider || !videoId) {
      console.log(`⏭  ${film.title} — no video set`);
      continue;
    }

    if (film.videoProvider === provider && film.videoId === videoId) {
      console.log(`⏭  ${film.title} — already normalized`);
      continue;
    }

    await client
      .patch(film._id)
      .set({ videoProvider: provider, videoId })
      .commit();

    console.log(`✓  ${film.title} → ${provider}/${videoId}`);
  }

  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error('\nRepair failed:', err);
  process.exit(1);
});
