import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://barrerawallpaper.com';
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/catalog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/collections`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/shop`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/ai-studio`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/installation`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/design`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  return staticRoutes;
}
