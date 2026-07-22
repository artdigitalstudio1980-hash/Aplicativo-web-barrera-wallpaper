export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(req: NextRequest) {
  try {
    // 1. Protección de Administrador
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 2. Contar Leads Reales desde la tabla de Contacto
    const leadsCount = await prisma.contactSubmission.count();

    // 3. Contar Carritos Abandonados (Órdenes pendientes por más de 1 hora)
    const oneHourAgo = new Date(Date.now() - 3600 * 1000);
    const abandonmentsCount = await prisma.order.count({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: oneHourAgo,
        },
      },
    });

    // 4. Contar Órdenes Totales (para calcular la tasa de conversión)
    const totalOrders = await prisma.order.count();
    const confirmedOrders = await prisma.order.count({
        where: {
            status: {
                in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
            }
        }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalLeads: leadsCount,
        totalAbandonments: abandonmentsCount,
        totalOrders: totalOrders,
        confirmedOrders: confirmedOrders,
        // Tasa de conversión simple: (Confirmadas / Totales)
        conversionRate: totalOrders > 0 
          ? ((confirmedOrders / totalOrders) * 100).toFixed(2) + '%' 
          : '0%'
      }
    });
  } catch (error: any) {
    console.error('Admin report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate admin report' },
      { status: 500 }
    );
  }
}
