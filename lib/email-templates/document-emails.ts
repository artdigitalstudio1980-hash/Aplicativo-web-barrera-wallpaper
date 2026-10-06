import { COMPANY } from '@/lib/company';
import type { QuoteItem, InvoicePayment } from '@/lib/documents';

interface DocumentEmailData {
  documentNumber: string;
  customerName: string;
  total: number;
  currency: string;
  depositAmount?: number;
  amountPaid?: number;
  printUrl: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  status?: string;
}

function itemsTable(items: QuoteItem[], t: any): string {
  const rows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #333;">${item.description}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #666; text-align: center;">${item.quantity} ${item.unit}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #333; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; color: #333; text-align: right; font-weight: 600;">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
    </tr>`,
    )
    .join('');

  return `
  <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
    <thead>
      <tr style="background: #f5f5f5;">
        <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">${t.description}</th>
        <th style="padding: 10px 12px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">${t.qty}</th>
        <th style="padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">${t.unitPrice}</th>
        <th style="padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;">${t.total}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function totalsBlock(data: DocumentEmailData, t: any): string {
  return `
  <table style="width: 100%; max-width: 320px; margin-left: auto; border-collapse: collapse;">
    <tr>
      <td style="padding: 6px 12px; color: #666;">${t.subtotal}</td>
      <td style="padding: 6px 12px; text-align: right; color: #333;">$${data.subtotal.toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding: 6px 12px; color: #666;">${t.tax}</td>
      <td style="padding: 6px 12px; text-align: right; color: #333;">$${data.tax.toFixed(2)}</td>
    </tr>
    <tr style="border-top: 2px solid #000;">
      <td style="padding: 10px 12px; font-weight: 700; color: #000;">${t.total}</td>
      <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #000;">$${data.total.toFixed(2)} ${data.currency}</td>
    </tr>
    ${
      data.depositAmount !== undefined
        ? `<tr>
      <td style="padding: 6px 12px; color: #666;">${t.deposit}</td>
      <td style="padding: 6px 12px; text-align: right; color: #333;">$${data.depositAmount.toFixed(2)}</td>
    </tr>
    <tr>
      <td style="padding: 6px 12px; color: #666;">${t.paid}</td>
      <td style="padding: 6px 12px; text-align: right; color: #333;">$${(data.amountPaid || 0).toFixed(2)}</td>
    </tr>`
        : ''
    }
  </table>`;
}

function wrapper(title: string, content: string, cta: string): string {
  return `
  <div style="background: #fafafa; padding: 40px 16px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #eee; border-radius: 16px; overflow: hidden;">
      <div style="background: #000; padding: 28px 32px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 3px; text-transform: uppercase; font-weight: 800; font-style: italic;">BARRERA WALLPAPER</h1>
        <p style="color: #999; margin: 6px 0 0; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;">Miami, Florida — Premium Wall Coverings</p>
      </div>
      <div style="padding: 32px;">
        ${title}
        ${content}
        <div style="text-align: center; margin-top: 32px;">
          <a href="${cta}" style="background: #000; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 700; display: inline-block; font-size: 14px;">${'📄 View Document'}</a>
        </div>
      </div>
      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        ${COMPANY.legalName} — ${COMPANY.address1}, ${COMPANY.city}, ${COMPANY.state} ${COMPANY.zip}<br/>
        ${COMPANY.phone} | ${COMPANY.email} | ${COMPANY.website}
      </div>
    </div>
  </div>`;
}

export function renderQuoteEmail(data: DocumentEmailData, locale: 'en' | 'es' = 'es'): string {
  const t =
    locale === 'es'
      ? {
          title: `Cotización ${data.documentNumber}`,
          intro: `Hola ${data.customerName},<br/>Adjuntamos su cotización <strong>${data.documentNumber}</strong>. Por favor revísela y confírmenos para programar su proyecto.`,
          description: 'Descripción',
          qty: 'Cant.',
          unitPrice: 'P. Unit.',
          total: 'Total',
          subtotal: 'Subtotal',
          tax: 'Impuesto',
          deposit: 'Depósito 50%',
          paid: 'Pagado',
        }
      : {
          title: `Quotation ${data.documentNumber}`,
          intro: `Hi ${data.customerName},<br/>Please find attached quotation <strong>${data.documentNumber}</strong>. Review it and let us know to schedule your project.`,
          description: 'Description',
          qty: 'Qty',
          unitPrice: 'Unit Price',
          total: 'Total',
          subtotal: 'Subtotal',
          tax: 'Tax',
          deposit: '50% Deposit',
          paid: 'Paid',
        };

  return wrapper(
    `<h2 style="margin: 0 0 8px; color: #000; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">${t.title}</h2>
     <p style="color: #555; line-height: 1.6; font-size: 14px;">${t.intro}</p>`,
    itemsTable(data.items, t) + totalsBlock(data, t),
    data.printUrl,
  );
}

export function renderInvoiceEmail(data: DocumentEmailData, locale: 'en' | 'es' = 'es'): string {
  const t =
    locale === 'es'
      ? {
          title: `Factura ${data.documentNumber}`,
          intro: `Hola ${data.customerName},<br/>Le compartimos la factura <strong>${data.documentNumber}</strong> por un total de <strong>$${data.total.toFixed(2)}</strong>.`,
          description: 'Descripción',
          qty: 'Cant.',
          unitPrice: 'P. Unit.',
          total: 'Total',
          subtotal: 'Subtotal',
          tax: 'Impuesto',
          deposit: 'Depósito 50%',
          paid: 'Pagado',
        }
      : {
          title: `Invoice ${data.documentNumber}`,
          intro: `Hi ${data.customerName},<br/>Here is invoice <strong>${data.documentNumber}</strong> for a total of <strong>$${data.total.toFixed(2)}</strong>.`,
          description: 'Description',
          qty: 'Qty',
          unitPrice: 'Unit Price',
          total: 'Total',
          subtotal: 'Subtotal',
          tax: 'Tax',
          deposit: '50% Deposit',
          paid: 'Paid',
        };

  return wrapper(
    `<h2 style="margin: 0 0 8px; color: #000; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">${t.title}</h2>
     <p style="color: #555; line-height: 1.6; font-size: 14px;">${t.intro}</p>`,
    itemsTable(data.items, t) + totalsBlock(data, t),
    data.printUrl,
  );
}