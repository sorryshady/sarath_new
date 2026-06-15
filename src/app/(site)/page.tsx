import { HomePage } from '@/components/home/HomePage';
import { getAboutMeta, getAboutTeaser } from '@/lib/about';

export default async function Page() {
  const [aboutTeaser, aboutMeta] = await Promise.all([
    getAboutTeaser(),
    getAboutMeta(),
  ]);
  return <HomePage aboutTeaser={aboutTeaser} aboutMeta={aboutMeta} />;
}
