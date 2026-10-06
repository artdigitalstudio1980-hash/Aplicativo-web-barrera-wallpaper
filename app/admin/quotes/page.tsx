'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Loader2, ExternalLink } from 'lucide-react';
import StatusBadge from '@/components/admin/status-badge';

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/quotes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setQuotes(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {quotes.length} total — generated from installations, estimator or manually
          </p>
        </div>
        <Button onClick={() => router.push('/admin/quotes/new')}>
          <Plus className="w-4 h-4 mr-2" /> New Quote
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No quotes yet. Create your first one.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Number</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Valid Until</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium">{quote.quoteNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{quote.customerName}</div>
                    <div className="text-xs text-gray-500">{quote.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold">${quote.total.toFixed(2)}</td>
                  <td className="px-6 py-4"><StatusBadge status={quote.status} /></td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/print/quote/${quote.id}`}
                      target="_blank"
                      className="inline-flex items-center text-xs text-gray-500 hover:text-gray-900 mr-3"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> Print
                    </Link>
                    <Link
                      href={`/admin/quotes/${quote.id}`}
                      className="inline-flex items-center text-xs font-medium text-gray-900 hover:underline"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}