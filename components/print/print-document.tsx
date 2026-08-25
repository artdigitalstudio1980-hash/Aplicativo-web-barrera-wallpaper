import Image from 'next/image';
import { COMPANY, formatCurrency } from '@/lib/company';
import type { QuoteItem, InvoicePayment } from '@/lib/documents';

export type PrintDocument = {
  number: string;
  kind: 'QUOTE' | 'INVOICE';
  customer: {
    name: string;
    email: string;
    phone?: string | null;
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
    country?: string | null;
  };
  items: QuoteItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  currency: string;
  depositAmount?: number;
  amountPaid?: number;
  status: string;
  issueDate: string;
  validUntil?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  terms?: string[];
  language: 'es' | 'en';
  orderNumber?: string | null;
};

const T: Record<'es' | 'en', Record<string, string>> = {
  es: {
    quote: 'COTIZACIÓN',
    invoice: 'FACTURA',
    billTo: 'FACTURAR A',
    issued: 'EMITIDA',
    validUntil: 'VÁLIDA HASTA',
    dueDate: 'VENCIMIENTO',
    status: 'ESTADO',
    description: 'DESCRIPCIÓN',
    qty: 'CANT.',
    unit: 'UNIDAD',
    unitPrice: 'P. UNIT.',
    amount: 'IMPORTE',
    subtotal: 'Subtotal',
    tax: 'Impuesto',
    total: 'TOTAL',
    deposit: 'Depósito requerido (50%)',
    paid: 'Pagado',
    balance: 'Saldo pendiente',
    notes: 'NOTAS',
    termsTitle: 'TÉRMINOS Y CONDICIONES',
    installment: 'Proyecto de instalación — Miami, FL',
    statusSent: 'Enviada — pendiente de aprobación',
  },
  en: {
    quote: 'QUOTATION',
    invoice: 'INVOICE',
    billTo: 'BILL TO',
    issued: 'ISSUED',
    validUntil: 'VALID UNTIL',
    dueDate: 'DUE DATE',
    status: 'STATUS',
    description: 'DESCRIPTION',
    qty: 'QTY',
    unit: 'UNIT',
    unitPrice: 'UNIT PRICE',
    amount: 'AMOUNT',
    subtotal: 'Subtotal',
    tax: 'Tax',
    total: 'TOTAL',
    deposit: 'Required deposit (50%)',
    paid: 'Paid',
    balance: 'Balance due',
    notes: 'NOTES',
    termsTitle: 'TERMS & CONDITIONS',
    installment: 'Installation project — Miami, FL',
    statusSent: 'Sent — pending approval',
  },
};

export default function PrintDocument(props: { doc: PrintDocument }) {
  const { doc } = props;
  const t = T[doc.language];
  const statusLabel =
    doc.kind === 'QUOTE'
      ? doc.status === 'SENT'
        ? t.statusSent
        : doc.status
      : doc.status;

  return (
    <div className="print-document">
      <header className="doc-header">
        <div className="brand">
          <Image
            src="/logos/Barrera_logo_black-2.png"
            alt="Barrera Wallpaper"
            width={220}
            height={70}
            priority
            style={{ objectFit: 'contain' }}
            unoptimized
          />
          <p className="tagline">{doc.kind === 'QUOTE' ? t.installment : t.installment}</p>
        </div>
        <div className="doc-meta">
          <h1>{doc.kind === 'QUOTE' ? t.quote : t.invoice}</h1>
          <div className="meta-row">
            <span className="meta-key">{t.status}:</span>
            <span className="meta-value status">{statusLabel}</span>
          </div>
          <div className="meta-row">
            <span className="meta-key">#:</span>
            <span className="meta-value mono">{doc.number}</span>
          </div>
          <div className="meta-row">
            <span className="meta-key">{t.issued}:</span>
            <span className="meta-value">
                {new Date(doc.issueDate).toLocaleDateString(doc.language === 'es' ? 'es-US' : 'en-US', { timeZone: 'UTC' })}
            </span>
          </div>
          {doc.kind === 'QUOTE' && doc.validUntil && (
            <div className="meta-row">
              <span className="meta-key">{t.validUntil}:</span>
              <span className="meta-value">
                {new Date(doc.validUntil).toLocaleDateString(doc.language === 'es' ? 'es-US' : 'en-US', { timeZone: 'UTC' })}
              </span>
            </div>
          )}
          {doc.kind === 'INVOICE' && doc.dueDate && (
            <div className="meta-row">
              <span className="meta-key">{t.dueDate}:</span>
              <span className="meta-value">
                {new Date(doc.dueDate).toLocaleDateString(doc.language === 'es' ? 'es-US' : 'en-US', { timeZone: 'UTC' })}
              </span>
            </div>
          )}
          {doc.orderNumber && (
            <div className="meta-row">
              <span className="meta-key">Order:</span>
              <span className="meta-value mono">{doc.orderNumber}</span>
            </div>
          )}
        </div>
      </header>

      <div className="bill-to">
        <h3>{t.billTo}</h3>
        <p className="name">{doc.customer.name}</p>
        {doc.customer.address1 && <p>{doc.customer.address1}</p>}
        {doc.customer.address2 && <p>{doc.customer.address2}</p>}
        {(doc.customer.city || doc.customer.state || doc.customer.zip) && (
          <p>
            {[doc.customer.city, doc.customer.state, doc.customer.zip]
              .filter(Boolean)
              .join(', ')}
          </p>
        )}
        {doc.customer.phone && <p>{doc.customer.phone}</p>}
        <p>{doc.customer.email}</p>
      </div>

      <table className="items-table">
        <thead>
          <tr>
            <th className="col-desc">{t.description}</th>
            <th>{t.qty}</th>
            <th>{t.unit}</th>
            <th>{t.unitPrice}</th>
            <th className="num">{t.amount}</th>
          </tr>
        </thead>
        <tbody>
          {doc.items.map((item, i) => (
            <tr key={item.id || i}>
              <td>
                <span className="item-desc">{item.description}</span>
                {item.details && <span className="item-details">{item.details}</span>}
              </td>
              <td className="num">{item.quantity}</td>
              <td>{item.unit}</td>
              <td className="num">{formatCurrency(item.unitPrice, doc.currency)}</td>
              <td className="num">{formatCurrency(item.quantity * item.unitPrice, doc.currency)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="foot-label">{t.subtotal}</td>
            <td className="num">{formatCurrency(doc.subtotal, doc.currency)}</td>
          </tr>
          <tr>
            <td colSpan={4} className="foot-label">
              {t.tax} ({doc.taxRate}%)
            </td>
            <td className="num">{formatCurrency(doc.tax, doc.currency)}</td>
          </tr>
          <tr className="grand-total">
            <td colSpan={4} className="foot-label">{t.total}</td>
            <td className="num">{formatCurrency(doc.total, doc.currency)}</td>
          </tr>
          {doc.kind === 'INVOICE' && doc.depositAmount !== undefined && doc.depositAmount > 0 && (
            <>
              <tr>
                <td colSpan={4} className="foot-label">{t.deposit}</td>
                <td className="num">{formatCurrency(doc.depositAmount, doc.currency)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="foot-label">{t.paid}</td>
                <td className="num">{formatCurrency(doc.amountPaid || 0, doc.currency)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="foot-label">{t.balance}</td>
                <td className="num">
                  {formatCurrency(Math.max(0, doc.total - (doc.amountPaid || 0)), doc.currency)}
                </td>
              </tr>
            </>
          )}
        </tfoot>
      </table>

      {doc.notes && (
        <div className="notes">
          <h3>{t.notes}</h3>
          <p>{doc.notes}</p>
        </div>
      )}

      {doc.terms && doc.terms.length > 0 && (
        <div className="terms">
          <h3>{t.termsTitle}</h3>
          <ol>
            {doc.terms.map((term, i) => (
              <li key={i}>{term}</li>
            ))}
          </ol>
        </div>
      )}

      <footer className="doc-footer">
        <div className="company-block">
          <strong>{COMPANY.legalName}</strong>
          <span>
            {COMPANY.address1}, {COMPANY.city}, {COMPANY.state} {COMPANY.zip}
          </span>
          <span>{COMPANY.phone}</span>
          <span>{COMPANY.email}</span>
          <span>{COMPANY.website}</span>
          {COMPANY.taxId && <span>Tax ID: {COMPANY.taxId}</span>}
        </div>
        <div className="thanks">
          {doc.language === 'es' ? '¡Gracias por su confianza!' : 'Thank you for your trust!'}
        </div>
      </footer>

      <style>{`
        @media print {
          @page { size: letter; margin: 14mm 12mm; }
          body { background: #fff !important; }
          .no-print { display: none !important; }
        }
        .print-document { background: #fff; color: #111; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.5; }
        .doc-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 24px; }
        .brand img { max-height: 64px; width: auto; }
        .tagline { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #666; margin-top: 6px; }
        .doc-meta { text-align: right; }
        .doc-meta h1 { font-size: 30px; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; margin: 0 0 8px; font-style: italic; }
        .meta-row { display: flex; justify-content: flex-end; gap: 8px; font-size: 12px; margin-top: 2px; }
        .meta-key { color: #888; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; align-self: center; }
        .meta-value.status { font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
        .mono { font-family: 'Courier New', monospace; font-weight: 600; }
        .bill-to { margin-bottom: 28px; }
        .bill-to h3 { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin: 0 0 6px; }
        .bill-to .name { font-weight: 700; font-size: 15px; margin: 0 0 2px; }
        .bill-to p { margin: 0; color: #333; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
        .items-table thead th { background: #000; color: #fff; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; padding: 10px 8px; text-align: left; }
        .items-table thead th.col-desc { padding-left: 12px; }
        .items-table th.num, .items-table td.num { text-align: right; }
        .items-table tbody td { padding: 10px 8px; border-bottom: 1px solid #e5e5e5; vertical-align: top; }
        .items-table tbody td:first-child { padding-left: 12px; }
        .item-desc { font-weight: 600; display: block; }
        .item-details { font-size: 11px; color: #666; display: block; margin-top: 2px; }
        .items-table tfoot td { padding: 8px; text-align: right; font-size: 12px; }
        .items-table tfoot .foot-label { text-align: right; color: #555; }
        .items-table tfoot .grand-total td { border-top: 2px solid #000; font-weight: 800; font-size: 15px; }
        .notes, .terms { margin-bottom: 20px; }
        .notes h3, .terms h3 { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin: 0 0 6px; }
        .terms ol { margin: 0; padding-left: 18px; color: #444; font-size: 12px; }
        .terms li { margin-bottom: 4px; }
        .doc-footer { border-top: 2px solid #000; padding-top: 16px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #444; }
        .company-block { display: flex; flex-direction: column; gap: 1px; }
        .thanks { font-style: italic; font-weight: 600; }
      `}</style>
    </div>
  );
}