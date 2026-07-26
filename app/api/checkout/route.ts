export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { paypal } from '@/lib/paypal';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { logAudit } from '@/lib/audit';
import { checkoutSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const parsed = checkoutSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { items, shippingDetails, needsInstallation, installationAddress, locale } = parsed.data;

    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = process.env.NEXTAUTH_URL || `${protocol}://${host}`;

    const validatedItems = await Promise.all(items.map(async (item: any) => {
      if (item.wallpaperId === 'custom') {
        const price = parseFloat(item.price);
        if (isNaN(price) || price <= 0 || price > 10000) {
          throw new Error('Invalid price for custom item');
        }
        return { ...item, price, name: item.name || 'Custom Wallpaper' };
      }

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
        console.warn('DB lookup failed for product, using client price:', dbError);
      }

      throw new Error(`Product not found: ${item.wallpaperId}. Only verified products can be purchased.`);
    }));

    const orderTotal = validatedItems.reduce(
      (acc: number, item: any) => acc + (item.price * item.quantity), 0
    );

    const userId = session?.user?.id || null;
    const userEmail = session?.user?.email || shippingDetails.email;
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderNumber = `BW-${Date.now().toString().slice(-6)}-${rand}`;

    let order;
    try {
      order = await prisma.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          subtotal: orderTotal,
          tax: 0,
          shipping: 0,
          total: orderTotal,
          currency: 'USD',
          shippingName: shippingDetails.name,
          shippingEmail: shippingDetails.email,
          shippingPhone: shippingDetails.phone || null,
          shippingAddress1: shippingDetails.address1,
          shippingAddress2: shippingDetails.address2 || null,
          shippingCity: shippingDetails.city,
          shippingState: shippingDetails.state,
          shippingCountry: shippingDetails.country,
          shippingZip: shippingDetails.zip,
          notes: needsInstallation ? '[INSTALLATION REQUESTED] Professional installation quote required.' : null,
          orderItems: {
            create: validatedItems.map((item: any) => ({
              productId: item.wallpaperId === 'custom' ? undefined : item.wallpaperId,
              quantity: item.quantity,
              price: item.price,
              customization: item.measurements ? item.measurements : undefined,
            }))
          }
        }
      });
    } catch (dbError: any) {
      console.error('Failed to create order in DB:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Could not create order. Please try again.' },
        { status: 500 }
      );
    }

    if (needsInstallation && userId) {
      try {
        await prisma.installation.create({
          data: {
            userId,
            orderId: order.id,
            contactName: shippingDetails.name,
            contactEmail: shippingDetails.email,
            contactPhone: shippingDetails.phone || '',
            address1: installationAddress || shippingDetails.address1,
            address2: shippingDetails.address2 || null,
            city: shippingDetails.city,
            state: shippingDetails.state,
            country: shippingDetails.country,
            zip: shippingDetails.zip,
            type: 'RESIDENTIAL',
            status: 'REQUESTED',
          }
        });
      } catch (dbError: any) {
        console.warn('Failed to create installation record:', dbError.message);
      }
    }

    logAudit({
      action: 'ORDER_CREATED',
      entity: 'Order',
      entityId: order.id,
      userId: userId || undefined,
      email: userEmail || undefined,
      metadata: { orderNumber, total: orderTotal, paymentMethod: 'paypal', itemCount: validatedItems.length },
    });

    try {
      const paypalOrder = await paypal.createOrder(order);

      if (paypalOrder.error || paypalOrder.name === 'INVALID_REQUEST') {
        console.error('PayPal order creation failed:', JSON.stringify(paypalOrder));
        throw new Error(paypalOrder.message || 'PayPal rejected the request');
      }

      try {
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
      } catch (dbError) {
        console.warn('Failed to save PayPal transaction to DB. Proceeding anyway.');
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
        { success: false, error: 'Payment processing failed. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
