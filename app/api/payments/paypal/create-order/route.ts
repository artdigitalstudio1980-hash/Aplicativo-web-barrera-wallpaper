
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paypal } from '@/lib/paypal';

interface CreatePayPalOrderRequest {
  orderId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreatePayPalOrderRequest = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { aiWallpaperOrders: true }
    });

    if (!order || order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Order not found or not pending' }, { status: 404 });
    }

    const paypalOrder = await paypal.createOrder(order);

    if (paypalOrder.id) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paypalOrderId: paypalOrder.id }
      });

      await prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          provider: 'PAYPAL',
          paypalOrderId: paypalOrder.id,
          amount: order.total,
          currency: order.currency,
          status: 'PENDING'
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          paypalOrderId: paypalOrder.id,
          approvalUrl: paypalOrder.links?.find((link: any) => link.rel === 'approve')?.href
        }
      });
    } else {
      throw new Error('Failed to create PayPal order');
    }
  } catch (error: any) {
    console.error('PayPal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
