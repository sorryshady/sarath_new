import { StudioSetup } from '@/components/studio/StudioSetup';
import { isSanityConfigured } from '@/sanity/env';

export const dynamic = 'force-static';

export { metadata, viewport } from 'next-sanity/studio';

export default async function StudioPage() {
  if (!isSanityConfigured) {
    return <StudioSetup />;
  }

  const [{ NextStudio }, { default: config }] = await Promise.all([
    import('next-sanity/studio'),
    import('../../../../../sanity.config'),
  ]);

  return <NextStudio config={config} />;
}
