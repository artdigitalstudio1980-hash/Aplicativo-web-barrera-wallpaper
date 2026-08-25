'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';
import StatusBadge from '@/components/admin/status-badge';

const STATUSES = ['REQUESTED', 'CONFIRMED', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];

export default function InstallationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [inst, setInst] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('REQUESTED');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [finalCost, setFinalCost] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/installations').then((r) => r.json()),
      fetch(`/api/admin/quotes`).then((r) => r.json()),
    ]).then(([instRes]) => {
      const found = instRes.data?.find((i: any) => i.id === id);
      if (found) {
        setInst(found);
        setStatus(found.status);
        setEstimatedCost(found.estimatedCost ? String(found.estimatedCost) : '');
        setFinalCost(found.finalCost ? String(found.finalCost) : '');
        setScheduledDate(found.scheduledDate ? new Date(found.scheduledDate).toISOString().slice(0, 10) : '');
        setNotes(found.notes || '');
      }
    })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/installations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          estimatedCost: estimatedCost ? Number(estimatedCost) : null,
          finalCost: finalCost ? Number(finalCost) : null,
          scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInst(data.data);
        toast.success('Installation updated');
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const createQuote = () => {
    sessionStorage.setItem('quote-from-installation', id);
    router.push('/admin/quotes/new');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!inst) {
    return <div className="p-8 text-gray-500">Installation not found.</div>;
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/installations')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{inst.contactName}</h1>
              <StatusBadge status={inst.status} />
            </div>
            <p className="text-xs text-gray-500 mt-1">Installation request {inst.id.slice(0, 8)}</p>
          </div>
        </div>
        <Button onClick={createQuote}>
          <FileText className="w-4 h-4 mr-2" /> Create Quote
        </Button>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Request Details</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-gray-400 uppercase">Contact</dt>
              <dd className="mt-1">{inst.contactName}<br />{inst.contactEmail}<br />{inst.contactPhone}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase">Address</dt>
              <dd className="mt-1">{inst.address1}{inst.address2 ? `, ${inst.address2}` : ''}<br />
                {inst.city}, {inst.state} {inst.zip}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase">Wallpaper</dt>
              <dd className="mt-1">{inst.wallpaperType || 'Not specified'}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase">Wall Area</dt>
              <dd className="mt-1">{inst.wallArea || '—'}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs text-gray-400 uppercase">Rooms</dt>
              <dd className="mt-1">
                <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(inst.rooms, null, 2)}
                </pre>
              </dd>
            </div>
            {inst.specialRequests && (
              <div className="md:col-span-2">
                <dt className="text-xs text-gray-400 uppercase">Special Requests</dt>
                <dd className="mt-1">{inst.specialRequests}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-gray-400 uppercase">Preferred Date</dt>
              <dd className="mt-1">
                {inst.preferredDate ? new Date(inst.preferredDate).toLocaleDateString() : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase">Alternative Date</dt>
              <dd className="mt-1">
                {inst.alternativeDate ? new Date(inst.alternativeDate).toLocaleDateString() : '—'}
              </dd>
            </div>
          </dl>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Manage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <select
                className="w-full mt-1 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Scheduled Date</Label>
              <Input
                className="mt-1"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Estimated Cost $</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                step="0.01"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Final Cost $</Label>
              <Input
                className="mt-1"
                type="number"
                min={0}
                step="0.01"
                value={finalCost}
                onChange={(e) => setFinalCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Admin Notes</Label>
              <Textarea
                className="mt-1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Internal notes"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        </section>

        {inst.quotes && inst.quotes.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Linked Quotes</h2>
            <ul className="space-y-2">
              {inst.quotes.map((q: any) => (
                <li key={q.id}>
                  <button
                    className="text-sm font-mono text-gray-900 hover:underline"
                    onClick={() => router.push(`/admin/quotes/${q.id}`)}
                  >
                    {q.quoteNumber} — ${q.total.toFixed(2)} ({q.status})
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}