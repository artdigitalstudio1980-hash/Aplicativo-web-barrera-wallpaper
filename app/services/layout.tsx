import type { Metadata } from 'next';
import { DesignServiceSchema } from '@/components/schemas/service-schema';
import { FAQSchema } from '@/components/schemas/faq-schema';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore Barrera Wallpaper professional services: residential & commercial installation, AI-powered design, custom wallpaper creation, and expert consultation in Miami, FL.',
  keywords: 'wallpaper services, interior design services, wallpaper installation, custom wallpaper design, AI wallpaper design, Miami wallpaper',
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'Wallpaper Services - Barrera Wallpaper',
    description: 'Professional wallpaper services: installation, AI-powered design, custom creation, and expert consultation in Miami.',
    type: 'website',
  },
};

const faqQuestions = [
  {
    question: 'What types of wallpaper installation do you offer?',
    answer: 'We offer both residential and commercial wallpaper installation services. Residential includes homes and apartments with surface preparation and cleanup. Commercial covers offices, hotels, restaurants, and retail spaces with project planning and safety certifications.',
  },
  {
    question: 'How much does wallpaper installation cost in Miami?',
    answer: 'Costs vary based on project scope, square footage, wallpaper type, and surface preparation needed. We provide free consultations and custom quotes. Contact us for a personalized estimate.',
  },
  {
    question: 'Do you offer custom wallpaper design services?',
    answer: 'Yes! We offer AI-powered wallpaper generation where you describe your vision, custom design consultation with Oscar Barrera, and the ability to upload your own design for premium printing on multiple materials.',
  },
  {
    question: 'What is the SYSTEXX technology?',
    answer: 'SYSTEXX is German-engineered glass fiber textile technology that offers extreme durability, fire protection (A2 rating), and a flawless architectural finish. It is ideal for high-traffic commercial and residential spaces.',
  },
  {
    question: 'Do you serve areas outside Miami?',
    answer: 'Yes, we serve the entire Miami metropolitan area and offer nationwide shipping for wallpaper products. Installation services are available throughout Florida and select US locations.',
  },
];

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesignServiceSchema />
      <FAQSchema questions={faqQuestions} />
      {children}
    </>
  );
}
