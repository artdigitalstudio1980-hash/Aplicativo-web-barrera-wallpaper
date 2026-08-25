export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import {
  nextDocumentNumber,
  normalizeItems,
  computeInvoiceTotals,
  parsePaymentsJson,
  invoiceStatusFromPayments,
  defaultTerms,
} from '@/lib/documents';
import { COMPANY } from '@/lib/company';
import { sendInvoiceEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      quoteId,
      orderId,
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
      depositRequired,
      dueDate,
      notes,
      language,
      sendEmail,
    } = body;

    if (quoteId) {
      const existing = await prisma.invoice.findUnique({ where: { quoteId } });
      if (existing) {
        return NextResponse.json(
          { error: 'This quote already has an invoice', data: existing },
          { status: 409 },
        );
      }
    }

    let sourceQuote: any = null;
    if (quoteId) {
      sourceQuote = await prisma.quote.findUnique({ where: { id: quoteId } });
      if (!sourceQuote) {
        return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
      }
    }

    const effectiveItems = Array.isArray(items)
      ? normalizeItems(items)
      : sourceQuote
        ? normalizeItems(sourceQuote.items)
        : [];
    if (effectiveItems.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }

    const rate = typeof taxRate === 'number' && taxRate >= 0 ? taxRate : (sourceQuote?.taxRate ?? COMPANY.defaultTaxRate);
    const depReq = typeof depositRequired === 'boolean' ? depositRequired : true;
    const totals = computeInvoiceTotals(effectiveItems, rate, depReq, []);
    const invoiceNumber = await nextDocumentNumber('INVOICE');
    const lang = language ? (language === 'en' ? 'en' : 'es') : (sourceQuote?.language ?? 'es');

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        quoteId: quoteId || null,
        orderId: orderId || null,
        userId: (session.user as any).id,
        customerName: sourceQuote ? sourceQuote.customerName : String(customerName || ''),
        customerEmail: sourceQuote ? sourceQuote.customerEmail : String(customerEmail || ''),
        customerPhone: sourceQuote ? sourceQuote.customerPhone : customerPhone ? String(customerPhone) : null,
        address1: sourceQuote ? sourceQuote.address1 : address1 ? String(address1) : null,
        address2: sourceQuote ? sourceQuote.address2 : address2 ? String(address2) : null,
        city: sourceQuote ? sourceQuote.city : city ? String(city) : null,
        state: sourceQuote ? sourceQuote.state : state ? String(state) : null,
        zip: sourceQuote ? sourceQuote.zip : zip ? String(zip) : null,
        country: sourceQuote ? sourceQuote.country : country || 'US',
        items: effectiveItems as any,
        subtotal: totals.subtotal,
        taxRate: rate,
        tax: totals.tax,
        total: totals.total,
        depositRequired: depReq,
        depositAmount: totals.depositAmount,
        amountPaid: 0,
        payments: [] as any,
        currency: 'USD',
        status: 'DRAFT',
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 86400000),
        notes: notes ? String(notes) : null,
        terms: defaultTerms(lang) as any,
        language: lang,
      },
    });

    if (sourceQuote && sourceQuote.status !== 'CONVERTED') {
      await prisma.quote.update({ where: { id: sourceQuote.id }, data: { status: 'CONVERTED' } });
    }

    if (sendEmail) {
      await sendInvoiceEmail({
        invoiceNumber: invoice.invoiceNumber,
        customerEmail: invoice.customerEmail,
        customerName: invoice.customerName,
        total: invoice.total,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        depositAmount: invoice.depositAmount,
        amountPaid: 0,
        items: effectiveItems.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unit: i.unit,
          unitPrice: i.unitPrice,
        })),
        printUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/print/invoice/${invoice.id}`,
        locale: lang,
      });
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        quote: { select: { id: true, quoteNumber: true } },
        order: { select: { id: true, orderNumber: true } },
        user: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}