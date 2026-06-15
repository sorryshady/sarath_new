/** A Sanity image object (poem companion image). Passed to urlFor(). */
export type PoemImage = {
  _type?: string;
  asset?: { _ref: string; _type?: string };
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
};

export type Poem = {
  _id: string;
  title: string;
  body: string;
  year?: string | null;
  image?: PoemImage | null;
  imageAspectRatio?: number | null;
  imageCaption?: string | null;
  featured?: boolean;
  order?: number | null;
};
