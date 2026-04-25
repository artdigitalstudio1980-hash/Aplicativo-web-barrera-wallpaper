export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

// GET - List all active products (public endpoint)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: any = {
      isActive: true
    };

    if (categorySlug) {
      where.category = {
        slug: categorySlug
      };
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Generate URLs for cloudStoragePath if exists
    const productsWithUrls = await Promise.all(
      products.map(async (product) => {
        // Handle Json type safely - images can be null or array
        const imagesArray = Array.isArray(product.images) ? product.images : [];
        let imageUrl = imagesArray[0] || null;
        
        // If cloudStoragePath exists, generate URL
        if (product.cloudStoragePath) {
          try {
            imageUrl = await getFileUrl(product.cloudStoragePath, true);
          } catch (error) {
            console.error('Error generating URL for product:', product.id, error);
          }
        }

        return {
          ...product,
          imageUrl
        };
      })
    );

    return NextResponse.json({
      success: true,
      products: productsWithUrls
    });
  } catch (error: any) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}
