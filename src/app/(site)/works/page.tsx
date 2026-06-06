import {
  PlaceholderPage,
  placeholderMetadata,
} from '@/components/global/PlaceholderPage';

export const metadata = placeholderMetadata(
  'Works',
  'Photography archive — full grid coming soon.',
);

export default function WorksPage() {
  return (
    <PlaceholderPage
      title="Works"
      description="Photography archive — full grid coming soon."
    />
  );
}
