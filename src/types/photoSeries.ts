export interface PhotoSeries {
  title: string;
  slug: string;
  coverImage: string;
  /** Native width/height ratio of the cover image (w / h). */
  coverAspectRatio: number;
  category: string;
  year: string;
  frameCount: number;
  featured: boolean;
  order: number;
}
