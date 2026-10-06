'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Wrench, Loader2, FileText } from 'lucide-react';
import StatusBadge from '@/components/admin/status-badge';

export default function AdminInstallationsPage() {
  const [installations, setInstallations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const load = () => {
    fetch('/api/admin/installations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInstallations(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Installations</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {installations.length} requests — from checkout and the estimator
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : installations.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-xl">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No installation requests yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">Wall Area</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Quotes</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {installations.map((inst) => (
                <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium">{inst.contactName}</div>
                    <div className="text-xs text-gray-500">{inst.contactEmail}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {inst.address1}, {inst.city} {inst.zip}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{inst.wallArea || '—'}</td>
                  <td className="px-6 py-4"><StatusBadge status={inst.status} /></td>
                  <td className="px-6 py-4">
                    {inst.quotes && inst.quotes.length > 0 ? (
                      <div className="space-y-1">
                        {inst.quotes.map((q: any) => (
                          <Link
                            key={q.id}
                            href={`/admin/quotes/${q.id}`}
                            className="inline-flex items-center gap-1 text-xs text-gray-700 hover:underline"
                          >
                            <FileText className="w-3 h-3" /> {q.quoteNumber}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(inst.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/installations/${inst.id}`}
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
      <div className="mt-6">
        <Button variant="outline" size="sm" onClick={load}>
          Refresh
        </Button>
      </div>
    </div>
  );
}