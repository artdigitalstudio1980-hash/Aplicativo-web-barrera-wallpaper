export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import catalogData from '@/prisma/catalog_master.json';

// ─── IMAGE MAPPING (mirrors seed-master.ts logic) ───
// Pre-computed mapping of known catalog images in public/catalogo/
const CATALOG_IMAGES: Record<string, string> = {
  // SYSTEXX Active
  'SYSTEXX-ACTIVE-ABSORB-060': '/catalogo/active-absorb-060.png',
  'SYSTEXX-ACTIVE-ABSORB-633': '/catalogo/active-absorb-633.png',
  'SYSTEXX-ACTIVE-ABSORB-639': '/catalogo/active-absorb-639.png',
  'SYSTEXX-ACTIVE-ACOUSTHERM-233': '/catalogo/active-acoustherm-233.png',
  'SYSTEXX-ACTIVE-ACOUSTIC-102': '/catalogo/active-acoustic-102.png',
  'SYSTEXX-ACTIVE-FIREPROTECT-FP04': '/catalogo/active-fireprotect-fp04.png',
  'SYSTEXX-ACTIVE-FIREPROTECT-FP78': '/catalogo/active-fireprotect-fp78.png',
  'SYSTEXX-ACTIVE-FIREPROTECT-FP79': '/catalogo/active-fireprotect-fp79.png',
  'SYSTEXX-ACTIVE-MAGNETIC-101': '/catalogo/active-magnetic-101.png',
  'SYSTEXX-ACTIVE-MAGNETIC-M39': '/catalogo/active-magnetic-m39.png',
  'SYS-ACT-M20': '/catalogo/active-magnetic-collection-overview.png',
  'SYS-ACT-R938': '/catalogo/active-reno-overview.png',
  // SYSTEXX Phantasy
  'SYSTEXX-PHANTASY-ARABESQUE-084': '/catalogo/phantasy-arabesque-084.png',
  'SYSTEXX-PHANTASY-BAMBOO-050': '/catalogo/phantasy-bamboo-050.png',
  'SYSTEXX-PHANTASY-DAMASK-083': '/catalogo/phantasy-damask-083.png',
  'SYSTEXX-PHANTASY-ORIENT-082': '/catalogo/phantasy-orient-082.png',
  'SYSTEXX-PHANTASY-STARDUST-073': '/catalogo/phantasy-stardust-073.png',
  'SYSTEXX-PHANTASY-VERSAILLES-080': '/catalogo/phantasy-versailles-080.png',
  'SYS-PHA-050': '/catalogo/phantasy-bamboo-050.png',
  'SYS-PHA-072': '/catalogo/phantasy-stardust-073.png',
  'SYS-PHA-073': '/catalogo/phantasy-stardust-073.png',
  'SYS-PHA-077': '/catalogo/phantasy-damask-083.png',
  'SYS-PHA-087': '/catalogo/phantasy-bamboo-lifestyle.png',
  // SYSTEXX Pure
  'SYSTEXX-PURE-BARK-071': '/catalogo/pure-bark-071.png',
  'SYSTEXX-PURE-CANVAS-043': '/catalogo/pure-canvas-043.png',
  'SYSTEXX-PURE-CHEVRON-054': '/catalogo/pure-chevron-054.png',
  'SYSTEXX-PURE-COBBLESTONE-063': '/catalogo/pure-cobblestone-063.png',
  'SYSTEXX-PURE-DIAGONAL-053': '/catalogo/pure-diagonal-053.png',
  'SYSTEXX-PURE-DIAMOND-051': '/catalogo/pure-diamond-051.png',
  'SYSTEXX-PURE-GRID-052': '/catalogo/pure-grid-052.png',
  'SYSTEXX-PURE-HERRINGBONE-034': '/catalogo/pure-herringbone-034.png',
  'SYSTEXX-PURE-HONEYCOMB-061': '/catalogo/pure-honeycomb-061.png',
  'SYSTEXX-PURE-JUTE-032': '/catalogo/pure-jute-032.png',
  'SYSTEXX-PURE-LINEN-004': '/catalogo/pure-linen-004.png',
  'SYSTEXX-PURE-MOSAIC-062': '/catalogo/pure-mosaic-062.png',
  'SYSTEXX-PURE-PEBBLE-064': '/catalogo/pure-pebble-064.png',
  'SYSTEXX-PURE-PINSTRIPE-033': '/catalogo/pure-pinstripe-033.png',
  'SYSTEXX-PURE-STONE-072': '/catalogo/pure-stone-072.png',
  'SYSTEXX-PURE-TWILL-042': '/catalogo/pure-twill-042.png',
  'SYSTEXX-PURE-WAFFLE-041': '/catalogo/pure-waffle-041.png',
  'SYSTEXX-PURE-WEAVE-044': '/catalogo/pure-weave-044.png',
  'SYS-PUR-J04': '/catalogo/pure-jute-032.png',
  'SYS-PUR-S532': '/catalogo/pure-pinstripe-033.png',
  'SYS-PUR-SKY88': '/catalogo/pure-canvas-043.png',
};

// Category slugs mapping
const CATEGORY_SLUGS: Record<string, string> = {
  'SYSTEXX Active': 'systexx-active',
  'SYSTEXX Phantasy': 'systexx-phantasy',
  'SYSTEXX Pure': 'systexx-pure',
};

// ─── FALLBACK: Generate products from local JSON ───
function getLocalCatalogProducts(categorySlug?: string | null): any[] {
  const products: any[] = [];
  let idCounter = 1;

  for (const section of catalogData) {
    const catSlug = CATEGORY_SLUGS[section.category] || section.category.toLowerCase().replace(/\s+/g, '-');

    if (categorySlug && catSlug !== categorySlug) continue;

    for (const prod of section.products) {
      const imageUrl = CATALOG_IMAGES[prod.sku] || '/images/placeholder.png';
      products.push({
        id: `local-${idCounter++}`,
        name: prod.name,
        nameEs: prod.nameEs,
        description: prod.description,
        descriptionEs: prod.descriptionEs,
        sku: prod.sku,
        slug: prod.nameEs.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        price: 45.0,
        salePrice: null,
        images: imageUrl ? [imageUrl] : [],
        imageUrl: imageUrl,
        colors: [],
        styles: [],
        dimensions: prod.dimensions,
        material: 'Glass Fiber',
        materialEs: 'Fibra de Vidrio con Tecnología Aqua',
        isCustomizable: false,
        isActive: true,
        isFeatured: false,
        stock: 999,
        cloudStoragePath: null,
        categoryId: catSlug,
        category: {
          id: catSlug,
          name: section.category,
          nameEs: section.category,
          slug: catSlug,
          isActive: true,
        },
      });
    }
  }

  return products;
}

// GET - List all active products (public endpoint)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get('category');
  const featured = searchParams.get('featured');

  // ─── STRATEGY 1: Try database first ───
  try {
    const where: any = { isActive: true };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    // If DB returned results, use them
    if (products.length > 0) {
      const productsWithUrls = products.map((product) => {
        // Parse images field
        let parsedImages = product.images;
        if (typeof product.images === 'string') {
          try {
            parsedImages = JSON.parse(product.images);
          } catch {
            parsedImages = (product.images as string).startsWith('/') ? [product.images] : [];
          }
        }

        const imagesArray = Array.isArray(parsedImages) ? parsedImages : [];
        let imageUrl = imagesArray[0] || null;

        // Use pre-computed local image mapping instead of S3
        if (!imageUrl || imageUrl === '/images/placeholder.png') {
          imageUrl = CATALOG_IMAGES[product.sku] || imageUrl;
        }

        return {
          ...product,
          imageUrl,
        };
      });

      return NextResponse.json({
        success: true,
        products: productsWithUrls,
        source: 'database',
      });
    }
  } catch (error: any) {
    console.warn('⚠️ Database query failed, falling back to local catalog:', error.message);
  }

  // ─── STRATEGY 2: Fallback to local JSON catalog ───
  try {
    const localProducts = getLocalCatalogProducts(categorySlug);

    return NextResponse.json({
      success: true,
      products: localProducts,
      source: 'local-catalog',
    });
  } catch (fallbackError: any) {
    console.error('❌ Both database and local catalog failed:', fallbackError);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: fallbackError.message },
      { status: 500 }
    );
  }
}
