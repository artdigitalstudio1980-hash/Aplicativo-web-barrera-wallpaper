
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        subtotal: true,
        total: true,
        currency: true,
        notes: true,
        shippingName: true,
        shippingEmail: true,
        createdAt: true,
        updatedAt: true,
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            customization: true,
            product: {
              select: { name: true, images: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      orders
    });

  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
