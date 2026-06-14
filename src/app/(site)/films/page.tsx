import type { Metadata } from 'next';

import { FilmsExperience } from '@/components/films/FilmsExperience';
import { getAllFilms } from '@/lib/films';

export const metadata: Metadata = {
  title: 'Films',
  description: 'Filmography — direction, cinematography, and screenwriting.',
};

export default async function FilmsPage() {
  const films = await getAllFilms();
  return <FilmsExperience films={films} />;
}
