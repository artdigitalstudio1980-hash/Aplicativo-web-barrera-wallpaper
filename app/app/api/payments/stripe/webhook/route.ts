
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { pictoremClient } from '@/lib/pictorem';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  
  if (!orderId) {
    console.error('No order ID in session metadata');
    return;
  }

  try {
    // Update payment transaction
    await prisma.paymentTransaction.updateMany({
      where: {
        orderId,
        sessionId: session.id
      },
      data: {
        status: 'COMPLETED',
        transactionId: session.payment_intent as string
      }
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        stripePaymentId: session.payment_intent as string
      }
    });

    // Update AI wallpaper order status
    await prisma.aIWallpaperOrder.updateMany({
      where: { orderId },
      data: { status: 'PAID' }
    });

    // Send order to Pictorem
    await sendOrderToPictorem(orderId);

  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  // Additional payment success handling if needed
  console.log('Payment succeeded:', paymentIntent.id);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment transaction status
    await prisma.paymentTransaction.updateMany({
      where: { transactionId: paymentIntent.id },
      data: {
        status: 'FAILED',
        errorMessage: paymentIntent.last_payment_error?.message
      }
    });

    // Update AI wallpaper order status
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { transactionId: paymentIntent.id },
      include: { order: { include: { aiWallpaperOrders: true } } }
    });

    if (transaction?.order.aiWallpaperOrders.length) {
      await prisma.aIWallpaperOrder.updateMany({
        where: { orderId: transaction.orderId },
        data: {
          status: 'ERROR',
          errorMessage: paymentIntent.last_payment_error?.message
        }
      });
    }

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
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
