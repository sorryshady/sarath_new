import { HomePage } from '@/components/home/HomePage';
import { getFeaturedPhotoSeries } from '@/lib/photoSeries';

export default async function Page() {
  const featuredSeries = await getFeaturedPhotoSeries();

  return <HomePage featuredSeries={featuredSeries} />;
}
