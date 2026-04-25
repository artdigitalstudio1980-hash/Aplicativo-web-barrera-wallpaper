import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://barrerawallpaper.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/cart/',
          '/checkout/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
