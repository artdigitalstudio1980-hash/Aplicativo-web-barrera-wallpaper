export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paypal } from '@/lib/paypal';
import { sendOrderConfirmationEmailV2, sendAdminNotificationEmail } from '@/lib/mailer';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  let paypalOrderId: string | undefined;

  try {
    const body = await req.json();
    const { paypalOrderId: paypalId, orderId, locale } = body;
    paypalOrderId = paypalId;

    if (!paypalOrderId || !orderId) {
      return NextResponse.json(
        { success: false, error: 'PayPal order ID and order ID are required' },
        { status: 400 }
      );
    }

    const captureData = await paypal.captureOrder(paypalOrderId);

    if (captureData.status === 'COMPLETED') {
      await prisma.paymentTransaction.updateMany({
        where: { orderId, paypalOrderId },
        data: { status: 'COMPLETED', transactionId: captureData.id }
      });

      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
        include: { orderItems: { include: { product: true } } }
      });

      await prisma.aIWallpaperOrder.updateMany({
        where: { orderId },
        data: { status: 'PAID' }
      });

      logAudit({
        action: 'PAYMENT_CAPTURED',
        entity: 'Order',
        entityId: order.id,
        metadata: { provider: 'PAYPAL', transactionId: captureData.id, paypalOrderId },
      });

      const emailItems = order.orderItems.map((item: any) => ({
        name: item.product?.name || 'Custom AI Wallpaper',
        price: item.price,
        quantity: item.quantity,
        measurements: item.customization,
      }));

      const isGuest = !order.userId;
      const lang = locale || 'en';

      await sendOrderConfirmationEmailV2(
        order.orderNumber,
        order.shippingEmail,
        order.shippingName || 'Customer',
        lang,
        {
          total: order.total,
          currency: order.currency,
          items: emailItems,
          shippingName: order.shippingName,
          shippingAddress: order.shippingAddress1,
          shippingCity: order.shippingCity,
          shippingState: order.shippingState,
          shippingZip: order.shippingZip,
          shippingCountry: order.shippingCountry,
          needsInstallation: !!order.notes?.includes('INSTALLATION REQUESTED'),
        }
      ).catch((err: any) => console.error('Email send error (non-blocking):', err));

      const shipAddr = `${order.shippingAddress1}, ${order.shippingCity}, ${order.shippingState} ${order.shippingZip}, ${order.shippingCountry}`;

      await sendAdminNotificationEmail({
        orderNumber: order.orderNumber,
        customerName: order.shippingName,
        customerEmail: order.shippingEmail,
        total: order.total,
        currency: order.currency,
        items: emailItems,
        shippingAddress: shipAddr,
        needsInstallation: !!order.notes?.includes('INSTALLATION REQUESTED'),
        isGuest,
        createdAt: new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }),
      }).catch((err: any) => console.error('Admin notification error (non-blocking):', err));

      return NextResponse.json({
        success: true,
        data: {
          transactionId: captureData.id,
          status: 'COMPLETED',
          orderNumber: order.orderNumber,
        }
      });
    } else {
      throw new Error(`PayPal capture failed: ${captureData.status}`);
    }

  } catch (error: any) {
    console.error('PayPal capture error:', error);

    if (paypalOrderId) {
      try {
        await prisma.paymentTransaction.updateMany({
          where: { paypalOrderId },
          data: { status: 'FAILED', errorMessage: error.message }
        });
      } catch (dbError) {
        console.error('Database error while updating failed payment:', dbError);
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to capture PayPal payment' },
      { status: 500 }
    );
  }
}
