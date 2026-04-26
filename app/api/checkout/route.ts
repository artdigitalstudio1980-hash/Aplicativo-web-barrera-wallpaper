export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { stripe, isStripeConfigured } from '@/lib/stripe';
import { paypal } from '@/lib/paypal';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { items, paymentMethod = 'stripe', shippingDetails, needsInstallation } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items to checkout' },
        { status: 400 }
      );
    }

    // ─── VALIDATE ITEMS & FETCH REAL PRICES FROM DB ───
    const validatedItems = await Promise.all(items.map(async (item: any) => {
      if (item.wallpaperId === 'custom') {
        const price = parseFloat(item.price);
        if (isNaN(price) || price <= 0 || price > 10000) {
          throw new Error('Invalid price for custom item');
        }
        return { ...item, price };
      }
      
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { id: item.wallpaperId },
            { sku: item.wallpaperId }
          ]
        }
      });
      
      if (!product) {
        throw new Error(`Product not found: ${item.wallpaperId}`);
      }
      
      return {
        ...item,
        wallpaperId: product.id,
        price: product.salePrice || product.price,
        name: product.name,
        imageUrl: Array.isArray(product.images) ? (product.images[0] as string) : undefined
      };
    }));

    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;

    const orderTotal = validatedItems.reduce(
      (acc: number, item: any) => acc + (item.price * item.quantity), 0
    );
    const orderNumber = `BW-${Date.now().toString().slice(-6)}`;

    // ─── CREATE ORDER IN DATABASE ───
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
        notes: needsInstallation ? '[INSTALLATION REQUESTED - MIAMI] Professional installation quote required.' : null,
        shippingName: shippingDetails?.name || session?.user?.name || 'Guest',
        shippingEmail: shippingDetails?.email || session?.user?.email || 'guest@example.com',
        shippingAddress1: shippingDetails?.address1 || 'Pending',
        shippingCity: shippingDetails?.city || 'Pending',
        shippingState: shippingDetails?.state || 'FL',
        shippingCountry: shippingDetails?.country || 'US',
        shippingZip: shippingDetails?.zip || '00000',
        orderItems: {
          create: validatedItems.map((item: any) => ({
            productId: item.wallpaperId === 'custom' ? null : item.wallpaperId,
            quantity: item.quantity,
            price: item.price,
            customization: item.measurements,
          }))
        }
      }
    });

    // ─── PAYPAL FLOW ───
    if (paymentMethod === 'paypal') {
      const paypalOrder = await paypal.createOrder(order);
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
      const approveLink = paypalOrder.links?.find((l: any) => l.rel === 'approve');
      return NextResponse.json({
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          paypalOrderId: paypalOrder.id,
          approvalUrl: approveLink?.href,
          total: orderTotal
        }
      });
    }

    // ─── STRIPE FLOW ───
    if (!isStripeConfigured()) {
      return NextResponse.json({
        success: true,
        data: { url: `${baseUrl}/checkout/success?session_id=demo_${order.id}` }
      });
    }

    const lineItems = validatedItems.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name || `Order ${orderNumber}`,
          images: item.imageUrl ? [item.imageUrl] : [],
          description: item.measurements 
            ? `Size: ${item.measurements.width}x${item.measurements.height}m` 
            : 'Premium Wallpaper',
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart?canceled=true`,
      client_reference_id: order.id,
      customer_email: session?.user?.email || shippingDetails?.email || undefined,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        needsInstallation: needsInstallation ? 'YES' : 'NO'
      },
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'MX']
      },
      billing_address_collection: 'required'
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id }
    });

    await prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        provider: 'STRIPE',
        sessionId: stripeSession.id,
        amount: order.total,
        currency: order.currency,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, data: { url: stripeSession.url } });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
