'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from '@/components/locale-context';
import { Button } from '@/components/ui/button';
import { 
  Home,
  Building,
  CheckCircle,
  Shield,
  MapPin,
  Phone,
  Award,
  Ruler,
  Clock,
  ArrowRight,
  Droplets,
  Zap,
  Hammer
} from 'lucide-react';

const getServices = (t: any) => [
  {
    title: 'RESIDENTIAL',
    subtitle: 'High-End Interiors',
    description: 'Bespoke wallpaper installation for Miami\'s most exclusive residences. We specialize in delicate materials and complex architectural layouts.',
    icon: Home,
    image: '/publicidad/review-Captura-desde-2026-03-13-16-36-53.png',
    features: [
      'Certified Master Installers',
      'Surface Perfection Guarantee',
      'Dust-Free Workspace Strategy',
      '2-Year Premium Warranty'
    ]
  },
  {
    title: 'COMMERCIAL',
    subtitle: 'Architectural Scale',
    description: 'Industrial-strength wall solutions for luxury hotels, auto showrooms, and corporate headquarters using SYSTEXX high-performance technology.',
    icon: Building,
    image: '/publicidad/active-category-overview.png',
    features: [
      'High-Traffic Durability',
      'After-Hours Integration',
      'Safety & Fire Certifications',
      'Project Planning & Management'
    ]
  }
];

export default function ServicesPage() {
  const { t } = useLocale();
  const services = getServices(t);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-black selection:text-white">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-3 py-1 border border-black/10 rounded-full text-[10px] tracking-[0.2em] uppercase mb-6 bg-white/50 backdrop-blur-sm font-bold">
              White-Glove Service
            </span>
            <h1 className="text-5xl md:text-8xl font-light tracking-tighter mb-8 leading-none">
              Professional <br />
              <span className="font-bold italic">Installation</span>
            </h1>
            <p className="text-xl text-gray-500 font-light leading-relaxed mb-10">
              Beyond product sales, we provide the architectural execution required for high-performance materials. Our team is trained in German installation standards for SYSTEXX glass textiles.
            </p>
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase">Certified Master <br /> Installers</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase">Lifetime Finish <br /> Support</div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-200/50 to-transparent pointer-events-none hidden lg:block"></div>
      </section>

      {/* --- MAIN SERVICES (POSTER STYLE) --- */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
        {services.map((service, idx) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-[3rem] overflow-hidden border border-gray-100 shadow-3xl bg-white ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
          >
            <div className={`lg:col-span-7 relative h-[400px] lg:h-[600px] ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
              <Image 
                src={service.image} 
                alt={service.title} 
                fill 
                className="object-cover" 
                unoptimized 
              />
              <div className="absolute inset-0 bg-black/10"></div>
            </div>
            <div className={`lg:col-span-5 p-12 lg:p-20 flex flex-col justify-center ${idx % 2 === 1 ? 'lg:order-1' : ''}`}>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Division 0{idx + 1}</span>
              <h2 className="text-5xl md:text-6xl font-light tracking-tighter mb-4 leading-none">
                {service.title} <br />
                <span className="font-bold italic text-blue-600">{service.subtitle}</span>
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-10">
                {service.description}
              </p>
              
              <div className="space-y-4 mb-12">
                {service.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-black" />
                    <span className="text-sm font-bold tracking-tight text-gray-800">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/contact">
                <Button className="h-16 px-10 rounded-none bg-black text-white hover:bg-gray-800 font-bold uppercase text-[10px] tracking-[0.3em] gap-3 shadow-xl">
                  REQUEST QUOTE <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </section>

      {/* --- TECHNICAL SPECS SECTION --- */}
      <section className="py-24 bg-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">Precision Standards</span>
              <h2 className="text-5xl md:text-7xl font-light tracking-tighter mb-8 leading-tight">
                Engineering <br />
                <span className="font-bold italic">The Perfect Wall</span>
              </h2>
              <p className="text-gray-400 text-lg font-light leading-relaxed mb-12 max-w-xl">
                Installation of high-performance glass textiles requires specific adhesive chemistry and seam management. We follow Vitrulan's technical protocols to ensure lifetime adhesion and fire-safety integrity.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-sm font-bold tracking-widest uppercase">Quick Bond</h4>
                  <p className="text-xs text-gray-500 font-light">Rapid execution with zero structural compromise.</p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-sm font-bold tracking-widest uppercase">Hydro-Shield</h4>
                  <p className="text-xs text-gray-500 font-light">Anti-microbial and moisture resistant finish.</p>
                </div>
              </div>
            </div>

            <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-[3rem] overflow-hidden border border-white/10 group">
              <Image 
                src="/publicidad/cover-systexx-collection.png" 
                alt="Technical Installation" 
                fill 
                className="object-cover brightness-50 group-hover:scale-105 transition-transform duration-[10s]"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="p-10 bg-white/5 backdrop-blur-md border border-white/20 rounded-[2rem] text-center max-w-xs">
                    <Hammer className="w-10 h-10 text-white mx-auto mb-4" />
                    <p className="text-xs font-bold tracking-widest uppercase mb-2">Service Area</p>
                    <p className="text-2xl font-black tracking-tighter italic">MIAMI METRO</p>
                    <div className="h-[1px] w-12 bg-blue-500 mx-auto my-4"></div>
                    <p className="text-[10px] text-gray-400 leading-relaxed uppercase">Commercial and luxury residential projects throughout Florida.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-32 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter mb-8 leading-tight">
            Ready to <span className="font-bold italic">Transform</span> Your Architecture?
          </h2>
          <p className="text-gray-500 text-lg font-light mb-12">
            Schedule a site visit with our master installation team for a technical assessment and precision measurement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="h-16 px-12 rounded-none bg-black text-white hover:bg-gray-800 font-bold uppercase text-[10px] tracking-[0.3em] shadow-xl">
                BOOK CONSULTATION
              </Button>
            </Link>
            <a href="tel:+19545441740">
              <Button size="lg" variant="outline" className="h-16 px-12 rounded-none border-black text-black hover:bg-black hover:text-white font-bold uppercase text-[10px] tracking-[0.3em] transition-all">
                DIRECT CALL
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
