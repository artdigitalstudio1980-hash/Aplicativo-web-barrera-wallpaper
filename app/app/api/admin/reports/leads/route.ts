import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Basic admin protection could be added here (e.g., checking session/token)
    
    const leadsCount = await prisma.lead.count();
    const abandonmentsCount = await prisma.cartAbandonment.count();
    const recoveredCount = await prisma.cartAbandonment.count({
      where: { status: 'RECOVERED' }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalLeads: leadsCount,
        totalAbandonments: abandonmentsCount,
        recoveredAbandonments: recoveredCount,
        recoveryRate: abandonmentsCount > 0 
          ? ((recoveredCount / abandonmentsCount) * 100).toFixed(2) + '%' 
          : '0%'
      }
    });
  } catch (error: any) {
    console.error('Report error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}
