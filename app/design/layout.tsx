import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SYSTEXX Technology - German Engineered Glass Fiber Wall Coverings',
  description: 'Discover SYSTEXX technology by Barrera Wallpaper. German-engineered glass fiber textiles with A2 fire protection, magnetic surfaces, acoustic comfort, and extreme durability for commercial and residential spaces.',
  keywords: 'SYSTEXX, glass fiber wallcovering, German engineered wallpaper, fireproof wallpaper, magnetic wall, acoustic wallpaper, commercial wall covering',
  alternates: { canonical: '/design' },
  openGraph: {
    title: 'SYSTEXX Technology - Advanced Wall Coverings | Barrera Wallpaper',
    description: 'German-engineered glass fiber textiles. A2 fire rated, magnetic, acoustic, and ultra-durable wall covering solutions.',
    type: 'website',
    images: [{ url: '/publicidad/active-fireprotect-overview.png', width: 1200, height: 630, alt: 'SYSTEXX Technology Wall Coverings' }],
  },
};

export default function DesignLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
