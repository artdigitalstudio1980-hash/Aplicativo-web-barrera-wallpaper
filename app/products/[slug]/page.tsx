import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductDetailClient from './product-detail-client';
import { BreadcrumbSchema } from '@/components/schemas/breadcrumb-schema';
import { ProductSchema } from '@/components/schemas/product-schema';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://barrerawallpaper.com';

interface ProductPageProps {
  params: { slug: string };
}

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${baseUrl}/api/products?slug=${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    if (data.success && data.products?.length > 0) {
      return data.products[0];
    }
  } catch {}
  return null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product Not Found' };

  const images = Array.isArray(product.images) ? product.images : [];
  const imageUrl = images[0] || product.imageUrl;

  return {
    title: `${product.name} - Premium Wallpaper`,
    description: product.description || `${product.name} by Barrera Wallpaper. Premium quality wallpaper in ${product.category?.name || 'various styles'}. Shop online with worldwide shipping.`,
    keywords: `${product.name}, ${product.category?.name || 'wallpaper'}, premium wallpaper, buy wallpaper online`,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: `${product.name} - Barrera Wallpaper`,
      description: product.description || `${product.name} - Premium wallpaper by Barrera Wallpaper`,
      images: imageUrl ? [{ url: imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`, width: 800, height: 1000, alt: product.name }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const productSchema = {
    name: product.name,
    nameEs: product.nameEs,
    slug: product.slug,
    description: product.description,
    descriptionEs: product.descriptionEs,
    sku: product.sku,
    price: product.price,
    salePrice: product.salePrice,
    images: Array.isArray(product.images) ? product.images : [],
    category: product.category,
    material: product.material,
    dimensions: product.dimensions,
  };

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: '/' },
        { name: 'Catalog', url: '/catalog' },
        { name: product.category?.name || 'Products', url: `/collections/${product.category?.slug || ''}` },
        { name: product.name, url: `/products/${product.slug}` },
      ]} />
      <ProductSchema product={productSchema} />
      <ProductDetailClient product={product} />
    </>
  );
}
