import Stripe from 'stripe';

// Safe Stripe initialization
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ STRIPE_SECRET_KEY is missing in production!');
    }
    // Return a dummy instance for build time or handle missing key gracefully
    return new Stripe('sk_test_placeholder', {
      apiVersion: '2023-10-16' as any,
      typescript: true,
    });
  }
  return new Stripe(key, {
    apiVersion: '2023-10-16' as any,
    typescript: true,
  });
};

export const stripe = getStripe();

export const formatAmountForStripe = (amount: number, currency: string) => {
  let numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = true;
  for (let part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false;
    }
  }
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
};
