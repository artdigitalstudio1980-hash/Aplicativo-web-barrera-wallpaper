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
import { computeQuoteTotals, buildDefaultItems, QuoteItem } from '@/lib/documents';
import { COMPANY } from '@/lib/company';

export default function NewQuotePage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerFormValues>(EMPTY_CUSTOMER);
  const [items, setItems] = useState<QuoteItem[]>(buildDefaultItems);
  const [taxRate, setTaxRate] = useState(COMPANY.defaultTaxRate);
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [sendEmail, setSendEmail] = useState(true);
  const [installations, setInstallations] = useState<any[]>([]);
  const [installationId, setInstallationId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fromInstallation = sessionStorage.getItem('quote-from-installation');
    if (fromInstallation) {
      sessionStorage.removeItem('quote-from-installation');
      fetch('/api/admin/installations')
        .then((res) => res.json())
        .then((data) => {
          const inst = data.data?.find((i: any) => i.id === fromInstallation);
          if (inst) fillFromInstallation(inst);
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/installations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInstallations(data.data);
      })
      .catch(() => {});
  }, []);

  const totals = computeQuoteTotals(items, taxRate);

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
      const res = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customer,
          items,
          taxRate,
          language,
          sendEmail,
          installationId: installationId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Quote ${data.data.quoteNumber} created`);
        router.push(`/admin/quotes/${data.data.id}`);
      } else {
        toast.error(data.error || 'Failed to create quote');
      }
    } catch (error) {
      toast.error('Failed to create quote');
    } finally {
      setSaving(false);
    }
  };

  const fillFromInstallation = (inst: any) => {
    setCustomer({
      customerName: inst.contactName || '',
      customerEmail: inst.contactEmail || '',
      customerPhone: inst.contactPhone || '',
      address1: inst.address1 || '',
      address2: inst.address2 || '',
      city: inst.city || '',
      state: inst.state || '',
      zip: inst.zip || '',
      country: inst.country || 'US',
    });
    setInstallationId(inst.id);
  };

  return (
    <div className="p-8 max-w-4xl">
      <button
        onClick={() => router.push('/admin/quotes')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to quotes
      </button>
      <h1 className="text-3xl font-bold mb-8">New Quotation</h1>

      <div className="space-y-8">
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Customer</h2>
          <CustomerFields
            values={customer}
            onChange={setCustomer}
            installations={installations}
            onFillFromInstallation={fillFromInstallation}
          />
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
                <Checkbox checked={sendEmail} onCheckedChange={(v) => setSendEmail(!!v)} />
                Send email on save
              </label>
            </div>
          </div>
        </section>

        <section className="bg-gray-900 text-white rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">Quote Total</p>
            <p className="text-3xl font-black">${totals.total.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-1">
              Subtotal ${totals.subtotal.toFixed(2)} — Tax ${totals.tax.toFixed(2)}
            </p>
          </div>
          <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100" onClick={handleCreate} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create Quote
          </Button>
        </section>
      </div>
    </div>
  );
}