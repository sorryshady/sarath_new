import { HomePage } from '@/components/home/HomePage';
import { getAboutMeta, getAboutTeaser } from '@/lib/about';
import { getContactSettings } from '@/lib/contact';
import { getFeaturedFilms } from '@/lib/films';
import { getFeaturedPhotoSeries } from '@/lib/photoSeries';
import { getPoetryTeaser } from '@/lib/poetry';

export default async function Page() {
  const [
    films,
    photoSeries,
    poetryTeaser,
    aboutTeaser,
    aboutMeta,
    contactSettings,
  ] = await Promise.all([
    getFeaturedFilms(),
    getFeaturedPhotoSeries(),
    getPoetryTeaser(),
    getAboutTeaser(),
    getAboutMeta(),
    getContactSettings(),
  ]);
  return (
    <HomePage
      films={films}
      photoSeries={photoSeries}
      poetryTeaser={poetryTeaser}
      aboutTeaser={aboutTeaser}
      aboutMeta={aboutMeta}
      contactSettings={contactSettings}
    />
  );
}
