import Stripe from 'stripe';

// Lazy-initialized Stripe instance — never create with a placeholder key
let _stripe: Stripe | null = null;

export function getStripeInstance(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_placeholder') {
    throw new Error(
      'STRIPE_SECRET_KEY is not configured. Set a valid Stripe secret key in your environment variables.'
    );
  }

  _stripe = new Stripe(key, {
    apiVersion: '2024-06-20' as any,
    typescript: true,
  });

  return _stripe;
}

/**
 * Check if Stripe is properly configured (useful for conditional flows)
 */
export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY;
  return !!key && key !== 'sk_test_placeholder';
}

/**
 * Export for backward compatibility — lazy getter
 * Will throw at RUNTIME if key is missing, not at import time
 */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripeInstance() as any)[prop];
  },
});

export const formatAmountForStripe = (amount: number, currency: string) => {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
};
