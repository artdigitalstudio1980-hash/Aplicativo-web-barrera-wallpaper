export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

interface CreateSessionRequest {
  orderId: string;
  successUrl: string;
  cancelUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateSessionRequest = await req.json();
    const { orderId, successUrl, cancelUrl } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        aiWallpaperOrders: true
      }
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

    // Create line items
    const lineItems = [];

    if (order.isAIGenerated && order.aiWallpaperOrders.length > 0) {
      const aiOrder = order.aiWallpaperOrders[0];
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Custom AI Wallpaper - ${aiOrder.material} ${aiOrder.type}`,
            description: `${aiOrder.width}" x ${aiOrder.height}" - ${aiOrder.prompt.substring(0, 100)}...`,
            images: aiOrder.generatedImageUrl ? [aiOrder.generatedImageUrl] : []
          },
          unit_amount: Math.round(order.total * 100) // Convert to cents
        },
        quantity: aiOrder.numCopies
      });
    } else {
      // Regular order items
      lineItems.push({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: {
            name: `Order ${order.orderNumber}`,
            description: 'Barrera Wallpaper Order'
          },
          unit_amount: Math.round(order.total * 100)
        },
        quantity: 1
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${cancelUrl}?order_id=${orderId}`,
      customer_email: order.shippingEmail,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA']
      },
      billing_address_collection: 'required'
    });

    // Update order with Stripe session info
    await prisma.order.update({
      where: { id: orderId },
      data: {
        stripeSessionId: session.id
      }
    });

    // Create payment transaction record
    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: 'STRIPE',
        sessionId: session.id,
        amount: order.total,
        currency: order.currency,
        status: 'PENDING'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });

  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment session', details: error.message },
      { status: 500 }
    );
  }
}
