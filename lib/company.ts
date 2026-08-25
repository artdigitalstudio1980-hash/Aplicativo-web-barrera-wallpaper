export interface CompanySettings {
  legalName: string;
  displayName: string;
  tagline: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logo: string;
  defaultTaxRate: number;
  quoteValidityDays: number;
  depositRate: number;
  terms: {
    en: string[];
    es: string[];
  };
}

export const COMPANY: CompanySettings = {
  legalName: 'Barrera Wallpaper',
  displayName: 'Barrera Wallpaper',
  tagline: 'Premium Wall Coverings & Installation — Miami, FL',
  address1: '402 NE 40th St',
  address2: '',
  city: 'Miami',
  state: 'FL',
  zip: '33137',
  country: 'USA',
  phone: '+1 (954) 544-1740',
  email: 'infobarrerawallpaper@gmail.com',
  website: 'https://barrerawallpaper.com',
  taxId: '',
  logo: '/logos/Barrera_logo_black-2.png',
  defaultTaxRate: 7,
  quoteValidityDays: 15,
  depositRate: 0.5,
  terms: {
    en: [
      'This quotation is valid for 15 days from the issue date.',
      'A 50% deposit is required to confirm the project and secure materials.',
      'The remaining balance is due upon completion or delivery of installation.',
      'Material quantities include a 15% waste factor for pattern matching.',
      'Installation pricing includes labor, adhesive and preparation of walls.',
    ],
    es: [
      'Esta cotización tiene una vigencia de 15 días desde su fecha de emisión.',
      'Se requiere un depósito del 50% para confirmar el proyecto y asegurar los materiales.',
      'El saldo restante se paga al completar la instalación o entrega.',
      'Las cantidades de material incluyen un 15% de factor de desperdicio para el empate de patrones.',
      'La instalación incluye mano de obra, adhesivo y preparación de paredes.',
    ],
  },
};

export function getCompany(): CompanySettings {
  const taxFromEnv = parseFloat(process.env.COMPANY_TAX_RATE || '');
  const phoneFromEnv = process.env.COMPANY_PHONE;
  const emailFromEnv = process.env.COMPANY_EMAIL;
  const taxIdFromEnv = process.env.COMPANY_TAX_ID;
  return {
    ...COMPANY,
    defaultTaxRate: Number.isFinite(taxFromEnv) ? taxFromEnv : COMPANY.defaultTaxRate,
    phone: phoneFromEnv || COMPANY.phone,
    email: emailFromEnv || COMPANY.email,
    taxId: taxIdFromEnv || COMPANY.taxId,
  };
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, locale: 'en' | 'es' = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'es' ? 'es-US' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function calcTotals(items: Array<{ quantity: number; unitPrice: number }>, taxRate: number) {
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice || 0), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  return {
    subtotal: round2(subtotal),
    tax: round2(tax),
    total: round2(total),
  };
}

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}