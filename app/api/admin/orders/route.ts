
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { Order, AIWallpaperOrder, PaymentTransaction, OrderItem, Product } from '@prisma/client';

type OrderWithRelations = Order & {
  aiWallpaperOrders: AIWallpaperOrder[];
  paymentTransactions: PaymentTransaction[];
  orderItems: (OrderItem & { product: Product })[];
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    // Get all orders with related data
    const orders = await prisma.order.findMany({
      include: {
        aiWallpaperOrders: true,
        paymentTransactions: true,
        orderItems: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response data
    const formattedOrders = orders.map((order: OrderWithRelations) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      total: Number(order.total),
      currency: order.currency,
      customerName: order.shippingName,
      customerEmail: order.shippingEmail,
      isAIGenerated: order.isAIGenerated,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      
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
        customerPrice: order.aiWallpaperOrders[0].customerPrice ? Number(order.aiWallpaperOrders[0].customerPrice) : null,
        status: order.aiWallpaperOrders[0].status
      } : null,

      // Payment summary
      paymentStatus: order.paymentTransactions.length > 0 ? 
        order.paymentTransactions[order.paymentTransactions.length - 1].status : 'PENDING',
      paymentProvider: order.paymentTransactions.length > 0 ?
        order.paymentTransactions[order.paymentTransactions.length - 1].provider : null,

      // Regular order items count
      regularItemsCount: order.orderItems.length
    }));

    // Calculate summary statistics
    const totalOrders = orders.length;
    const aiOrders = orders.filter((order: OrderWithRelations) => order.isAIGenerated).length;
    const pendingOrders = orders.filter((order: OrderWithRelations) => order.status === 'PENDING').length;
    const completedOrders = orders.filter((order: OrderWithRelations) => ['DELIVERED', 'SHIPPED'].includes(order.status)).length;
    const totalRevenue = orders
      .filter((order: OrderWithRelations) => !['CANCELLED', 'REFUNDED'].includes(order.status))
      .reduce((sum: number, order: OrderWithRelations) => sum + Number(order.total), 0);

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      summary: {
        totalOrders,
        aiOrders,
        regularOrders: totalOrders - aiOrders,
        pendingOrders,
        completedOrders,
        totalRevenue: Number(totalRevenue.toFixed(2))
      }
    });

  } catch (error: any) {
    console.error('Get admin orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
