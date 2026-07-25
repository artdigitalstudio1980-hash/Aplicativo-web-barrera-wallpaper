'use client';

import { useEffect } from 'react';

const baseUrl = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_BASE_URL || window.location.origin)
  : 'https://barrerawallpaper.com';

interface ClientProduct {
  name: string;
  slug: string;
  description?: string;
  sku: string;
  price: number;
  salePrice?: number;
  images: string[];
  category?: { name: string };
  material?: string;
}

export function ClientProductCollectionSchema({ products }: { products: ClientProduct[] }) {
  useEffect(() => {
    const existing = document.getElementById('product-collection-schema');
    if (existing) existing.remove();

    if (!products.length) return;

    const schema = {
      '@context': 'https://schema.org',
      '@graph': products.slice(0, 20).map((product) => {
        const images = Array.isArray(product.images) ? product.images : [];
        const imageUrl = images[0] ? `${baseUrl}${images[0]}` : `${baseUrl}/og-image.jpg`;

        return {
          '@type': 'Product',
          name: product.name,
          description: product.description || `${product.name} - Premium wallpaper`,
          sku: product.sku,
          image: imageUrl,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: product.salePrice || product.price,
            availability: 'https://schema.org/InStock',
          },
          category: product.category?.name || 'Wallpaper',
        };
      }),
    };

    const script = document.createElement('script');
    script.id = 'product-collection-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('product-collection-schema');
      if (el) el.remove();
    };
  }, [products]);

  return null;
}
