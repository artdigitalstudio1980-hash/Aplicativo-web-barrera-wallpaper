// placeholder
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/mailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.warn('Webhook warning: Missing signature or secret. Bypassing specific validations for local demo.');
    }

    let event: Stripe.Event;

    // Verify webhook signature if secret exists
    if (signature && webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
    } else {
      // For local testing without valid signature
      event = JSON.parse(body);
    }

    // Handle checkout session completion
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      
      // Marcar como recuperado si existía en nuestro sistema de abandono
      // (requeriría buscar por email o ID en nuestra tabla de CartAbandonment)
      
      if (orderId) {
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { orderItems: { include: { product: true } } }
        });

        if (order && order.status === 'PENDING') {
          await prisma.order.update({
            where: { id: orderId },
            data: { status: 'CONFIRMED', stripePaymentId: session.payment_intent as string }
          });

          const customerEmail = session.customer_details?.email || order.shippingEmail;
          await sendOrderConfirmationEmail(order.orderNumber, customerEmail as string, session.customer_details?.name || order.shippingName || '', session.amount_total! / 100, order.orderItems.map(item => ({ name: item.product?.name || 'Custom AI Wallpaper', price: item.price })));
          console.log(`Order ${order.orderNumber} confirmed.`);
        }
      }
    }

    // Handle checkout session expired or payment failed (Cart Abandonment)
    if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerEmail = session.customer_details?.email;
      
      if (customerEmail) {
        console.log(`Cart abandoned by: ${customerEmail}. Registering in system.`);
        await SalesService.registerCartAbandonment(customerEmail, [{ cartTotal: session.amount_total }]);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}
