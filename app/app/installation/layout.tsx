import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Installation Services',
  description: 'Professional wallpaper installation services for residential and commercial spaces. Certified installers, on-site service in Miami & USA. Schedule your installation today.',
  keywords: 'wallpaper installation service, professional installation, wallpaper installer Miami, residential installation, commercial installation',
  alternates: { canonical: '/installation' },
  openGraph: {
    title: 'Wallpaper Installation Services - Barrera Wallpaper',
    description: 'Professional wallpaper installation for residential & commercial spaces. Certified installers across Miami & USA.',
    type: 'website',
  },
};

export default function InstallationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
