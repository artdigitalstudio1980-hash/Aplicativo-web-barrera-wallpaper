
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Context {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order details with related data
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        aiWallpaperOrders: true,
        paymentTransactions: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Format response data
    const responseData = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      currency: order.currency,
      shippingEmail: order.shippingEmail,
      shippingName: order.shippingName,
      shippingAddress1: order.shippingAddress1,
      shippingAddress2: order.shippingAddress2,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingCountry: order.shippingCountry,
      shippingZip: order.shippingZip,
      isAIGenerated: order.isAIGenerated,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      
      // AI wallpaper order details
      aiWallpaperOrder: order.aiWallpaperOrders.length > 0 ? {
        id: order.aiWallpaperOrders[0].id,
        prompt: order.aiWallpaperOrders[0].prompt,
        generatedImageUrl: order.aiWallpaperOrders[0].generatedImageUrl,
        material: order.aiWallpaperOrders[0].material,
        type: order.aiWallpaperOrders[0].type,
        orientation: order.aiWallpaperOrders[0].orientation,
        width: order.aiWallpaperOrders[0].width,
        height: order.aiWallpaperOrders[0].height,
        numCopies: order.aiWallpaperOrders[0].numCopies,
        borderColor: order.aiWallpaperOrders[0].borderColor,
        customerPrice: order.aiWallpaperOrders[0].customerPrice,
        status: order.aiWallpaperOrders[0].status,
      } : null,

      // Payment transactions
      paymentTransactions: order.paymentTransactions.map(transaction => ({
        id: transaction.id,
        provider: transaction.provider,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        createdAt: transaction.createdAt
      })),

      // Regular order items (if any)
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: {
          name: item.product.name,
          nameEs: item.product.nameEs,
          images: item.product.images
        }
      }))
    };

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order', details: error.message },
      { status: 500 }
    );
  }
}
