export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { nextDocumentNumber, normalizeItems, computeQuoteTotals, defaultTerms } from '@/lib/documents';
import { COMPANY } from '@/lib/company';
import { sendQuoteEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      address1,
      address2,
      city,
      state,
      zip,
      country,
      items,
      taxRate,
      validUntil,
      notes,
      language,
      installationId,
      sendEmail,
    } = body;

    if (!customerName || !customerEmail || typeof items === 'undefined' || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user ? (session.user as any).id : null;

    const normalizedItems = normalizeItems(items);
    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }

    const rate = typeof taxRate === 'number' && taxRate >= 0 ? taxRate : COMPANY.defaultTaxRate;
    const totals = computeQuoteTotals(normalizedItems, rate);
    const quoteNumber = await nextDocumentNumber('QUOTE');
    const lang = language === 'en' ? 'en' : 'es';

    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        customerName: String(customerName),
        customerEmail: String(customerEmail),
        customerPhone: customerPhone ? String(customerPhone) : null,
        address1: address1 ? String(address1) : null,
        address2: address2 ? String(address2) : null,
        city: city ? String(city) : null,
        state: state ? String(state) : null,
        zip: zip ? String(zip) : null,
        country: country || 'US',
        items: normalizedItems as any,
        subtotal: totals.subtotal,
        taxRate: rate,
        tax: totals.tax,
        total: totals.total,
        currency: 'USD',
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + COMPANY.quoteValidityDays * 86400000),
        status: sendEmail ? 'SENT' : 'DRAFT',
        notes: notes ? String(notes) : null,
        terms: defaultTerms(lang) as any,
        language: lang,
        installationId: installationId ? String(installationId) : null,
        userId,
        sentAt: sendEmail ? new Date() : null,
      },
    });

    if (sendEmail) {
      await sendQuoteEmail({
        quoteNumber: quote.quoteNumber,
        customerEmail: quote.customerEmail,
        customerName: quote.customerName,
        total: quote.total,
        currency: quote.currency,
        subtotal: quote.subtotal,
        tax: quote.tax,
        items: normalizedItems.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice,
        })),
        printUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/print/quote/${quote.id}`,
        locale: lang,
      });
    }

    return NextResponse.json({ success: true, data: quote });
  } catch (error: any) {
    console.error('Create quote error:', error);
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const quotes = await prisma.quote.findMany({
      include: {
        installation: { select: { id: true, status: true, address1: true, city: true } },
        invoice: { select: { id: true, invoiceNumber: true, status: true } },
        user: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: quotes });
  } catch (error: any) {
    console.error('Get quotes error:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}