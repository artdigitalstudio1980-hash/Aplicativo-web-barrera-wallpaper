export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET - List all categories
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    );
  }
}
