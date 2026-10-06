export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const installations = await prisma.installation.findMany({
      include: {
        quotes: {
          select: { id: true, quoteNumber: true, status: true, total: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: installations });
  } catch (error: any) {
    console.error('Get admin installations error:', error);
    return NextResponse.json({ error: 'Failed to fetch installations' }, { status: 500 });
  }
}