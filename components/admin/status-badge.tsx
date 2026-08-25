'use client';

import { Badge } from '@/components/ui/badge';

const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
  SENT: 'bg-blue-50 text-blue-700 border-blue-200',
  APPROVED: 'bg-green-50 text-green-700 border-green-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  EXPIRED: 'bg-amber-50 text-amber-700 border-amber-200',
  CONVERTED: 'bg-purple-50 text-purple-700 border-purple-200',
  PARTIAL: 'bg-orange-50 text-orange-700 border-orange-200',
  PAID: 'bg-green-50 text-green-700 border-green-200',
  OVERDUE: 'bg-red-50 text-red-700 border-red-200',
  VOID: 'bg-gray-100 text-gray-400 border-gray-200',
  REQUESTED: 'bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMED: 'bg-green-50 text-green-700 border-green-200',
  COMPLETED: 'bg-gray-900 text-white border-gray-900',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <Badge variant="outline" className={style}>
      {status}
    </Badge>
  );
}