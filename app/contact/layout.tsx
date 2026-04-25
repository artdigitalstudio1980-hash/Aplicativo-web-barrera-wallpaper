import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Barrera Wallpaper. Request a quote, schedule a consultation, or ask about our premium wallpaper and installation services.',
  keywords: 'contact Barrera Wallpaper, wallpaper quote, schedule consultation, wallpaper inquiry Miami',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Barrera Wallpaper',
    description: 'Get in touch to request a quote, schedule a consultation, or ask about our services.',
    type: 'website',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
