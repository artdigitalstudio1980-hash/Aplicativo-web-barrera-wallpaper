
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get all available Pictorem products with configuration
export async function GET(req: NextRequest) {
  try {
    const products = await prisma.pictoremProduct.findMany({
      where: { isActive: true },
      orderBy: {
        material: 'asc'
      }
    });

    // Group products by material
    const groupedProducts = products.reduce((acc: any, product) => {
      if (!acc[product.material]) {
        acc[product.material] = [];
      }
      acc[product.material].push({
        id: product.id,
        type: product.type,
        name: product.name,
        nameEs: product.nameEs,
        description: product.description,
        descriptionEs: product.descriptionEs,
        pricing: {
          baseMarkup: product.baseMarkup,
          minPrice: product.minPrice,
          maxPrice: product.maxPrice
        },
        sizeConstraints: {
          minWidth: product.minWidth,
          maxWidth: product.maxWidth,
          minHeight: product.minHeight,
          maxHeight: product.maxHeight
        }
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        products: groupedProducts,
        materials: Object.keys(groupedProducts),
        totalProducts: products.length
      }
    });

  } catch (error: any) {
    console.error('Get Pictorem products error:', error);
    return NextResponse.json(
      { error: 'Failed to get products', details: error.message },
      { status: 500 }
    );
  }
}

// Get specific material types
export async function POST(req: NextRequest) {
  try {
    const { material } = await req.json();

    if (!material) {
      return NextResponse.json(
        { error: 'Material is required' },
        { status: 400 }
      );
    }

    const products = await prisma.pictoremProduct.findMany({
      where: {
        material,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: products.map(product => ({
        id: product.id,
        type: product.type,
        name: product.name,
        nameEs: product.nameEs,
        description: product.description,
        descriptionEs: product.descriptionEs,
        pricing: {
          baseMarkup: product.baseMarkup,
          minPrice: product.minPrice,
          maxPrice: product.maxPrice
        },
        sizeConstraints: {
          minWidth: product.minWidth,
          maxWidth: product.maxWidth,
          minHeight: product.minHeight,
          maxHeight: product.maxHeight
        }
      }))
    });

  } catch (error: any) {
    console.error('Get material types error:', error);
    return NextResponse.json(
      { error: 'Failed to get material types', details: error.message },
      { status: 500 }
    );
  }
}
