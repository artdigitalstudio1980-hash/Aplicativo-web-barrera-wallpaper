
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// This endpoint allows admins to manually sync order status with Pictorem
// In production, you would call Pictorem's API to get the actual order status
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

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.pictoremOrderId) {
      return NextResponse.json(
        { error: 'Order has not been sent to Pictorem yet' },
        { status: 400 }
      );
    }

    // In production, you would call Pictorem's API here to get real status
    // For now, we'll just return the current status from our database
    // Pictorem API doesn't have a public endpoint to check order status,
    // but you can track orders through their web interface or contact their support

    const aiOrder = order.aiWallpaperOrders[0];

    return NextResponse.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        pictoremOrderId: order.pictoremOrderId,
        pictoremStatus: order.pictoremStatus,
        aiOrderStatus: aiOrder?.status,
        trackingNumber: order.trackingNumber,
        lastUpdated: order.updatedAt
      },
      message: 'Order status retrieved. To get real-time updates from Pictorem, please check their dashboard or contact support.'
    });

  } catch (error: any) {
    console.error('Sync order error:', error);
    return NextResponse.json(
      { error: 'Failed to sync order', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch all Pictorem orders
export async function GET(req: NextRequest) {
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

    const orders = await prisma.order.findMany({
      where: {
        pictoremOrderId: { not: null }
      },
      include: {
        aiWallpaperOrders: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      pictoremOrderId: order.pictoremOrderId,
      pictoremStatus: order.pictoremStatus,
      customerName: order.shippingName,
      customerEmail: order.shippingEmail,
      total: order.total,
      aiOrder: order.aiWallpaperOrders[0] ? {
        prompt: order.aiWallpaperOrders[0].prompt,
        material: order.aiWallpaperOrders[0].material,
        dimensions: `${order.aiWallpaperOrders[0].width}x${order.aiWallpaperOrders[0].height}`,
        status: order.aiWallpaperOrders[0].status
      } : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      total: formattedOrders.length
    });

  } catch (error: any) {
    console.error('Get Pictorem orders error:', error);
    return NextResponse.json(
      { error: 'Failed to get orders', details: error.message },
      { status: 500 }
    );
  }
}
