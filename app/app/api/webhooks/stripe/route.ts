// placeholder
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/mailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil' as any,
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
      
      if (orderId) {
        // Find the pending order
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { orderItems: { include: { product: true } } }
        });

        if (order) {
          // Verify it hasn't been confirmed yet
          if (order.status === 'PENDING') {
            // Update the order status to Paid/Confirmed
            await prisma.order.update({
              where: { id: orderId },
              data: {
                status: 'CONFIRMED',
                stripePaymentId: session.payment_intent as string,
              }
            });

            // Parse order items for the email
            const itemsList = order.orderItems.map(item => ({
              name: item.product?.name || 'Custom AI Wallpaper',
              measurements: item.customization,
              price: item.price
            }));

            // Dispatch Confirmation Email using the free Nodemailer Setup
            const customerEmail = session.customer_details?.email || order.shippingEmail;
            const customerName = session.customer_details?.name || order.shippingName;
            
            await sendOrderConfirmationEmail(
              order.orderNumber,
              customerEmail as string,
              customerName as string,
              session.amount_total! / 100, // Converts from cents
              itemsList
            );
            
            console.log(`Order ${order.orderNumber} confirmed and email sent.`);
          }
        }
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}
