import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wallpaper Calculator',
  description: 'Calculate how much wallpaper you need for your project. Free wallpaper estimator tool - enter your wall dimensions and get exact rolls needed for your installation.',
  keywords: 'wallpaper calculator, wallpaper estimator, how much wallpaper do I need, wallpaper measurement tool',
  robots: { index: true, follow: true },
  alternates: { canonical: '/calculator' },
  openGraph: {
    title: 'Wallpaper Calculator - Barrera Wallpaper',
    description: 'Free wallpaper calculator. Enter your wall dimensions and get the exact number of rolls needed.',
    type: 'website',
  },
};

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
