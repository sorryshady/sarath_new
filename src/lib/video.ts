/** Placeholder hero showreel — override via NEXT_PUBLIC_HERO_VIMEO_ID or Sanity siteSettings */
export const HERO_VIMEO_PLACEHOLDER_ID = '409444661';

/** Local test reel served from /public/assets. Swapped for Vimeo/YouTube in production. */
export const HERO_LOCAL_REEL_SRC = '/assets/reel.mp4';

export type VideoProvider = 'local' | 'vimeo' | 'youtube';

export type VideoSource = {
  provider: VideoProvider;
  /** Vimeo/YouTube video ID, or the file URL for the `local` provider. */
  id: string;
};

export function getHeroVimeoVideoId(): number {
  const fromEnv = process.env.NEXT_PUBLIC_HERO_VIMEO_ID;
  const id = fromEnv?.trim() || HERO_VIMEO_PLACEHOLDER_ID;
  return Number(id);
}

/**
 * Resolve the hero showreel source.
 *
 * Production: the client's Vimeo/YouTube showreel arrives from Sanity
 * siteSettings (heroVideoProvider + heroVideoId) and is passed in here, or
 * configured via NEXT_PUBLIC_HERO_VIDEO_PROVIDER / NEXT_PUBLIC_HERO_VIDEO_ID.
 *
 * For now (no client video yet) this falls back to the local test reel so the
 * hero can be developed end-to-end. The Vimeo/YouTube paths stay fully wired.
 */
export function getHeroVideoSource(): VideoSource {
  const provider = process.env.NEXT_PUBLIC_HERO_VIDEO_PROVIDER?.trim();
  const id = process.env.NEXT_PUBLIC_HERO_VIDEO_ID?.trim();

  if (provider === 'vimeo' && id) return { provider: 'vimeo', id };
  if (provider === 'youtube' && id) return { provider: 'youtube', id };

  // Legacy single-purpose env var still supported.
  const legacyVimeo = process.env.NEXT_PUBLIC_HERO_VIMEO_ID?.trim();
  if (legacyVimeo) return { provider: 'vimeo', id: legacyVimeo };

  return { provider: 'local', id: HERO_LOCAL_REEL_SRC };
}

export function getVimeoPosterUrl(
  videoId: string | number = getHeroVimeoVideoId(),
): string {
  return `https://vumbnail.com/${videoId}.jpg`;
}

/** Best-effort poster frame for a given source. `local` has no remote poster. */
export function getVideoPosterUrl(source: VideoSource): string | undefined {
  if (source.provider === 'vimeo') return getVimeoPosterUrl(source.id);
  if (source.provider === 'youtube') {
    return `https://img.youtube.com/vi/${source.id}/maxresdefault.jpg`;
  }
  return undefined;
}

/** Background-video embed URL for iframe-based providers (YouTube). */
export function videoEmbedUrl(source: VideoSource): string {
  if (source.provider === 'youtube') {
    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      controls: '0',
      loop: '1',
      playlist: source.id,
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
      disablekb: '1',
      fs: '0',
      iv_load_policy: '3',
      enablejsapi: '1',
    });
    return `https://www.youtube.com/embed/${source.id}?${params.toString()}`;
  }
  return `https://player.vimeo.com/video/${source.id}`;
}

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
