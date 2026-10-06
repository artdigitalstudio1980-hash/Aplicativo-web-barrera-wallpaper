import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PrintDocument from '@/components/print/print-document';
import PrintToolbar from '@/components/print/print-toolbar';
import { parseItemsJson } from '@/lib/documents';

export const dynamic = 'force-dynamic';

export default async function PrintQuotePage({ params }: { params: { id: string } }) {
  const quote = await prisma.quote.findUnique({ where: { id: params.id } });
  if (!quote) notFound();

  const items = parseItemsJson(quote.items);
  const terms = Array.isArray(quote.terms) ? quote.terms.map(String) : [];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="no-print max-w-4xl mx-auto mb-6">
        <PrintToolbar backHref={`/admin/quotes/${quote.id}`} backLabel="Back to quote" />
      </div>
      <div className="max-w-4xl mx-auto bg-white shadow-2xl p-10">
        <PrintDocument
          doc={{
            kind: 'QUOTE',
            number: quote.quoteNumber,
            customer: {
              name: quote.customerName,
              email: quote.customerEmail,
              phone: quote.customerPhone,
              address1: quote.address1,
              address2: quote.address2,
              city: quote.city,
              state: quote.state,
              zip: quote.zip,
              country: quote.country,
            },
            items,
            subtotal: quote.subtotal,
            taxRate: quote.taxRate,
            tax: quote.tax,
            total: quote.total,
            currency: quote.currency,
            status: quote.status,
            issueDate: quote.createdAt.toISOString(),
            validUntil: quote.validUntil?.toISOString() || null,
            notes: quote.notes,
            terms,
            language: quote.language === 'en' ? 'en' : 'es',
          }}
        />
      </div>
    </div>
  );
}