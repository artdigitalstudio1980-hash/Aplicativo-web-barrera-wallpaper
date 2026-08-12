export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import {
  normalizeItems,
  computeInvoiceTotals,
  parsePaymentsJson,
  invoiceStatusFromPayments,
} from '@/lib/documents';
import { COMPANY } from '@/lib/company';
import { sendInvoiceEmail } from '@/lib/mailer';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        quote: true,
        order: { select: { id: true, orderNumber: true, total: true } },
        user: { select: { id: true, email: true } },
      },
    });
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    console.error('Get invoice error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
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
    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
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
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;

    let items = existing.items;
    let taxRate = existing.taxRate;
    let depositRequired = existing.depositRequired;
    if (Array.isArray(body.items)) {
      items = normalizeItems(body.items);
      data.items = items as any;
    }
    if (typeof body.taxRate === 'number' && body.taxRate >= 0) {
      taxRate = body.taxRate;
      data.taxRate = taxRate;
    }
    if (typeof body.depositRequired === 'boolean') {
      depositRequired = body.depositRequired;
      data.depositRequired = depositRequired;
    }
    if (Array.isArray(body.items) || typeof body.taxRate === 'number' || typeof body.depositRequired === 'boolean') {
      const totals = computeInvoiceTotals(items as any, taxRate, depositRequired, parsePaymentsJson(existing.payments));
      data.subtotal = totals.subtotal;
      data.tax = totals.tax;
      data.total = totals.total;
      data.depositAmount = totals.depositAmount;
      data.amountPaid = totals.amountPaid;
      data.status = invoiceStatusFromPayments(totals.total, totals.amountPaid, existing.status) as any;
      if (totals.amountPaid >= totals.total - 0.005) data.paidAt = new Date();
    }

    const ALLOWED_STATUS = ['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID'];
    if (typeof body.status === 'string' && ALLOWED_STATUS.includes(body.status)) {
      data.status = body.status;
      if (body.status === 'SENT' && !existing.sentAt) data.sentAt = new Date();
    }

    const invoice = await prisma.invoice.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    console.error('Update invoice error:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = params;
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete invoice error:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
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
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (body.action === 'add-payment') {
      const amount = Math.max(0, Number(body.amount) || 0);
      if (amount <= 0) {
        return NextResponse.json({ error: 'Payment amount must be greater than zero' }, { status: 400 });
      }
      const method = String(body.method || 'CASH');
      const payments = parsePaymentsJson(invoice.payments);
      payments.push({
        id: crypto.randomUUID(),
        date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
        amount,
        method,
        note: body.note ? String(body.note) : '',
      });
      const newPaid = Math.min(invoice.total, invoice.amountPaid + amount);
      const nextStatus = invoiceStatusFromPayments(invoice.total, newPaid, invoice.status) as any;
      const updated = await prisma.invoice.update({
        where: { id },
        data: {
          payments: payments as any,
          amountPaid: newPaid,
          status: nextStatus,
          paidAt: nextStatus === 'PAID' ? new Date() : null,
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (body.action === 'send') {
      const lang = invoice.language === 'en' ? 'en' : 'es';
      const sent = await sendInvoiceEmail({
        invoiceNumber: invoice.invoiceNumber,
        customerEmail: invoice.customerEmail,
        customerName: invoice.customerName,
        total: invoice.total,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        depositAmount: invoice.depositAmount,
        amountPaid: invoice.amountPaid,
        items: Array.isArray(invoice.items)
          ? invoice.items.map((i: any) => ({
              description: i.description,
              quantity: i.quantity,
              unit: i.unit,
              unitPrice: i.unitPrice,
            }))
          : [],
        printUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/print/invoice/${invoice.id}`,
        locale: lang,
      });
      if (!sent) {
        return NextResponse.json({ error: 'Failed to send invoice email' }, { status: 500 });
      }
      const updated = await prisma.invoice.update({
        where: { id },
        data: { status: 'SENT', sentAt: new Date() },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Invoice action error:', error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}