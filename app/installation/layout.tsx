import type { Metadata } from 'next';
import { InstallationServiceSchema } from '@/components/schemas/service-schema';
import { FAQSchema } from '@/components/schemas/faq-schema';

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

const faqQuestions = [
  {
    question: 'How long does wallpaper installation take?',
    answer: 'For a standard room, residential installation typically takes 1-3 days depending on room size and complexity. Commercial projects vary - we provide a timeline during the free consultation.',
  },
  {
    question: 'Do you prepare walls before installation?',
    answer: 'Yes, surface measurement and preparation are included in our service. We ensure walls are clean, smooth, and properly primed for the best results.',
  },
  {
    question: 'What warranty do you offer on installation?',
    answer: 'We offer a 2-year workmanship warranty on all our installations, covering any installation-related issues.',
  },
  {
    question: 'Do you offer after-hours commercial installation?',
    answer: 'Yes, we offer after-hours and weekend installation for commercial clients to minimize disruption to business operations.',
  },
  {
    question: 'What areas do you serve for installation?',
    answer: 'Our main coverage is Miami, Florida, and the entire metropolitan area. We also serve select locations across the United States.',
  },
];

export default function InstallationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <InstallationServiceSchema />
      <FAQSchema questions={faqQuestions} />
      {children}
    </>
  );
}
