import { prisma } from '@/lib/prisma';
import { COMPANY, round2 } from '@/lib/company';

export type QuoteItem = {
  id: string;
  description: string;
  details?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export type InvoicePayment = {
  id: string;
  date: string;
  amount: number;
  method: string;
  note?: string;
};

export const PAYMENT_METHODS = ['CASH', 'ZELLE', 'CARD', 'STRIPE', 'PAYPAL', 'CHECK', 'BANK_TRANSFER'] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const QUOTE_STATUSES = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED'] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const INVOICE_STATUSES = ['DRAFT', 'SENT', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export type CustomerFields = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
};

export function buildDefaultItems(): QuoteItem[] {
  return [
    {
      id: crypto.randomUUID(),
      description: 'SYSTEXX Wallpaper Roll — Material',
      details: '',
      quantity: 1,
      unit: 'roll',
      unitPrice: 350,
    },
    {
      id: crypto.randomUUID(),
      description: 'Professional Installation',
      details: 'Labor, adhesive & wall preparation',
      quantity: 1,
      unit: 'project',
      unitPrice: 0,
    },
  ];
}

export async function nextDocumentNumber(type: 'QUOTE' | 'INVOICE'): Promise<string> {
  const year = new Date().getFullYear();
  const result = await prisma.$transaction(async (tx) => {
    const counter = await tx.documentCounter.upsert({
      where: { type_year: { type, year } },
      create: { type, year, lastNumber: 1 },
      update: { lastNumber: { increment: 1 } },
    });
    return counter;
  });
  const prefix = type === 'QUOTE' ? 'COT' : 'INV';
  return `${prefix}-${year}-${String(result.lastNumber).padStart(3, '0')}`;
}

export function computeQuoteTotals(items: QuoteItem[], taxRate: number) {
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  return { subtotal: round2(subtotal), tax: round2(tax), total: round2(total) };
}

export function computeInvoiceTotals(
  items: QuoteItem[],
  taxRate: number,
  depositRequired: boolean,
  existingPayments: InvoicePayment[],
) {
  const { subtotal, tax, total } = computeQuoteTotals(items, taxRate);
  const depositAmount = depositRequired ? round2(total * COMPANY.depositRate) : 0;
  const amountPaid = round2(existingPayments.reduce((acc, p) => acc + p.amount, 0));
  return { subtotal, tax, total, depositAmount, amountPaid };
}

export function invoiceStatusFromPayments(total: number, amountPaid: number, status: string): string {
  if (status === 'VOID') return 'VOID';
  if (amountPaid <= 0) return status === 'SENT' ? 'SENT' : status === 'PAID' ? 'DRAFT' : status;
  if (amountPaid >= total - 0.005) return 'PAID';
  return 'PARTIAL';
}

export function normalizeItems(raw: unknown): QuoteItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === 'object')
    .map((item: any, index: number) => ({
      id: typeof item.id === 'string' && item.id ? item.id : String(index),
      description: String(item.description || ''),
      details: item.details ? String(item.details) : '',
      quantity: Math.max(0, Number(item.quantity) || 0),
      unit: String(item.unit || 'unit'),
      unitPrice: Math.max(0, Number(item.unitPrice) || 0),
    }));
}

export function parseItemsJson(json: unknown): QuoteItem[] {
  if (Array.isArray(json)) return normalizeItems(json);
  return [];
}

export function parsePaymentsJson(json: unknown): InvoicePayment[] {
  if (!Array.isArray(json)) return [];
  return json
    .filter((p: any) => p && typeof p === 'object')
    .map((p: any, index: number) => ({
      id: typeof p.id === 'string' && p.id ? p.id : String(index),
      date: String(p.date || new Date().toISOString()),
      amount: Math.max(0, Number(p.amount) || 0),
      method: String(p.method || 'CASH'),
      note: p.note ? String(p.note) : '',
    }));
}

export function defaultTerms(language: 'en' | 'es' = 'es'): string[] {
  return language === 'en' ? COMPANY.terms.en : COMPANY.terms.es;
}