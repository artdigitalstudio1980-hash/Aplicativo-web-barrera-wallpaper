'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import ItemsEditor from '@/components/admin/items-editor';
import CustomerFields, { EMPTY_CUSTOMER, CustomerFormValues } from '@/components/admin/customer-fields';
import { computeInvoiceTotals, buildDefaultItems, QuoteItem } from '@/lib/documents';
import { COMPANY } from '@/lib/company';

export default function NewInvoicePage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerFormValues>(EMPTY_CUSTOMER);
  const [items, setItems] = useState<QuoteItem[]>(buildDefaultItems);
  const [taxRate, setTaxRate] = useState(COMPANY.defaultTaxRate);
  const [depositRequired, setDepositRequired] = useState(true);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [sendEmail, setSendEmail] = useState(true);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState('');
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/quotes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const convertible = data.data.filter(
            (q: any) => q.status !== 'DRAFT' && !q.invoice,
          );
          setQuotes(convertible);
        }
      })
      .catch(() => {});
  }, []);

  const loadQuote = async (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    if (!quoteId) return;
    setLoadingQuote(true);
    try {
      const res = await fetch(`/api/admin/quotes/${quoteId}`);
      const data = await res.json();
      if (data.success) {
        const q = data.data;
        setCustomer({
          customerName: q.customerName || '',
          customerEmail: q.customerEmail || '',
          customerPhone: q.customerPhone || '',
          address1: q.address1 || '',
          address2: q.address2 || '',
          city: q.city || '',
          state: q.state || '',
          zip: q.zip || '',
          country: q.country || 'US',
        });
        setItems(Array.isArray(q.items) ? q.items : []);
        setTaxRate(q.taxRate ?? COMPANY.defaultTaxRate);
        setLanguage(q.language === 'en' ? 'en' : 'es');
      }
    } catch (error) {
      toast.error('Failed to load quote');
    } finally {
      setLoadingQuote(false);
    }
  };

  const totals = computeInvoiceTotals(items, taxRate, depositRequired, []);

  const handleCreate = async () => {
    if (!customer.customerName || !customer.customerEmail) {
      toast.error('Customer name and email are required');
      return;
    }
    if (items.length === 0 || items.every((i) => !i.description)) {
      toast.error('Add at least one item with a description');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: selectedQuoteId || null,
          customerName: customer.customerName,
          customerEmail: customer.customerEmail,
          customerPhone: customer.customerPhone,
          address1: customer.address1,
          address2: customer.address2,
          city: customer.city,
          state: customer.state,
          zip: customer.zip,
          country: customer.country,
          items,
          taxRate,
          depositRequired,
          language,
          sendEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Invoice ${data.data.invoiceNumber} created`);
        router.push(`/admin/invoices/${data.data.id}`);
      } else {
        toast.error(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      toast.error('Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <button
        onClick={() => router.push('/admin/invoices')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to invoices
      </button>
      <h1 className="text-3xl font-bold mb-8">New Invoice</h1>

      <div className="space-y-8">
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
            From approved quote (optional)
          </h2>
          <select
            className="w-full h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
            value={selectedQuoteId}
            onChange={(e) => loadQuote(e.target.value)}
            disabled={loadingQuote}
          >
            <option value="">— Blank invoice —</option>
            {quotes.map((q: any) => (
              <option key={q.id} value={q.id}>
                {q.quoteNumber} — {q.customerName} (${q.total.toFixed(2)})
              </option>
            ))}
          </select>
          {selectedQuoteId && (
            <p className="text-xs text-gray-500 mt-2">
              Customer, items and tax will copy from the quote. The quote becomes CONVERTED.
            </p>
          )}
        </section>

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
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={depositRequired} onCheckedChange={(v) => setDepositRequired(!!v)} />
                50% deposit on invoice
              </label>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={sendEmail} onCheckedChange={(v) => setSendEmail(!!v)} />
                Send email on save
              </label>
            </div>
          </div>
        </section>

        <section className="bg-gray-900 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Invoice Total</p>
              <p className="text-3xl font-black">${totals.total.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">
                Subtotal ${totals.subtotal.toFixed(2)} — Tax ${totals.tax.toFixed(2)}
                {depositRequired && <span> — Deposit ${totals.depositAmount.toFixed(2)}</span>}
              </p>
            </div>
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Invoice
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}