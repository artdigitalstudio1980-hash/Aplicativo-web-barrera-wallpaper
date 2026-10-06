import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintDocument from '@/components/print/print-document';
import PrintToolbar from '@/components/print/print-toolbar';
import { parseItemsJson } from '@/lib/documents';

export const dynamic = 'force-dynamic';

export default async function PrintInvoicePage({ params }: { params: { id: string } }) {
  const invoice = await prisma.invoice.findUnique({ where: { id: params.id } });
  if (!invoice) notFound();

  const items = parseItemsJson(invoice.items);
  const terms = Array.isArray(invoice.terms) ? invoice.terms.map(String) : [];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="no-print max-w-4xl mx-auto mb-6">
        <PrintToolbar backHref={`/admin/invoices/${invoice.id}`} backLabel="Back to invoice" />
      </div>
      <div className="max-w-4xl mx-auto bg-white shadow-2xl p-10">
        <PrintDocument
          doc={{
            kind: 'INVOICE',
            number: invoice.invoiceNumber,
            customer: {
              name: invoice.customerName,
              email: invoice.customerEmail,
              phone: invoice.customerPhone,
              address1: invoice.address1,
              address2: invoice.address2,
              city: invoice.city,
              state: invoice.state,
              zip: invoice.zip,
              country: invoice.country,
            },
            items,
            subtotal: invoice.subtotal,
            taxRate: invoice.taxRate,
            tax: invoice.tax,
            total: invoice.total,
            currency: invoice.currency,
            status: invoice.status,
            issueDate: invoice.createdAt.toISOString(),
            validUntil: null,
            dueDate: invoice.dueDate?.toISOString() || null,
            depositAmount: invoice.depositAmount,
            amountPaid: invoice.amountPaid,
            notes: invoice.notes,
            terms,
            language: invoice.language === 'en' ? 'en' : 'es',
            orderNumber: invoice.orderId,
          }}
        />
      </div>
    </div>
  );
}