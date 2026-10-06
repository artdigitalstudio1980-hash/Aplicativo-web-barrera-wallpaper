export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { normalizeItems, computeQuoteTotals, defaultTerms } from '@/lib/documents';
import { COMPANY } from '@/lib/company';
import { sendQuoteEmail } from '@/lib/mailer';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        installation: true,
        invoice: true,
        user: { select: { id: true, email: true } },
      },
    });
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: quote });
  } catch (error: any) {
    console.error('Get quote error:', error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const existing = await prisma.quote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    const data: any = {};
    const STRING_FIELDS = [
      'customerName',
      'customerEmail',
      'customerPhone',
      'address1',
      'address2',
      'city',
      'state',
      'zip',
      'country',
      'notes',
      'language',
    ] as const;
    for (const field of STRING_FIELDS) {
      if (body[field] !== undefined) data[field] = body[field] ? String(body[field]) : null;
    }

    if (body.validUntil !== undefined) data.validUntil = body.validUntil ? new Date(body.validUntil) : null;
    if (body.installationId !== undefined) data.installationId = body.installationId || null;

    let items = existing.items;
    let taxRate = existing.taxRate;
    if (Array.isArray(body.items)) {
      items = normalizeItems(body.items);
      data.items = items as any;
    }
    if (typeof body.taxRate === 'number' && body.taxRate >= 0) {
      taxRate = body.taxRate;
      data.taxRate = taxRate;
    }
    if (Array.isArray(body.items) || typeof body.taxRate === 'number') {
      const totals = computeQuoteTotals(items as any, taxRate);
      data.subtotal = totals.subtotal;
      data.tax = totals.tax;
      data.total = totals.total;
    }

    const ALLOWED_STATUS = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED'];
    if (typeof body.status === 'string' && ALLOWED_STATUS.includes(body.status)) {
      data.status = body.status;
      if (body.status === 'SENT' && !existing.sentAt) data.sentAt = new Date();
      if (body.status === 'APPROVED' || body.status === 'REJECTED') data.respondedAt = new Date();
    }

    const quote = await prisma.quote.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: quote });
  } catch (error: any) {
    console.error('Update quote error:', error);
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const existing = await prisma.quote.findUnique({ where: { id }, include: { invoice: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }
    if (existing.invoice) {
      return NextResponse.json(
        { error: 'Cannot delete a quote that has an invoice. Delete the invoice first.' },
        { status: 409 },
      );
    }
    await prisma.quote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete quote error:', error);
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    if (body.action === 'send') {
      const lang = quote.language === 'en' ? 'en' : 'es';
      const sent = await sendQuoteEmail({
        quoteNumber: quote.quoteNumber,
        customerEmail: quote.customerEmail,
        customerName: quote.customerName,
        total: quote.total,
        currency: quote.currency,
        subtotal: quote.subtotal,
        tax: quote.tax,
        items: Array.isArray(quote.items)
          ? quote.items.map((i: any) => ({
              description: i.description,
              quantity: i.quantity,
              unit: i.unit,
              unitPrice: i.unitPrice,
            }))
          : [],
        printUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/print/quote/${quote.id}`,
        locale: lang,
      });
      if (!sent) {
        return NextResponse.json({ error: 'Failed to send quote email' }, { status: 500 });
      }
      const updated = await prisma.quote.update({
        where: { id },
        data: { status: 'SENT', sentAt: new Date() },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Quote action error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}