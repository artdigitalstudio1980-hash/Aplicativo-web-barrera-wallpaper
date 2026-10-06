'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send, Printer, PlusCircle } from 'lucide-react';
import ItemsEditor from '@/components/admin/items-editor';
import CustomerFields, { EMPTY_CUSTOMER, CustomerFormValues } from '@/components/admin/customer-fields';
import StatusBadge from '@/components/admin/status-badge';
import { computeInvoiceTotals, QuoteItem, PAYMENT_METHODS } from '@/lib/documents';

const currency = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<CustomerFormValues>(EMPTY_CUSTOMER);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [taxRate, setTaxRate] = useState(7);
  const [depositRequired, setDepositRequired] = useState(true);
  const [dueDate, setDueDate] = useState('');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ZELLE');
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/admin/invoices/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInvoice(data.data);
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
          setDepositRequired(data.data.depositRequired ?? true);
          setDueDate(data.data.dueDate ? new Date(data.data.dueDate).toISOString().slice(0, 10) : '');
          setLanguage(data.data.language === 'en' ? 'en' : 'es');
          setPayments(Array.isArray(data.data.payments) ? data.data.payments : []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const totals = computeInvoiceTotals(items, taxRate, depositRequired, payments);

  const save = async (extra: any = {}) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customer,
          items,
          taxRate,
          depositRequired,
          dueDate: dueDate ? new Date(dueDate) : null,
          language,
          ...extra,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoice(data.data);
        toast.success('Invoice updated');
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
      const res = await fetch(`/api/admin/invoices/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setInvoice(data.data);
        if (body.action === 'add-payment') {
          setPayments(Array.isArray(data.data.payments) ? data.data.payments : []);
          setPaymentAmount('');
        }
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

  const addPayment = () => {
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }
    const balance = invoice ? invoice.total - invoice.amountPaid : 0;
    if (amount > balance + 0.005) {
      toast.error(`Amount exceeds balance (${currency(balance)})`);
      return;
    }
    action({ action: 'add-payment', amount, method: paymentMethod }, 'Payment recorded');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!invoice) {
    return <div className="p-8 text-gray-500">Invoice not found.</div>;
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/invoices')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">{invoice.invoiceNumber}</h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Created {new Date(invoice.createdAt).toLocaleString()}
              {invoice.quote ? ` — from quote ${invoice.quote.quoteNumber}` : ''}
              {invoice.order ? ` — order ${invoice.order.orderNumber}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(`/print/invoice/${invoice.id}`, '_blank')}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => action({ action: 'send' }, 'Invoice sent by email')} disabled={saving}>
            <Send className="w-4 h-4 mr-2" /> Send Email
          </Button>
        </div>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label>Due Date</Label>
              <Input
                className="mt-1"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
                50% deposit
              </label>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Payments</h2>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-400 mb-4">No payments recorded yet.</p>
          ) : (
            <div className="space-y-2 mb-6">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 text-sm"
                >
                  <div>
                    <span className="font-medium">{currency(p.amount)}</span>
                    <span className="text-xs text-gray-500 ml-2 uppercase">{p.method}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(p.date).toLocaleString()}
                    {p.note ? ` — ${p.note}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <Label>Amount $</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={String(Math.max(0, invoice.total - invoice.amountPaid).toFixed(2))}
              />
            </div>
            <div>
              <Label>Method</Label>
              <select
                className="w-full mt-1 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Note</Label>
              <Input
                className="mt-1"
                placeholder="e.g. Deposit via Zelle"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addPayment();
                }}
                id="payment-note"
              />
            </div>
            <Button onClick={addPayment} disabled={saving}>
              <PlusCircle className="w-4 h-4 mr-2" /> Record Payment
            </Button>
          </div>
        </section>

        <section className="bg-gray-900 text-white rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Total</p>
              <p className="text-2xl font-black">{currency(invoice.total)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Deposit (50%)</p>
              <p className="text-2xl font-black">{currency(invoice.depositAmount)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Paid</p>
              <p className="text-2xl font-black text-green-400">{currency(invoice.amountPaid)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Balance</p>
              <p className="text-2xl font-black">{currency(invoice.total - invoice.amountPaid)}</p>
            </div>
          </div>
          <div className="flex justify-end mt-6 border-t border-gray-700 pt-4">
            <Button className="bg-white text-gray-900 hover:bg-gray-100" onClick={() => save()} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}