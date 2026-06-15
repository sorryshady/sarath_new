import type { Metadata } from 'next';

import { PoetryExperience } from '@/components/poetry/PoetryExperience';
import { getAllPoems } from '@/lib/poems';

export const metadata: Metadata = {
  title: 'Poetry',
  description: 'Selected verse — poems with scroll-driven reveals.',
};

export default async function PoetryPage() {
  const poems = await getAllPoems();
  return <PoetryExperience poems={poems} />;
}
