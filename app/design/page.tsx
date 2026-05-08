'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from '@/components/locale-context';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Wind, 
  Zap, 
  Layers, 
  ChevronRight,
  Volume2,
  Lock,
  Thermometer,
  Maximize2,
  CheckCircle2
} from 'lucide-react';

export default function DesignPage() {
  const { locale } = useLocale();
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const activeModules = [
    {
      title: locale === 'es' ? "Fireprotect" : "Fireprotect",
      desc: locale === 'es' ? "Seguridad máxima con certificación A2 contra incendios. Ideal para espacios públicos." : "Maximum safety with A2 fire protection rating. Ideal for public spaces.",
      image: "/publicidad/active-fireprotect-overview.png",
      icon: <ShieldCheck className="w-6 h-6" />
    },
    {
      title: locale === 'es' ? "Magnetic" : "Magnetic",
      desc: locale === 'es' ? "Convierta cualquier pared en un espacio de trabajo funcional. Perfecto para oficinas." : "Turn any wall into a functional workspace. Perfect for offices and studios.",
      image: "/publicidad/active-magnetic-whiteboard-overview.png",
      icon: <Zap className="w-6 h-6" />
    },
    {
      title: locale === 'es' ? "Acoustherm" : "Acoustherm",
      desc: locale === 'es' ? "Aislamiento térmico y acústico mejorado para un confort superior." : "Enhanced thermal and acoustic insulation for superior comfort.",
      image: "/publicidad/active-acoustherm-intro.png",
      icon: <Volume2 className="w-6 h-6" />
    }
  ];

  const phantasyModels = [
    { name: "Diamond Dust", img: "/publicidad/phantasy-diamond-dust-lifestyle.png" },
    { name: "Versailles", img: "/publicidad/phantasy-versailles-lifestyle.png" },
    { name: "Orient", img: "/publicidad/phantasy-orient-lifestyle.png" },
    { name: "Stardust", img: "/publicidad/phantasy-stardust-lifestyle.png" }
  ];

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/publicidad/cover-systexx-collection.png"
            alt="SYSTEXX Collection Cover"
            fill
            className="object-cover scale-105"
            priority
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 border border-white/30 rounded-full text-[10px] sm:text-xs tracking-[0.4em] uppercase mb-8 bg-white/10 backdrop-blur-md">
              {locale === 'es' ? 'El Futuro de la Arquitectura' : 'The Future of Architecture'}
            </span>
            <h1 className="text-5xl md:text-8xl font-light tracking-tighter mb-8">
              SYSTEXX <span className="font-bold">TECHNOLOGY</span>
            </h1>
            <p className="text-lg md:text-2xl font-light max-w-3xl mx-auto mb-12 opacity-90 leading-relaxed">
              {locale === 'es' 
                ? 'Descubra la cumbre de los revestimientos de paredes. Tejidos de fibra de vidrio de alto rendimiento diseñados para la durabilidad, seguridad y una estética impresionante.'
                : 'Experience the pinnacle of wall coverings. High-performance glass fiber fabrics engineered for durability, safety, and breathtaking aesthetics.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-8 text-xs tracking-widest font-bold">
                {locale === 'es' ? 'EXPLORAR SYSTEXX' : 'DISCOVER SYSTEXX'}
              </Button>
              <Link href="/catalog">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black rounded-none px-10 py-8 text-xs tracking-widest font-bold">
                  {locale === 'es' ? 'VER CATÁLOGO' : 'VIEW CATALOG'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-light mb-10 leading-tight">
                {locale === 'es' ? 'Ingeniería Alemana' : 'German Engineering'} <br/>
                <span className="font-bold text-gray-400">{locale === 'es' ? 'Rendimiento Superior' : 'Superior Performance'}</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-black text-white flex items-center justify-center rounded-xl">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">{locale === 'es' ? 'Durabilidad y Resistencia' : 'Durability & Strength'}</h4>
                    <p className="text-gray-600 leading-relaxed">{locale === 'es' ? 'El tejido de fibra de vidrio proporciona una resistencia mecánica extrema y capacidad para cubrir grietas.' : 'Glass fiber fabric provides extreme mechanical resistance and crack bridging capability.'}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-black text-white flex items-center justify-center rounded-xl">
                    <Lock className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">{locale === 'es' ? 'Protección Contra Incendios' : 'Fire Protection'}</h4>
                    <p className="text-gray-600 leading-relaxed">{locale === 'es' ? 'Seguridad inigualable con clasificación A2, s1, d0. No inflamable y seguro para cualquier entorno.' : 'Unmatched safety with A2, s1, d0 classification. Non-flammable and safe for any environment.'}</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 bg-black text-white flex items-center justify-center rounded-xl">
                    <Layers className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">{locale === 'es' ? 'Excelencia Ecológica' : 'Ecological Excellence'}</h4>
                    <p className="text-gray-600 leading-relaxed">{locale === 'es' ? 'Certificación OEKO-TEX® y fabricado con recursos naturales. Lujo sostenible.' : 'OEKO-TEX® certified and made from natural resources. Sustainable luxury.'}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square bg-white rounded-[3rem] overflow-hidden shadow-2xl p-12 border border-gray-100"
            >
              <Image 
                src="/publicidad/systexx-properties.png"
                alt="SYSTEXX Properties"
                fill
                className="object-contain p-12"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SYSTEXX ACTIVE Section */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <span className="text-blue-600 font-bold tracking-[0.3em] text-xs uppercase mb-6 block">{locale === 'es' ? 'Maestría Funcional' : 'Functional Mastery'}</span>
            <h2 className="text-4xl md:text-6xl font-bold mb-8">SYSTEXX ACTIVE</h2>
            <p className="text-gray-500 max-w-3xl mx-auto text-lg font-light leading-relaxed">
              {locale === 'es' 
                ? 'Más allá de la estética, los módulos SYSTEXX Active ofrecen soluciones técnicas para desafíos arquitectónicos complejos.'
                : 'Beyond aesthetics, SYSTEXX Active modules offer technical solutions for complex architectural challenges.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {activeModules.map((module, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="group bg-gray-50 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-700 hover:-translate-y-2"
              >
                <div className="relative h-72">
                  <Image 
                    src={module.image}
                    alt={module.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
                <div className="p-10">
                  <div className="mb-6 w-12 h-12 bg-white shadow-sm flex items-center justify-center rounded-lg text-black">
                    {module.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{module.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed font-light">{module.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SYSTEXX PHANTASY Section */}
      <section className="py-32 bg-black text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
           <Image src="/publicidad/phantasy-imagination-page.png" alt="pattern" fill className="object-cover" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
            <div className="max-w-3xl">
              <span className="text-gray-500 font-bold tracking-[0.4em] text-xs uppercase mb-6 block">{locale === 'es' ? 'Colección de Diseñador' : 'Designer Collection'}</span>
              <h2 className="text-5xl md:text-7xl font-light leading-tight">
                SYSTEXX <br/><span className="font-bold">PHANTASY</span>
              </h2>
              <p className="text-gray-400 mt-10 text-xl font-light leading-relaxed">
                {locale === 'es'
                  ? 'Diseños exclusivos tejidos en la tela para declaraciones interiores dramáticas. Una fusión de fuerza arquitectónica y elegancia artística.'
                  : 'Exclusive designs woven into the fabric for dramatic interior statements. A fusion of architectural strength and artistic elegance.'}
              </p>
            </div>
            <Link href="/catalog?collection=phantasy">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black rounded-none px-12 py-8 text-xs tracking-widest font-bold">
                {locale === 'es' ? 'VER COLECCIÓN' : 'VIEW COLLECTION'}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {phantasyModels.map((model, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative aspect-[4/5] overflow-hidden group rounded-2xl"
              >
                <Image 
                  src={model.img}
                  alt={model.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-8">
                  <h4 className="text-2xl font-bold mb-1">{model.name}</h4>
                  <p className="text-xs text-gray-400 tracking-widest uppercase">Premium Finish</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Identity Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[4rem] overflow-hidden relative min-h-[600px] flex items-center shadow-3xl">
            <div className="absolute inset-0 z-0">
              <Image 
                src="/publicidad/active-logo-lifestyle.png"
                alt="Logo Lifestyle"
                fill
                className="object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent"></div>
            </div>
            <div className="relative z-10 p-12 md:p-24 max-w-3xl text-white">
              <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                {locale === 'es' ? 'Identidad Corporativa' : 'Corporate Identity'} <br/>
                <span className="font-light text-gray-400 italic">{locale === 'es' ? 'Tejida en la pared' : 'Woven into the wall'}</span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 font-light leading-relaxed">
                {locale === 'es'
                  ? 'Nuestra tecnología única nos permite tejer su logotipo corporativo directamente en el tejido de fibra de vidrio SYSTEXX. Una marca indeleble de lujo y branding para espacios comerciales de alto nivel.'
                  : 'Our unique technology allows us to weave your corporate logo directly into the SYSTEXX glass fiber fabric. An indelible mark of luxury and branding for high-end commercial spaces.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-none px-10 py-7 text-xs tracking-widest font-bold">
                    {locale === 'es' ? 'SOLICITAR LOGO PERSONALIZADO' : 'REQUEST CUSTOM LOGO'}
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black rounded-none px-10 py-7 text-xs tracking-widest font-bold">
                    {locale === 'es' ? 'VER EJEMPLOS' : 'VIEW EXAMPLES'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 bg-gray-50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-7xl font-light mb-12 italic text-gray-800 leading-tight">
              {locale === 'es' 
                ? '"La pared ya no es un límite, es una declaración."'
                : '"The wall is no longer a limit, it\'s a statement."'}
            </h2>
            <p className="text-2xl text-gray-500 mb-16 font-light max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Eleve su próximo proyecto con Oscar Barrera y la tecnología de papel tapiz más avanzada del mundo.'
                : 'Elevate your next project with Oscar Barrera and the world\'s most advanced wallpaper technology.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800 rounded-none px-16 py-9 h-auto text-sm tracking-[0.2em] font-bold shadow-2xl">
                  {locale === 'es' ? 'RESERVAR CONSULTA' : 'BOOK A CONSULTATION'}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Subtle background elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-50"></div>
      </section>
    </div>
  );
}
