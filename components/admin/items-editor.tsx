'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';
import type { QuoteItem } from '@/lib/documents';

interface Props {
  items: QuoteItem[];
  onChange: (items: QuoteItem[]) => void;
}

export default function ItemsEditor({ items, onChange }: Props) {
  const update = (index: number, field: keyof QuoteItem, value: string | number) => {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    onChange(next);
  };

  const add = () => {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        description: '',
        details: '',
        quantity: 1,
        unit: 'roll',
        unitPrice: 0,
      },
    ]);
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Item {index + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => remove(index)}
              disabled={items.length <= 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              placeholder="Description (e.g. SYSTEXX Wallpaper Roll)"
              value={item.description}
              onChange={(e) => update(index, 'description', e.target.value)}
              className="col-span-2 md:col-span-1"
            />
            <Input
              placeholder="Details / notes (optional)"
              value={item.details || ''}
              onChange={(e) => update(index, 'details', e.target.value)}
              className="col-span-2 md:col-span-1"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">Qty</label>
              <Input
                type="number"
                min={0}
                value={item.quantity}
                onChange={(e) => update(index, 'quantity', Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Unit</label>
              <Input value={item.unit} onChange={(e) => update(index, 'unit', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium">Unit Price $</label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={item.unitPrice}
                onChange={(e) => update(index, 'unitPrice', Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="w-4 h-4 mr-2" /> Add Item
      </Button>
    </div>
  );
}