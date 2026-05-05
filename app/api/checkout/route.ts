export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { isStripeConfigured } from '@/lib/stripe';
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

    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;

    // ─── VALIDATE ITEMS & RESOLVE PRICES ───
    const validatedItems = await Promise.all(items.map(async (item: any) => {
      // Custom items (e.g., AI wallpaper) — validate price bounds
      if (item.wallpaperId === 'custom') {
        const price = parseFloat(item.price);
        if (isNaN(price) || price <= 0 || price > 10000) {
          throw new Error('Invalid price for custom item');
        }
        return { ...item, price, name: item.name || 'Custom Wallpaper' };
      }

      // Try to fetch real price from DB
      try {
        const product = await prisma.product.findFirst({
          where: {
            OR: [
              { id: item.wallpaperId },
              { sku: item.wallpaperId }
            ]
          }
        });

        if (product) {
          return {
            ...item,
            wallpaperId: product.id,
            price: product.salePrice || product.price,
            name: product.name,
            imageUrl: Array.isArray(product.images) ? (product.images[0] as string) : undefined
          };
        }
      } catch (dbError) {
        console.warn('⚠️ DB lookup failed for product, using client price:', dbError);
      }

      // Fallback: use the price sent from the client (for local-catalog products)
      const clientPrice = parseFloat(item.price);
      if (isNaN(clientPrice) || clientPrice <= 0 || clientPrice > 10000) {
        throw new Error(`Invalid price for item: ${item.wallpaperId}`);
      }
      return {
        ...item,
        price: clientPrice,
        name: item.name || `Wallpaper Product`,
      };
    }));

    const orderTotal = validatedItems.reduce(
      (acc: number, item: any) => acc + (item.price * item.quantity), 0
    );
    const orderNumber = `BW-${Date.now().toString().slice(-6)}`;

    // ─── CREATE ORDER IN DATABASE ───
    let order: any;
    try {
      order = await prisma.order.create({
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
              productId: (item.wallpaperId === 'custom' || item.wallpaperId?.startsWith('local-')) ? undefined : item.wallpaperId,
              quantity: item.quantity,
              price: item.price,
              customization: item.measurements ? item.measurements : undefined,
            }))
          }
        }
      });
    } catch (dbError: any) {
      console.error('❌ Failed to create order in DB:', dbError.message);
      // Fallback: Create a mock order to allow checkout to proceed
      order = {
        id: `mock_${Date.now()}`,
        orderNumber,
        currency: 'USD',
        total: orderTotal,
      };
      console.warn('⚠️ Proceeding with fallback mock order:', order);
    }

    // ─── PAYPAL FLOW ───
    if (paymentMethod === 'paypal') {
      try {
        const paypalOrder = await paypal.createOrder(order);

        if (paypalOrder.error || paypalOrder.name === 'INVALID_REQUEST') {
          console.error('PayPal order creation failed:', JSON.stringify(paypalOrder));
          throw new Error(paypalOrder.message || 'PayPal rejected the request');
        }

        try {
          await prisma.paymentTransaction.create({
            data: {
              orderId: order.id.startsWith('mock_') ? undefined : order.id,
              provider: 'PAYPAL',
              paypalOrderId: paypalOrder.id,
              amount: order.total,
              currency: order.currency,
              status: 'PENDING'
            }
          });
        } catch (dbError) {
          console.warn('⚠️ Failed to save PayPal transaction to DB. Proceeding anyway.');
        }

        const approveLink = paypalOrder.links?.find((l: any) => l.rel === 'approve');
        if (!approveLink?.href) {
          throw new Error('PayPal did not return an approval URL');
        }

        return NextResponse.json({
          success: true,
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            paypalOrderId: paypalOrder.id,
            approvalUrl: approveLink.href,
            total: orderTotal
          }
        });
      } catch (paypalError: any) {
        console.error('PayPal error:', paypalError);
        return NextResponse.json(
          { success: false, error: `PayPal payment failed: ${paypalError.message}` },
          { status: 500 }
        );
      }
    }

    // ─── STRIPE FLOW ───
    if (!isStripeConfigured()) {
      console.warn('⚠️ Stripe is not configured. Redirecting to demo success.');
      return NextResponse.json({
        success: true,
        data: { url: `${baseUrl}/checkout/success?session_id=demo_${order.id}&order=${order.orderNumber}` }
      });
    }

    try {
      // Dynamic import to avoid crashes if Stripe SDK has issues
      const { stripe } = await import('@/lib/stripe');
      
      const lineItems = validatedItems.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name || `Order ${orderNumber}`,
            images: item.imageUrl && item.imageUrl.startsWith('http') ? [item.imageUrl] : [],
            description: item.measurements 
              ? `Size: ${item.measurements.width}x${item.measurements.height}m` 
              : 'Premium SYSTEXX Glass Textile Wallpaper',
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

      try {
        if (!order.id.startsWith('mock_')) {
          await prisma.order.update({
            where: { id: order.id },
            data: { stripeSessionId: stripeSession.id }
          });
        }

        await prisma.paymentTransaction.create({
          data: {
            orderId: order.id.startsWith('mock_') ? undefined : order.id,
            provider: 'STRIPE',
            sessionId: stripeSession.id,
            amount: order.total,
            currency: order.currency,
            status: 'PENDING'
          }
        });
      } catch (dbError) {
        console.warn('⚠️ Failed to save Stripe transaction to DB. Proceeding anyway.');
      }

      return NextResponse.json({ success: true, data: { url: stripeSession.url } });
    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError);
      return NextResponse.json(
        { success: false, error: `Stripe payment failed: ${stripeError.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
