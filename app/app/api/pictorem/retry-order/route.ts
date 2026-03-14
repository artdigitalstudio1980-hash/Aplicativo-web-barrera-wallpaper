
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pictoremClient } from '@/lib/pictorem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// Retry sending a failed order to Pictorem
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { aiWallpaperOrders: true }
    });

    if (!order || !order.aiWallpaperOrders.length) {
      return NextResponse.json(
        { error: 'Order or AI wallpaper order not found' },
        { status: 404 }
      );
    }

    // Check if order is in a retryable state
    if (order.status !== 'CONFIRMED' && order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Order is not in a retryable state' },
        { status: 400 }
      );
    }

    const aiOrder = order.aiWallpaperOrders[0];

    // Check if AI order has an error or is in PAID status
    if (aiOrder.status !== 'ERROR' && aiOrder.status !== 'PAID') {
      return NextResponse.json(
        { error: 'AI order is not in a retryable state' },
        { status: 400 }
      );
    }

    // Prepare delivery info for Pictorem
    const deliveryInfo = {
      firstname: order.shippingName.split(' ')[0] || order.shippingName,
      lastname: order.shippingName.split(' ').slice(1).join(' ') || '',
      address1: order.shippingAddress1,
      address2: order.shippingAddress2 || '',
      city: order.shippingCity,
      province: order.shippingState,
      country: order.shippingCountry,
      cp: order.shippingZip,
      phone: order.shippingPhone || ''
    };

    // Prepare order items for Pictorem
    const orderItems = [{
      code: aiOrder.pictoremPreorderCode || '',
      fileurl: aiOrder.generatedImageUrl || '',
      filetype: 'jpg',
      bordercolorhex: aiOrder.borderColor,
      thanknotemsg: `Custom wallpaper design created with Barrera Wallpaper AI - Retry`
    }];

    // Send order to Pictorem
    const pictoremResponse = await pictoremClient.sendOrder(
      deliveryInfo,
      orderItems,
      `Barrera Wallpaper Order ${order.orderNumber} - RETRY`
    );

    if (pictoremResponse.status && pictoremResponse.orderid) {
      // Update order with Pictorem order ID
      await prisma.order.update({
        where: { id: orderId },
        data: {
          pictoremOrderId: pictoremResponse.orderid,
          pictoremStatus: 'confirmed',
          status: 'PROCESSING'
        }
      });

      await prisma.aIWallpaperOrder.updateMany({
        where: { orderId },
        data: {
          status: 'SENT_TO_PICTOREM',
          pictoremOrderId: pictoremResponse.orderid,
          errorMessage: null
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          orderNumber: order.orderNumber,
          pictoremOrderId: pictoremResponse.orderid,
          status: 'SENT_TO_PICTOREM'
        },
        message: `Order ${order.orderNumber} successfully sent to Pictorem`
      });
    } else {
      // Log the error but don't throw
      const errorMsg = pictoremResponse.msg?.error?.join(', ') || 'Unknown error';
      
      await prisma.aIWallpaperOrder.updateMany({
        where: { orderId },
        data: {
          status: 'ERROR',
          errorMessage: errorMsg
        }
      });

      return NextResponse.json(
        { 
          error: 'Failed to send order to Pictorem', 
          details: errorMsg,
          pictoremResponse 
        },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Retry order error:', error);
    return NextResponse.json(
      { error: 'Failed to retry order', details: error.message },
      { status: 500 }
    );
  }
}
