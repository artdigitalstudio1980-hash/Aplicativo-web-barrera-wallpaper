import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore Barrera Wallpaper professional services: residential & commercial installation, AI-powered design, custom wallpaper creation, and expert consultation.',
  keywords: 'wallpaper services, interior design services, wallpaper installation, custom wallpaper design, AI wallpaper design',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Wallpaper Services - Barrera Wallpaper',
    description: 'Professional wallpaper services: installation, AI-powered design, custom creation, and expert consultation.',
    type: 'website',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
