export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            state: true,
            country: true,
            zipCode: true,
            createdAt: true,
          }
        },
        aiWallpaperOrders: true,
        paymentTransactions: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                nameEs: true,
                sku: true,
                slug: true,
                price: true,
                salePrice: true,
                images: true,
                category: true,
                description: true,
                dimensions: true,
                material: true,
              }
            }
          }
        },
        installations: true,
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const responseData = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      currency: order.currency,
      isAIGenerated: order.isAIGenerated,
      notes: order.notes,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      deliveredAt: order.deliveredAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      customer: order.user ? {
        id: order.user.id,
        firstName: order.user.firstName,
        lastName: order.user.lastName,
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
        address: order.user.address,
        city: order.user.city,
        state: order.user.state,
        country: order.user.country,
        zipCode: order.user.zipCode,
        registeredAt: order.user.createdAt,
      } : null,

      shipping: {
        name: order.shippingName,
        email: order.shippingEmail,
        phone: order.shippingPhone,
        address1: order.shippingAddress1,
        address2: order.shippingAddress2,
        city: order.shippingCity,
        state: order.shippingState,
        country: order.shippingCountry,
        zip: order.shippingZip,
      },

      billing: order.billingName ? {
        name: order.billingName,
        address1: order.billingAddress1,
        address2: order.billingAddress2,
        city: order.billingCity,
        state: order.billingState,
        country: order.billingCountry,
        zip: order.billingZip,
      } : null,

      aiWallpaperOrder: order.aiWallpaperOrders.length > 0 ? {
        id: order.aiWallpaperOrders[0].id,
        prompt: order.aiWallpaperOrders[0].prompt,
        generatedImageUrl: order.aiWallpaperOrders[0].generatedImageUrl,
        material: order.aiWallpaperOrders[0].material,
        type: order.aiWallpaperOrders[0].type,
        orientation: order.aiWallpaperOrders[0].orientation,
        width: order.aiWallpaperOrders[0].width,
        height: order.aiWallpaperOrders[0].height,
        numCopies: order.aiWallpaperOrders[0].numCopies,
        borderColor: order.aiWallpaperOrders[0].borderColor,
        customerPrice: order.aiWallpaperOrders[0].customerPrice,
        status: order.aiWallpaperOrders[0].status,
        pictoremOrderId: order.aiWallpaperOrders[0].pictoremOrderId,
        errorMessage: order.aiWallpaperOrders[0].errorMessage,
      } : null,

      paymentTransactions: order.paymentTransactions.map(tx => ({
        id: tx.id,
        provider: tx.provider,
        transactionId: tx.transactionId,
        sessionId: tx.sessionId,
        paypalOrderId: tx.paypalOrderId,
        amount: tx.amount,
        currency: tx.currency,
        status: tx.status,
        createdAt: tx.createdAt,
      })),

      orderItems: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        customization: item.customization,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          nameEs: item.product.nameEs,
          sku: item.product.sku,
          slug: item.product.slug,
          price: item.product.price,
          salePrice: item.product.salePrice,
          images: item.product.images,
          category: item.product.category,
          description: item.product.description,
          dimensions: item.product.dimensions,
          material: item.product.material,
        } : null,
      })),

      installations: order.installations.map(inst => ({
        id: inst.id,
        status: inst.status,
        contactName: inst.contactName,
        contactPhone: inst.contactPhone,
        address1: inst.address1,
        city: inst.city,
        state: inst.state,
        preferredDate: inst.preferredDate,
        scheduledDate: inst.scheduledDate,
        notes: inst.notes,
      })),
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error('Get admin order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const existing = await prisma.order.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const body = await req.json();
    const allowedFields = [
      'status', 'trackingNumber', 'notes', 'estimatedDelivery',
      'shippingName', 'shippingEmail', 'shippingPhone',
      'shippingAddress1', 'shippingAddress2',
      'shippingCity', 'shippingState', 'shippingCountry', 'shippingZip',
    ];

    const data: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined && body[field] !== '') {
        data[field] = body[field];
      }
    }

    if (body.status === 'DELIVERED' && existing.status !== 'DELIVERED') {
      data.deliveredAt = new Date();
    }

    if (body.estimatedDelivery) {
      data.estimatedDelivery = new Date(body.estimatedDelivery);
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        trackingNumber: true,
        notes: true,
        estimatedDelivery: true,
        deliveredAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const existing = await prisma.order.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.order.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
