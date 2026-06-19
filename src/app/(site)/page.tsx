import { HomePage } from '@/components/home/HomePage';
import { getAboutMeta, getAboutTeaser } from '@/lib/about';
import { getContactSettings } from '@/lib/contact';

export default async function Page() {
  const [aboutTeaser, aboutMeta, contactSettings] = await Promise.all([
    getAboutTeaser(),
    getAboutMeta(),
    getContactSettings(),
  ]);
  return (
    <HomePage
      aboutTeaser={aboutTeaser}
      aboutMeta={aboutMeta}
      contactSettings={contactSettings}
    />
  );
}
