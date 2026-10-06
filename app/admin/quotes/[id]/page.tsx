'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Loader2,
  ArrowLeft,
  Send,
  Printer,
  Receipt,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import ItemsEditor from '@/components/admin/items-editor';
import CustomerFields, { EMPTY_CUSTOMER, CustomerFormValues } from '@/components/admin/customer-fields';
import StatusBadge from '@/components/admin/status-badge';
import { computeQuoteTotals, QuoteItem } from '@/lib/documents';

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<CustomerFormValues>(EMPTY_CUSTOMER);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [taxRate, setTaxRate] = useState(7);
  const [validUntil, setValidUntil] = useState('');
  const [language, setLanguage] = useState<'es' | 'en'>('es');

  useEffect(() => {
    fetch(`/api/admin/quotes/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuote(data.data);
          setCustomer({
            customerName: data.data.customerName || '',
            customerEmail: data.data.customerEmail || '',
            customerPhone: data.data.customerPhone || '',
            address1: data.data.address1 || '',
            address2: data.data.address2 || '',
            city: data.data.city || '',
            state: data.data.state || '',
            zip: data.data.zip || '',
            country: data.data.country || 'US',
          });
          setItems(Array.isArray(data.data.items) ? data.data.items : []);
          setTaxRate(data.data.taxRate ?? 7);
          setValidUntil(data.data.validUntil ? new Date(data.data.validUntil).toISOString().slice(0, 10) : '');
          setLanguage(data.data.language === 'en' ? 'en' : 'es');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const totals = computeQuoteTotals(items, taxRate);

  const save = async (extra: any = {}) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customer,
          items,
          taxRate,
          validUntil: validUntil ? new Date(validUntil) : null,
          language,
          ...extra,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuote(data.data);
        toast.success('Quote updated');
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const action = async (body: any, successMsg: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setQuote(data.data);
        toast.success(successMsg);
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setSaving(false);
    }
  };

  const convertToInvoice = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: id, sendEmail: true }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Invoice ${data.data.invoiceNumber} created`);
        router.push(`/admin/invoices/${data.data.id}`);
      } else {
        toast.error(data.error || 'Failed to create invoice');
        if (data.data) {
          setQuote((q: any) => ({ ...q, invoice: data.data }));
        }
      }
    } catch (error) {
      toast.error('Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!quote) {
    return <div className="p-8 text-gray-500">Quote not found.</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/quotes')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">{quote.quoteNumber}</h1>
              <StatusBadge status={quote.status} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Created {new Date(quote.createdAt).toLocaleString()} —{' '}
              {quote.installation ? `linked to installation ${quote.installation.id.slice(0, 8)}` : 'standalone'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/print/quote/${quote.id}`, '_blank')}
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          {!quote.invoice && (
            <Button size="sm" onClick={convertToInvoice} disabled={saving}>
              <Receipt className="w-4 h-4 mr-2" /> Create Invoice
            </Button>
          )}
        </div>
      </div>

      {quote.invoice && (
        <div className="mb-6 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-xl p-4">
          <p className="text-sm text-purple-700">
            Converted to invoice{' '}
            <span className="font-mono font-semibold">{quote.invoice.invoiceNumber}</span> (
            <span className="font-medium">{quote.invoice.status}</span>)
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/invoices/${quote.invoice.id}`)}
          >
            Open invoice →
          </Button>
        </div>
      )}

      <div className="space-y-8">
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Customer</h2>
          <CustomerFields values={customer} onChange={setCustomer} />
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Items</h2>
          <ItemsEditor items={items} onChange={setItems} />
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tax Rate (%)</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input
                className="mt-1"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
            <div>
              <Label>Language</Label>
              <select
                className="w-full mt-1 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </section>

        <section className="bg-gray-900 text-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Total</p>
              <p className="text-3xl font-black">{currency(totals.total)}</p>
              <p className="text-xs text-gray-400 mt-1">
                Subtotal {currency(totals.subtotal)} — Tax {currency(totals.tax)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button className="bg-white text-gray-900 hover:bg-gray-100" onClick={() => save()} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-gray-700 pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-800"
              onClick={() => action({ action: 'send' }, 'Quote sent by email')}
              disabled={saving}
            >
              <Send className="w-4 h-4 mr-2" /> Send Email
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-green-400 hover:bg-gray-800"
              onClick={() => save({ status: 'APPROVED' })}
              disabled={saving}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Approved
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:bg-gray-800"
              onClick={() => save({ status: 'REJECTED' })}
              disabled={saving}
            >
              <XCircle className="w-4 h-4 mr-2" /> Mark Rejected
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}