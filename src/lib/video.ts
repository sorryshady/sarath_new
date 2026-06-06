/** Placeholder hero showreel — override via NEXT_PUBLIC_HERO_VIMEO_ID or Sanity siteSettings */
export const HERO_VIMEO_PLACEHOLDER_ID = '409444661';

export function getHeroVimeoVideoId(): number {
  const fromEnv = process.env.NEXT_PUBLIC_HERO_VIMEO_ID;
  const id = fromEnv?.trim() || HERO_VIMEO_PLACEHOLDER_ID;
  return Number(id);
}

export function getVimeoPosterUrl(
  videoId: string | number = getHeroVimeoVideoId(),
): string {
  return `https://vumbnail.com/${videoId}.jpg`;
}

export type VideoProvider = 'vimeo' | 'youtube';

export type VideoSource = {
  provider: VideoProvider;
  id: string;
};

/** Resolve video source from Sanity film or siteSettings fields (new + legacy). */
export function resolveVideoSource(doc: {
  videoProvider?: string | null;
  videoId?: string | null;
  vimeoId?: string | null;
  youtubeId?: string | null;
  heroVideoProvider?: string | null;
  heroVideoId?: string | null;
  heroVimeoId?: string | null;
}): VideoSource | null {
  const provider =
    doc.videoProvider ??
    doc.heroVideoProvider ??
    (doc.youtubeId ? 'youtube' : doc.vimeoId || doc.heroVimeoId ? 'vimeo' : null);

  const id =
    doc.videoId ??
    doc.heroVideoId ??
    doc.youtubeId ??
    doc.vimeoId ??
    doc.heroVimeoId ??
    null;

  if (!provider || !id) return null;
  if (provider !== 'vimeo' && provider !== 'youtube') return null;

  return { provider, id };
}

export function videoEmbedUrl(source: VideoSource): string {
  if (source.provider === 'youtube') {
    return `https://www.youtube.com/embed/${source.id}`;
  }
  return `https://player.vimeo.com/video/${source.id}`;
}
