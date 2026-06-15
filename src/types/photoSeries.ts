/** A Sanity image object (series cover or gallery frame). Passed to urlFor(). */
export type SeriesImage = {
  _key?: string;
  _type?: string;
  asset?: { _ref: string; _type?: string };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  caption?: string | null;
  aspectRatio?: number | null;
};

export type PhotoSeries = {
  _id: string;
  title: string;
  slug?: string | null;
  coverImage?: SeriesImage | null;
  coverAspectRatio?: number | null;
  gallery?: SeriesImage[] | null;
  category?: string | null;
  year?: string | null;
  frameCount?: string | null;
  order?: number | null;
};
