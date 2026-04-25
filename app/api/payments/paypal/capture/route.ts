
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


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
