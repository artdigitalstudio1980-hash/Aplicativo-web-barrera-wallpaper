export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const existing = await prisma.installation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
    }

    const data: any = {};
    if (typeof body.status === 'string') data.status = body.status;
    if (typeof body.estimatedCost === 'number') data.estimatedCost = body.estimatedCost;
    if (typeof body.finalCost === 'number') data.finalCost = body.finalCost;
    if (typeof body.specialRequests === 'string') data.specialRequests = body.specialRequests;
    if (typeof body.notes === 'string') data.notes = body.notes;
    if (body.scheduledDate !== undefined) data.scheduledDate = body.scheduledDate ? new Date(body.scheduledDate) : null;
    if (body.preferredDate !== undefined) data.preferredDate = body.preferredDate ? new Date(body.preferredDate) : null;
    if (body.alternativeDate !== undefined) data.alternativeDate = body.alternativeDate ? new Date(body.alternativeDate) : null;
    if (body.completedDate !== undefined) data.completedDate = body.completedDate ? new Date(body.completedDate) : null;

    const installation = await prisma.installation.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: installation });
  } catch (error: any) {
    console.error('Update installation error:', error);
    return NextResponse.json({ error: 'Failed to update installation' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    await prisma.installation.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete installation error:', error);
    return NextResponse.json({ error: 'Failed to delete installation' }, { status: 500 });
  }
}