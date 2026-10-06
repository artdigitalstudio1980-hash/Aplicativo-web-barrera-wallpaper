'use client';

import Link from 'next/link';
import { Printer } from 'lucide-react';

export default function PrintToolbar({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <div className="no-print max-w-4xl mx-auto mb-6 flex items-center justify-between">
      <Link href={backHref} className="text-sm text-gray-600 hover:text-black underline">
        ← {backLabel}
      </Link>
      <button
        onClick={() => window.print()}
        className="bg-black text-white text-sm px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 inline-flex items-center gap-2"
      >
        <Printer className="w-4 h-4" /> Print / Save PDF
      </button>
    </div>
  );
}