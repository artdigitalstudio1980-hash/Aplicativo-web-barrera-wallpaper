import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-08-27.basil',
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'No items to checkout' }, { status: 400 });
    }

    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Create Order in Database (PENDING)
    const orderTotal = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    const orderNumber = `BW-${Date.now().toString().slice(-6)}`;

    // Fallback order saving
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id || null,
        status: 'PENDING',
        subtotal: orderTotal,
        tax: 0,
        shipping: 0,
        total: orderTotal,
        currency: 'USD',
        shippingName: session?.user?.name || 'Invitado',
        shippingEmail: session?.user?.email || 'guest@example.com',
        shippingAddress1: 'Pendiente',
        shippingCity: 'Pendiente',
        shippingState: 'PA',
        shippingCountry: 'US',
        shippingZip: '00000',
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.wallpaperId === 'custom' ? null : item.wallpaperId,
            quantity: item.quantity,
            price: item.price,
            customization: item.measurements,
          }))
        }
      }
    });

    // If Stripe isn't configured, return a mock success URL (Demo Mode)
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock' || process.env.STRIPE_SECRET_KEY === 'sk_test_example') {
      console.log('Stripe not configured. Redirecting to mock success.');
      return NextResponse.json({ 
        url: `${baseUrl}/checkout/success?session_id=mock_session_${order.id}` 
      });
    }

    // Prepare Stripe Line Items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.imageUrl ? [item.imageUrl] : [],
          description: item.measurements 
            ? `Medidas: ${item.measurements.width}x${item.measurements.height}m` 
            : 'Premium Wallpaper',
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/calculator?canceled=true`,
      client_reference_id: order.id,
      customer_email: session?.user?.email || undefined,
      metadata: {
        orderId: order.id
      }
    });

    // Update Order with Stripe Session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id }
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ message: error.message || 'Error creating checkout session' }, { status: 500 });
  }
}
