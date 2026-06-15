/** A Sanity image object (about portrait). Passed to urlFor(). */
export type AboutImage = {
  _type?: string;
  asset?: { _ref: string; _type?: string };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
};

export type AboutTeaser = {
  portrait?: AboutImage | null;
  portraitCaption?: string | null;
  bioText?: string | null;
};

/** Identity meta drawn from siteSettings (a subset — extra fields are ignored). */
export type AboutMeta = {
  photographerLabel?: string | null;
  filmmakerLabel?: string | null;
  lfsCredit?: string | null;
  location?: string | null;
};
