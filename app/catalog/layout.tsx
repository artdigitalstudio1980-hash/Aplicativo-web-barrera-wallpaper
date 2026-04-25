import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wallpaper Catalog',
  description: 'Browse our premium wallpaper collection. Hundreds of designs in vinyl, fabric, grasscloth, and AI-custom styles. Shop wallpaper online with worldwide shipping.',
  keywords: 'wallpaper catalog, premium wallpaper, buy wallpaper online, vinyl wallpaper, fabric wallpaper, custom wallpaper designs',
  alternates: { canonical: '/catalog' },
  openGraph: {
    title: 'Wallpaper Catalog - Barrera Wallpaper',
    description: 'Browse our premium wallpaper collection. Hundreds of designs in vinyl, fabric, grasscloth, and AI-custom styles.',
    type: 'website',
  },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
