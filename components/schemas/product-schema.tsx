import JsonLdScript from '@/components/json-ld-script';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://barrerawallpaper.com';

interface ProductSchemaProps {
  product: {
    name: string;
    nameEs?: string;
    slug: string;
    description?: string;
    descriptionEs?: string;
    sku: string;
    price: number;
    salePrice?: number;
    images: string[];
    category: { name: string; slug: string };
    material?: string;
    dimensions?: string;
  };
}

export function ProductSchema({ product }: ProductSchemaProps) {
  const images = Array.isArray(product.images) ? product.images : [];
  const imageUrl = images[0] ? `${baseUrl}${images[0]}` : `${baseUrl}/og-image.jpg`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/products/${product.slug}#product`,
    name: product.name,
    description: product.description || `${product.name} - Premium wallpaper by Barrera Wallpaper`,
    sku: product.sku,
    mpn: product.sku,
    image: imageUrl,
    url: `${baseUrl}/products/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: 'Barrera Wallpaper',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: 'USD',
      price: product.salePrice || product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'Barrera Wallpaper',
      },
    },
    category: product.category.name,
    material: product.material || undefined,
  };

  if (product.dimensions) {
    (schema as Record<string, unknown>).width = product.dimensions;
  }

  return <JsonLdScript data={schema} />;
}

export function ProductCollectionSchema({ products }: { products: ProductSchemaProps['product'][] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${baseUrl}/products/${product.slug}`,
      name: product.name,
    })),
  };

  return <JsonLdScript data={schema} />;
}
