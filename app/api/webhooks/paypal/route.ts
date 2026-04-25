import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function verifyPayPalWebhookEvent(req: Request, webhookEvent: unknown): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const base = process.env.PAYPAL_API_BASE || 'https://api-m.paypal.com';

  if (!webhookId || !clientId || !clientSecret) {
    return false;
  }

  const transmissionId = req.headers.get('paypal-transmission-id');
  const transmissionTime = req.headers.get('paypal-transmission-time');
  const certUrl = req.headers.get('paypal-cert-url');
  const authAlgo = req.headers.get('paypal-auth-algo');
  const transmissionSig = req.headers.get('paypal-transmission-sig');

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false;
  }

  const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!tokenRes.ok) return false;
  const tokenJson = (await tokenRes.json()) as { access_token?: string };
  if (!tokenJson.access_token) return false;

  const verifyRes = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokenJson.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    }),
  });
  if (!verifyRes.ok) return false;
  const result = (await verifyRes.json()) as { verification_status?: string };
  return result.verification_status === 'SUCCESS';
}

type PayPalWebhookBody = {
  event_type?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    amount?: { value?: string; currency_code?: string };
    purchase_units?: Array<{ amount?: { value?: string; currency_code?: string } }>;
  };
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();

    let event: PayPalWebhookBody;
    try {
      event = JSON.parse(rawBody) as PayPalWebhookBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const allowUnverifiedDev =
      process.env.NODE_ENV !== 'production' &&
      process.env.PAYPAL_ALLOW_UNVERIFIED_WEBHOOK === 'true';
    const hasPayPalTransmissionId = !!req.headers.get('paypal-transmission-id');

    if (process.env.NODE_ENV === 'production') {
      const ok = await verifyPayPalWebhookEvent(req, event);
      if (!ok) {
        return NextResponse.json({ error: 'Invalid PayPal webhook' }, { status: 400 });
      }
    } else if (allowUnverifiedDev) {
      // explicit local-only bypass
    } else if (!hasPayPalTransmissionId) {
      console.warn(
        '[PayPal webhook] Non-production: no PayPal signature headers; skipping verification (use real sandbox webhooks or PAYPAL_ALLOW_UNVERIFIED_WEBHOOK=true).'
      );
    } else {
      const ok = await verifyPayPalWebhookEvent(req, event);
      if (!ok) {
        return NextResponse.json(
          {
            error:
              'PayPal webhook verification failed. Check PAYPAL_WEBHOOK_ID, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and PAYPAL_API_BASE (sandbox vs live).',
          },
          { status: 400 }
        );
      }
    }
    
    // Asegurarse de que sea el evento de cobro completado
    if (event.event_type === 'CHECKOUT.ORDER.APPROVED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const resource = event.resource;
        if (!resource || !resource.id) {
          return NextResponse.json({ received: true });
        }

        // PayPal usa custom_id para pasar nuestra referencia de base de datos
        // o si guardamos PayPal Order ID desde el cliente.
        const orderId = resource.custom_id;
        
        if (orderId) {
            const order = await prisma.order.findUnique({ where: { id: orderId } });
            
            if (order && order.status === 'PENDING') {
                await prisma.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'CONFIRMED',
                        paypalOrderId: resource.id,
                    }
                });
                
                let amount = 0;
                let currency = 'USD';
                
                if (resource.amount?.value) {
                    amount = parseFloat(resource.amount.value);
                    currency = resource.amount.currency_code || 'USD';
                } else if (resource.purchase_units?.[0]?.amount?.value) {
                    const pu = resource.purchase_units[0].amount!;
                    amount = parseFloat(pu.value ?? '0');
                    currency = pu.currency_code || 'USD';
                }
                
                await prisma.paymentTransaction.create({
                    data: {
                        orderId: orderId,
                        provider: 'PAYPAL',
                        transactionId: resource.id,
                        paypalOrderId: resource.id,
                        amount: amount,
                        currency: currency,
                        status: 'COMPLETED',
                    }
                });

                console.log(`✅ Orden ${orderId} confirmada por PayPal.`);
                // Aquí podrías disparar correos transaccionales
            }
        }
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error: any) {
    console.error('❌ PayPal Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}
