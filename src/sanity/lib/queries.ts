import { defineQuery } from 'next-sanity';

export const siteSettingsQuery = defineQuery(`*[_type == "siteSettings"][0]`);

export const aboutTeaserQuery = defineQuery(`*[_type == "aboutTeaser"][0]`);

export const poetryTeaserQuery = defineQuery(`*[_type == "poetryTeaser"][0]`);

export const featuredPhotoSeriesQuery = defineQuery(`
  *[_type == "photoSeries" && featured == true] | order(order asc) [0...6] {
    _id,
    title,
    "slug": slug.current,
    coverImage,
    "coverAspectRatio": coverImage.asset->metadata.dimensions.aspectRatio,
    category,
    year,
    frameCount,
    order
  }
`);

export const allPhotoSeriesQuery = defineQuery(`
  *[_type == "photoSeries"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    coverImage,
    "coverAspectRatio": coverImage.asset->metadata.dimensions.aspectRatio,
    category,
    year,
    frameCount,
    order
  }
`);

export const photoSeriesBySlugQuery = defineQuery(`
  *[_type == "photoSeries" && slug.current == $slug][0] {
    ...,
    "coverAspectRatio": coverImage.asset->metadata.dimensions.aspectRatio,
    "gallery": gallery[]{
      ...,
      "aspectRatio": asset->metadata.dimensions.aspectRatio
    }
  }
`);

export const allPhotoSeriesSlugsQuery = defineQuery(`
  *[_type == "photoSeries" && defined(slug.current)]{ "slug": slug.current }
`);

export const featuredFilmsQuery = defineQuery(`
  *[_type == "film" && featured == true] | order(order asc)
`);

export const allFilmsQuery = defineQuery(`
  *[_type == "film"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    videoProvider,
    videoId,
    vimeoId,
    youtubeId,
    thumbnail,
    "thumbAspect": thumbnail.asset->metadata.dimensions.aspectRatio,
    description,
    format,
    year,
    role,
    award
  }
`);

export const featuredPoemsQuery = defineQuery(`
  *[_type == "poem" && featured == true] | order(order asc)
`);

export const allPoemsQuery = defineQuery(`
  *[_type == "poem"] | order(order asc)
`);
