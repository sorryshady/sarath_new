import type { Metadata } from 'next';

import { CraftStub } from '@/components/dev/CraftStub';

export const metadata: Metadata = {
  title: 'Photography',
  description: 'Photo series index — full build coming soon.',
};

export default function PhotographyPage() {
  return (
    <CraftStub
      name="Photography"
      background="var(--color-cream)"
      foreground="var(--color-ink)"
    />
  );
}
