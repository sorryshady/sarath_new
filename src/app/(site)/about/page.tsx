import {
  PlaceholderPage,
  placeholderMetadata,
} from '@/components/global/PlaceholderPage';

export const metadata = placeholderMetadata(
  'About',
  'Full about page — Phase 2. Home teaser section ships first.',
);

export default function AboutPage() {
  return (
    <PlaceholderPage
      title="About"
      description="Full biography and portrait gallery — coming in Phase 2."
      background="var(--color-cream)"
    />
  );
}
