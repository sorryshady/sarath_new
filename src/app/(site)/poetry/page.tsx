import {
  PlaceholderPage,
  placeholderMetadata,
} from '@/components/global/PlaceholderPage';

export const metadata = placeholderMetadata(
  'Poetry',
  'Thirteen poems with scroll-driven reveals — full build coming soon.',
);

export default function PoetryPage() {
  return (
    <PlaceholderPage
      title="Poetry"
      description="Full poetry page with scroll-driven reveals — coming soon."
    />
  );
}
