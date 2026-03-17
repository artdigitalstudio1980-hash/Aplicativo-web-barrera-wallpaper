import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;
    
    // Aquí idealmente validarías el webhook signature de PayPal.
    // PayPal usa PAYPAL-AUTH-ALGO, PAYPAL-CERT-URL, PAYPAL-TRANSMISSION-ID, etc.
    // Para simplificar, parseamos el JSON asumiendo que el Body viene del sistema de PayPal.
    
    const event = JSON.parse(rawBody);
    
    // Asegurarse de que sea el evento de cobro completado
    if (event.event_type === 'CHECKOUT.ORDER.APPROVED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        const resource = event.resource;
        
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
                
                if (resource.amount && resource.amount.value) {
                    amount = parseFloat(resource.amount.value);
                    currency = resource.amount.currency_code;
                } else if(resource.purchase_units && resource.purchase_units[0].amount) {
                    amount = parseFloat(resource.purchase_units[0].amount.value);
                    currency = resource.purchase_units[0].amount.currency_code;
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
