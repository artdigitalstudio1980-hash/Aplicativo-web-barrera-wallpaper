export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { getFileUrl } from '@/lib/s3';

// GET - List all products
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({
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

// POST - Create new product
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      nameEs,
      description,
      descriptionEs,
      slug,
      sku,
      price,
      salePrice,
      images,
      colors,
      styles,
      dimensions,
      material,
      materialEs,
      isCustomizable,
      isActive,
      isFeatured,
      stock,
      cloudStoragePath,
      categoryId
    } = body;

    // Validate required fields
    if (!name || !nameEs || !slug || !sku || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, nameEs, slug, sku, price, categoryId' },
        { status: 400 }
      );
    }

    // Check if slug or SKU already exists
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { sku }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Product with this slug or SKU already exists' },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        nameEs,
        description: description || null,
        descriptionEs: descriptionEs || null,
        slug,
        sku,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        images: images || [],
        colors: colors || [],
        styles: styles || [],
        dimensions: dimensions || null,
        material: material || null,
        materialEs: materialEs || null,
        isCustomizable: isCustomizable || false,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured || false,
        stock: stock || 0,
        cloudStoragePath: cloudStoragePath || null,
        categoryId
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({
      success: true,
      product
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}
