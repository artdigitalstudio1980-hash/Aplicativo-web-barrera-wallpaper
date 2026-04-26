
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paypal } from '@/lib/paypal';
import { sendOrderConfirmationEmail } from '@/lib/mailer';

interface CapturePayPalOrderRequest {
  paypalOrderId: string;
  orderId: string;
}

export async function POST(req: NextRequest) {
  let paypalOrderId: string | undefined;
  
  try {
    const body: CapturePayPalOrderRequest = await req.json();
    const { paypalOrderId: paypalId, orderId } = body;
    paypalOrderId = paypalId;

    if (!paypalOrderId || !orderId) {
      return NextResponse.json(
        { success: false, error: 'PayPal order ID and order ID are required' },
        { status: 400 }
      );
    }

    // Use the centralized PayPal service instead of duplicated logic
    const captureData = await paypal.captureOrder(paypalOrderId);

    if (captureData.status === 'COMPLETED') {
      // Update payment transaction
      await prisma.paymentTransaction.updateMany({
        where: {
          orderId,
          paypalOrderId
        },
        data: {
          status: 'COMPLETED',
          transactionId: captureData.id
        }
      });

      // Update order status
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
        include: { orderItems: { include: { product: true } } }
      });

      // Update AI wallpaper order status if applicable
      await prisma.aIWallpaperOrder.updateMany({
        where: { orderId },
        data: { status: 'PAID' }
      });

      // Send confirmation email (consistent with Stripe flow)
      if (order.shippingEmail) {
        const emailItems = order.orderItems.map((item: any) => ({
          name: item.product?.name || 'Custom AI Wallpaper',
          price: item.price,
          measurements: item.customization,
        }));

        await sendOrderConfirmationEmail(
          order.orderNumber,
          order.shippingEmail,
          order.shippingName || 'Customer',
          order.total,
          emailItems
        ).catch((err: any) => console.error('Email send error (non-blocking):', err));
      }

      return NextResponse.json({
        success: true,
        data: {
          transactionId: captureData.id,
          status: 'COMPLETED'
        }
      });
    } else {
      throw new Error(`PayPal capture failed: ${captureData.status}`);
    }

  } catch (error: any) {
    console.error('PayPal capture error:', error);
    
    // Update transaction with error if we have the paypalOrderId
    if (paypalOrderId) {
      try {
        await prisma.paymentTransaction.updateMany({
          where: { paypalOrderId },
          data: {
            status: 'FAILED',
            errorMessage: error.message
          }
        });
      } catch (dbError) {
        console.error('Database error while updating failed payment:', dbError);
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to capture PayPal payment', details: error.message },
      { status: 500 }
    );
  }
}
