import { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://barrerawallpaper.com';

const CATEGORY_SLUGS = ['systexx-pure', 'systexx-phantasy', 'systexx-active'] as const;

async function getProductSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${base}/api/products`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && Array.isArray(data.products)) {
      return data.products.map((p: any) => p.slug).filter(Boolean);
    }
  } catch {}
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/catalog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/installation`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/design`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${base}/collections/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const productSlugs = await getProductSlugs();
  const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug: string) => ({
    url: `${base}/products/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
