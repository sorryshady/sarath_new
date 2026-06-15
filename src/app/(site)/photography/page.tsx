import type { Metadata } from 'next';

import { PhotographyExperience } from '@/components/photography/PhotographyExperience';
import { getAllPhotoSeries } from '@/lib/photoSeries';

export const metadata: Metadata = {
  title: 'Photography',
  description: 'Photo series — selected work across light and stillness.',
};

export default async function PhotographyPage() {
  const series = await getAllPhotoSeries();
  return <PhotographyExperience series={series} />;
}
