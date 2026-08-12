'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CustomerFormValues {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export const EMPTY_CUSTOMER: CustomerFormValues = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
};

interface Props {
  values: CustomerFormValues;
  onChange: (values: CustomerFormValues) => void;
  onFillFromInstallation?: (installation: any) => void;
  installations?: any[];
}

export default function CustomerFields({ values, onChange, onFillFromInstallation, installations }: Props) {
  const set = (field: keyof CustomerFormValues, value: string) => {
    onChange({ ...values, [field]: value });
  };

  return (
    <div className="space-y-4">
      {onFillFromInstallation && installations && installations.length > 0 && (
        <div>
          <Label>Link to installation request (auto-fills)</Label>
          <select
            className="w-full mt-1 h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
            onChange={(e) => {
              const inst = installations.find((i: any) => i.id === e.target.value);
              if (inst) {
                onFillFromInstallation(inst);
              }
            }}
            defaultValue=""
          >
            <option value="">— Select installation —</option>
            {installations.map((inst: any) => (
              <option key={inst.id} value={inst.id}>
                {inst.contactName} — {inst.address1}, {inst.city} ({inst.status})
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Customer Name *</Label>
          <Input
            className="mt-1"
            value={values.customerName}
            onChange={(e) => set('customerName', e.target.value)}
            placeholder="Full name"
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input
            className="mt-1"
            type="email"
            value={values.customerEmail}
            onChange={(e) => set('customerEmail', e.target.value)}
            placeholder="customer@email.com"
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            className="mt-1"
            value={values.customerPhone}
            onChange={(e) => set('customerPhone', e.target.value)}
            placeholder="(305) 555-1234"
          />
        </div>
        <div>
          <Label>Country</Label>
          <Input
            className="mt-1"
            value={values.country}
            onChange={(e) => set('country', e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Address 1</Label>
          <Input
            className="mt-1"
            value={values.address1}
            onChange={(e) => set('address1', e.target.value)}
            placeholder="Street address"
          />
        </div>
        <div className="md:col-span-2">
          <Label>Address 2</Label>
          <Input
            className="mt-1"
            value={values.address2}
            onChange={(e) => set('address2', e.target.value)}
            placeholder="Apt, suite, floor (optional)"
          />
        </div>
        <div>
          <Label>City</Label>
          <Input className="mt-1" value={values.city} onChange={(e) => set('city', e.target.value)} />
        </div>
        <div>
          <Label>State</Label>
          <Input className="mt-1" value={values.state} onChange={(e) => set('state', e.target.value)} placeholder="FL" />
        </div>
        <div>
          <Label>ZIP</Label>
          <Input className="mt-1" value={values.zip} onChange={(e) => set('zip', e.target.value)} />
        </div>
      </div>
    </div>
  );
}