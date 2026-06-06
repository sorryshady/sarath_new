import type { MetadataRoute } from 'next';

const baseUrl = 'https://sarathmenonfilms.com';

const staticRoutes = ['', '/works', '/films', '/poetry', '/about'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return staticRoutes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
