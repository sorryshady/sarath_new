import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PhotoSeriesDetail } from '@/components/photography/PhotoSeriesDetail';
import { getAllPhotoSeriesSlugs, getPhotoSeries } from '@/lib/photoSeries';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllPhotoSeriesSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getPhotoSeries(slug);
  if (!series) return { title: 'Not found' };
  return {
    title: series.title,
    description: series.category
      ? `${series.title} — ${series.category}`
      : series.title,
  };
}

export default async function PhotoSeriesPage({ params }: PageProps) {
  const { slug } = await params;
  const series = await getPhotoSeries(slug);
  if (!series) notFound();
  return <PhotoSeriesDetail series={series} />;
}
