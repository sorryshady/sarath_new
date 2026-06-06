import {
  PlaceholderPage,
  placeholderMetadata,
} from '@/components/global/PlaceholderPage';

export const metadata = placeholderMetadata(
  'Films',
  'Filmography with Vimeo lightbox — full build coming soon.',
);

export default function FilmsPage() {
  return (
    <PlaceholderPage
      title="Films"
      description="Filmography section — full GSAP build coming soon."
      background="var(--color-cinema-dark)"
      foreground="var(--color-parchment-text)"
      navTheme="dark"
    />
  );
}
