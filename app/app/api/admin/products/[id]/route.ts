export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { deleteFile } from '@/lib/s3';

// GET - Get single product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });
  } catch (error: any) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if slug or SKU is taken by another product
    if (slug && slug !== existingProduct.slug) {
      const slugTaken = await prisma.product.findFirst({
        where: {
          slug,
          id: { not: params.id }
        }
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: 'Slug already taken by another product' },
          { status: 400 }
        );
      }
    }

    if (sku && sku !== existingProduct.sku) {
      const skuTaken = await prisma.product.findFirst({
        where: {
          sku,
          id: { not: params.id }
        }
      });

      if (skuTaken) {
        return NextResponse.json(
          { error: 'SKU already taken by another product' },
          { status: 400 }
        );
      }
    }

    // If cloudStoragePath changed, delete old file
    if (cloudStoragePath && existingProduct.cloudStoragePath && cloudStoragePath !== existingProduct.cloudStoragePath) {
      try {
        await deleteFile(existingProduct.cloudStoragePath);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(nameEs && { nameEs }),
        ...(description !== undefined && { description }),
        ...(descriptionEs !== undefined && { descriptionEs }),
        ...(slug && { slug }),
        ...(sku && { sku }),
        ...(price && { price: parseFloat(price) }),
        ...(salePrice !== undefined && { salePrice: salePrice ? parseFloat(salePrice) : null }),
        ...(images && { images }),
        ...(colors && { colors }),
        ...(styles && { styles }),
        ...(dimensions !== undefined && { dimensions }),
        ...(material !== undefined && { material }),
        ...(materialEs !== undefined && { materialEs }),
        ...(isCustomizable !== undefined && { isCustomizable }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(stock !== undefined && { stock }),
        ...(cloudStoragePath !== undefined && { cloudStoragePath }),
        ...(categoryId && { categoryId })
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
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Delete image from S3 if exists
    if (product.cloudStoragePath) {
      try {
        await deleteFile(product.cloudStoragePath);
      } catch (error) {
        console.error('Error deleting image from S3:', error);
      }
    }

    // Delete product
    await prisma.product.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error.message },
      { status: 500 }
    );
  }
}
