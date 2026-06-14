import type { SanityImageSource } from '@sanity/image-url';

export type FilmRole = 'director' | 'dop' | 'screenwriter';

export type Film = {
  _id: string;
  title: string;
  slug?: string | null;
  videoProvider?: string | null;
  videoId?: string | null;
  vimeoId?: string | null;
  youtubeId?: string | null;
  thumbnail?: SanityImageSource | null;
  thumbAspect?: number | null;
  description?: string | null;
  format?: string | null;
  year?: string | null;
  role?: FilmRole | string | null;
  award?: string | null;
};

/** Human-readable credit for a film's role. */
export const FILM_ROLE_LABELS: Record<string, string> = {
  director: 'Director',
  dop: 'Director of Photography',
  screenwriter: 'Screenwriter',
};

export function filmRoleLabel(role?: string | null): string | null {
  if (!role) return null;
  return FILM_ROLE_LABELS[role] ?? role;
}
