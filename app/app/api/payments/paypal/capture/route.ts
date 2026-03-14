
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pictoremClient } from '@/lib/pictorem';

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
        { error: 'PayPal order ID and order ID are required' },
        { status: 400 }
      );
    }

    // Capture PayPal payment
    const captureData = await capturePayPalOrder(paypalOrderId);

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
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' }
      });

      // Update AI wallpaper order status
      await prisma.aIWallpaperOrder.updateMany({
        where: { orderId },
        data: { status: 'PAID' }
      });

      // Send order to Pictorem
      await sendOrderToPictorem(orderId);

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
      { error: 'Failed to capture PayPal payment', details: error.message },
      { status: 500 }
    );
  }
}

async function capturePayPalOrder(paypalOrderId: string) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';
  
  const base = environment === 'sandbox' 
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

  // Get access token
  const authResponse = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  const authData = await authResponse.json();
  const accessToken = authData.access_token;

  // Capture the order
  const captureResponse = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'PayPal-Request-Id': `capture-${paypalOrderId}-${Date.now()}`
    }
  });

  return await captureResponse.json();
}

async function sendOrderToPictorem(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { aiWallpaperOrders: true }
    });

    if (!order || !order.aiWallpaperOrders.length) {
      console.error('Order or AI wallpaper order not found');
      return;
    }

    const aiOrder = order.aiWallpaperOrders[0];

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
      thanknotemsg: `Custom wallpaper design created with Barrera Wallpaper AI`
    }];

    // Send order to Pictorem
    const pictoremResponse = await pictoremClient.sendOrder(
      deliveryInfo,
      orderItems,
      `Barrera Wallpaper Order ${order.orderNumber}`
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
          pictoremOrderId: pictoremResponse.orderid
        }
      });

      console.log(`Order ${order.orderNumber} sent to Pictorem: ${pictoremResponse.orderid}`);
    } else {
      throw new Error(`Pictorem order failed: ${JSON.stringify(pictoremResponse.msg)}`);
    }

  } catch (error) {
    console.error('Error sending order to Pictorem:', error);
    
    // Update order with error
    await prisma.aIWallpaperOrder.updateMany({
      where: { orderId },
      data: {
        status: 'ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}
