
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CreatePayPalOrderRequest {
  orderId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreatePayPalOrderRequest = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order details
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

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Order is not pending payment' },
        { status: 400 }
      );
    }

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(order);

    if (paypalOrder.id) {
      // Update order with PayPal order ID
      await prisma.order.update({
        where: { id: orderId },
        data: { paypalOrderId: paypalOrder.id }
      });

      // Create payment transaction record
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
    console.error('PayPal order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order', details: error.message },
      { status: 500 }
    );
  }
}

async function createPayPalOrder(order: any) {
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

  // Prepare order items
  const items = [];
  let description = `Barrera Wallpaper Order ${order.orderNumber}`;

  if (order.isAIGenerated && order.aiWallpaperOrders.length > 0) {
    const aiOrder = order.aiWallpaperOrders[0];
    items.push({
      name: `Custom AI Wallpaper - ${aiOrder.material} ${aiOrder.type}`,
      description: `${aiOrder.width}" x ${aiOrder.height}" - ${aiOrder.prompt.substring(0, 100)}...`,
      unit_amount: {
        currency_code: order.currency,
        value: (order.total / aiOrder.numCopies).toFixed(2)
      },
      quantity: aiOrder.numCopies.toString()
    });
    description = `Custom AI Wallpaper - ${aiOrder.material}`;
  } else {
    items.push({
      name: description,
      description: 'Premium wallpaper order',
      unit_amount: {
        currency_code: order.currency,
        value: order.total.toFixed(2)
      },
      quantity: '1'
    });
  }

  // Create PayPal order
  const orderResponse = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'PayPal-Request-Id': `${order.id}-${Date.now()}`
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: order.orderNumber,
        description,
        amount: {
          currency_code: order.currency,
          value: order.total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: order.currency,
              value: order.total.toFixed(2)
            }
          }
        },
        items,
        shipping: {
          name: {
            full_name: order.shippingName
          },
          address: {
            address_line_1: order.shippingAddress1,
            address_line_2: order.shippingAddress2 || undefined,
            admin_area_2: order.shippingCity,
            admin_area_1: order.shippingState,
            postal_code: order.shippingZip,
            country_code: order.shippingCountry
          }
        }
      }],
      application_context: {
        brand_name: 'Barrera Wallpaper',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW'
      }
    })
  });

  return await orderResponse.json();
}
