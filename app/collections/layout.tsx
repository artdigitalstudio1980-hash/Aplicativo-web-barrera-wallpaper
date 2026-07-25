import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wallpaper Collections',
  description: 'Browse our wallpaper collections: SYSTEXX Pure high-performance minimalism, SYSTEXX Phantasy designer patterns, and SYSTEXX Active functional wall coverings.',
  keywords: 'wallpaper collections, SYSTEXX Pure, SYSTEXX Phantasy, SYSTEXX Active, luxury wallpaper collections',
  alternates: { canonical: '/collections' },
  openGraph: {
    title: 'Wallpaper Collections - Barrera Wallpaper',
    description: 'Explore our curated wallpaper collections: Pure, Phantasy, and Active.',
    type: 'website',
  },
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
