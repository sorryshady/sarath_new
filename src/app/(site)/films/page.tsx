import type { Metadata } from 'next';

import { CraftStub } from '@/components/dev/CraftStub';

export const metadata: Metadata = {
  title: 'Films',
  description: 'Filmography with cinema lightbox — full build coming soon.',
};

export default function FilmsPage() {
  return <CraftStub name="Films" />;
}
