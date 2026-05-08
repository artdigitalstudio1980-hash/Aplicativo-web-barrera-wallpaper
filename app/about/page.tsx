'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLocale } from '@/components/locale-context';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart,
  Target,
  Lightbulb,
  Sparkles,
  Camera,
  CheckCircle2,
  Award,
  Users,
  Ruler,
  Palette,
  ShieldCheck,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  const { t } = useLocale();
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [philosophyRef, philosophyInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      
      {/* --- LUXURY HERO SECTION --- */}
      <section 
        ref={heroRef}
        className="relative h-[90vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about/about-hero.png"
            alt="Luxury Interior Wallcoverings"
            fill
            className="object-cover brightness-[0.4]"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={heroInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative z-10 text-center px-4"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-8 py-3 text-white text-[10px] font-bold tracking-[0.4em] uppercase mb-12"
          >
            <Sparkles className="w-4 h-4 text-blue-400" />
            BARRERA WALLPAPER • MIAMI
          </motion.div>
          
          <h1 className="text-6xl md:text-[8rem] font-light text-white mb-8 tracking-tighter leading-none">
            Architectural <br/>
            <span className="font-bold italic">Emotion.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed opacity-80">
            "The difference between a common space and an extraordinary place is a Wallpaper." 
          </p>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-white opacity-30"
        >
          <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent mx-auto"></div>
        </motion.div>
      </section>

      {/* --- THE HERITAGE: MASTERCLASS CRAFTSMANSHIP --- */}
      <section className="py-40 relative bg-white overflow-hidden">
        {/* Subtle Architectural Background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
           <div className="grid grid-cols-6 h-full w-full">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border-r border-black h-full"></div>
              ))}
           </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center space-y-16"
          >
            <div className="space-y-6">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.8em] block mb-4">The Mastery</span>
              <h2 className="text-7xl md:text-[9rem] font-light tracking-tighter leading-[0.85] text-gray-900">
                Crafting Stories <br/>
                <span className="font-bold italic">Beyond Walls.</span>
              </h2>
            </div>

            <div className="w-px h-32 bg-gradient-to-b from-black to-transparent mx-auto"></div>

            <div className="space-y-12 max-w-3xl mx-auto">
              <p className="text-2xl md:text-3xl text-gray-400 font-light leading-relaxed">
                {t('oscarBio1')}
              </p>
              
              <div className="relative py-20 px-12 group">
                 <div className="absolute inset-0 bg-gray-50 scale-x-150 -z-10 skew-y-1 group-hover:skew-y-0 transition-transform duration-700"></div>
                 <p className="text-3xl md:text-5xl font-bold italic tracking-tight text-gray-900 leading-[1.1]">
                   "We elevate Miami&apos;s most exclusive interiors through flawless artistry and technical precision."
                 </p>
                 <div className="mt-8 flex justify-center gap-4 items-center">
                    <div className="h-px w-12 bg-blue-600"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">The Barrera Standard</span>
                    <div className="h-px w-12 bg-blue-600"></div>
                 </div>
              </div>

              <p className="text-xl text-gray-500 font-light leading-relaxed">
                {t('oscarBio3')}
              </p>
            </div>

            <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-24 border-t border-gray-100">
              {[
                { value: '12+', label: 'Years of Excellence', icon: Award },
                { value: '500+', label: 'Masterpieces Created', icon: CheckCircle2 },
                { value: '100%', label: 'Technical Precision', icon: Users },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.2 }}
                  className="space-y-2"
                >
                  <p className="text-5xl font-black text-gray-900 tracking-tighter italic">{stat.value}</p>
                  <p className="text-[10px] text-blue-600 uppercase tracking-[0.3em] font-bold">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- IN MOTION: INSTALLATION JOURNEY --- */}
      <section className="py-32 bg-black text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end mb-24">
            <div className="space-y-8">
              <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.5em]">The Craft</span>
              <h3 className="text-6xl md:text-8xl font-light tracking-tighter leading-none">
                Precision <br />
                <span className="font-bold italic">In Motion.</span>
              </h3>
            </div>
            <p className="text-gray-400 text-xl font-light leading-relaxed max-w-md">
              Witness the transformation of luxury spaces through our meticulous installation process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { src: '/images/about/motion-1.jpg', label: 'Preparation' },
              { src: '/images/about/motion-2.jpg', label: 'Execution' },
              { src: '/images/about/motion-3.jpg', label: 'Mastery' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -20 }}
                className="relative aspect-[3/4] rounded-[3rem] overflow-hidden group shadow-2xl"
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-10 left-10">
                   <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-blue-400 mb-2">Phase 0{i+1}</p>
                   <p className="text-3xl font-black tracking-tighter italic">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]"></div>
      </section>

      {/* --- TRANSFORMED SPACES GALLERY --- */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.6em] mb-4 block">Portfolio Teaser</span>
            <h3 className="text-5xl md:text-7xl font-light tracking-tighter">
              Curated <span className="font-bold italic text-blue-600">Environments.</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { src: '/images/about/gallery-1.webp', title: 'Modern Minimalist' },
              { src: '/images/about/gallery-2.webp', title: 'Architectural Gold' },
              { src: '/images/about/gallery-3.webp', title: 'Luxury Commercial' }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative aspect-square rounded-[3rem] overflow-hidden group shadow-3xl"
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-[10s]"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                <div className="absolute inset-0 p-12 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   <h4 className="text-2xl font-bold text-white tracking-tighter italic">{item.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- ARCHITECTURAL SHOWCASE: 40+ MASTERPIECES --- */}
      <section className="py-32 bg-white">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="space-y-6">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.6em]">The Collection</span>
              <h3 className="text-6xl md:text-8xl font-light tracking-tighter leading-none text-gray-900">
                Architectural <br />
                <span className="font-bold italic">Showcase.</span>
              </h3>
            </div>
            <div className="max-w-md text-right">
               <p className="text-gray-500 text-lg font-light leading-relaxed">
                 A visual journey through our most prestigious installations and advanced material specifications.
               </p>
            </div>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {[
              "1569-1-2-min-scaled.jpg",
              "BLossom_Teal_mockup_square.webp",
              "Bustle-BUS-06-Nightsky.webp",
              "Floratique_poppies_red_orange_mockup.webp",
              "ICT-TAHITI-Copper-Stylecraft-Table-Workshopped-Bowl-113.webp",
              "Innovations_AML-03-Steel_Trap.webp",
              "Innovations_Andees_AND-304_Condoro.webp",
              "Innovations_Bloque_BLQ-04_Weathered.webp",
              "Innovations_Bodhi_BDI-02_Cleo (1).webp",
              "Innovations_Bodhi_BDI-02_Cleo.webp",
              "Innovations_Bordado_BRD-03_Hicks.webp",
              "Innovations_Calico_CIO-01_Sanibel.webp",
              "Innovations_Calico_CIO-02_Marley_.webp",
              "Innovations_Coast_Coa-008_Myrtle_Vertical-1.webp",
              "Innovations_Contoured-Suede_CTS-05_Sea-Mist.webp",
              "Innovations_Costine_CSO-002-Pearl-6.webp",
              "Innovations_Dojo_DOJ-07_Nirvana.webp",
              "Innovations_Electrum_ELE-004_Alnico.webp",
              "Innovations_Electrum_ELE-006_Bronze.webp",
              "Innovations_Evolution_EVO-004-Oats-.webp",
              "Innovations_Facet_FAC-02_Feldspar.webp",
              "Innovations_Ferghana_FER-06-Loy-2.webp",
              "Innovations_Ferghana_FER-08-Batken-1.webp",
              "Innovations_Gemma_GEM-01-Quartz-1.webp",
              "Innovations_Gemma_GEM-01-Quartz-5.webp",
              "Innovations_Gemma_GEM-05-Turquoise-3.webp",
              "Innovations_Gilded-Cork_GCO-104_Cool-SIlver.webp",
              "Innovations_Harlequin_HAR-04_Brighella.webp",
              "Innovations_IberianStripe_IBS-05-Valley-1.webp",
              "Innovations_Illumina_Ill-02_Sparkle.webp",
              "Innovations_Insieme_INS-01-Annaberg-5.webp",
              "Innovations_Komodo_KOM-008_Lombok.webp",
              "Innovations_Lido_LDO-05_Lyons-1.webp",
              "Innovations_Marke_MRK-03-Charcoal-2.webp",
              "Innovations_Mazarin_MAZ-06_Dresden-2.webp",
              "Innovations_Montado_MTD-03_Latte.webp",
              "Innovations_Plaza_PLA-004_Callaghan.webp",
              "Innovations_Pleated-Suede_PTS-06_Powder-Blue-2.webp",
              "Innovations_Pleated-Suede_PTS-08_Hunter.webp",
              "Innovations_Reed_REE-07_Lake1.webp",
              "Innovations_Shakudo_SAK-011-Newlands-3.webp",
              "Innovations_Soutache_STE-04_Smoky-Quartz.webp",
              "Innovations_Strata_STA-03_Agate.webp",
              "Innovations_Tatami_TTM-04-Poppi-4.webp",
              "Innovations_VenetianSuede_VEN-05-Reiter-1.webp",
              "Innovations_Yakisugi_YAK-04_Blue-Willow.webp",
              "T4HiXSdw-7282227-4.jpeg",
              "about-bg.jpg",
              "barrera-wallpaper-modern-design-WG-188-fashion_watercolor-10305318_01-2006866-1.jpeg",
              "barrera-wallpaper-tropical-design-WG-1393_1-1998354-1.jpeg",
              "bedroom-3-1.jpg",
              "bench-accounting-nvzvOPQW0gc-unsplash.jpg",
              "black-pendant-lamps-in-white-building-1381782.jpg",
              "d6vZgt4g-7358363-3.jpeg",
              "hero-bg-barrera-wallpaper-tropical-design-1569-2-min-3.png",
              "image-1694916578-scaled.jpg",
              "newsletter-bg-min.png",
              "scallops_blue_rectangle.webp",
              "slider-1-1.jpg"
            ].map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl group shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <Image
                  src={`/images/about/gallery/${img}`}
                  alt={`Project ${i + 1}`}
                  width={800}
                  height={800}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- OUR PHILOSOPHY --- */}
      <section ref={philosophyRef} className="py-32 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-100/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24 space-y-4">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.6em] mb-4 block">The Foundation</span>
            <h3 className="text-5xl md:text-7xl font-light text-gray-900 tracking-tighter mb-6">
              Our <span className="font-bold italic">Philosophy.</span>
            </h3>
            <div className="w-24 h-[1px] bg-black mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: t('art'), desc: t('artDesc'), icon: Palette, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: t('designPhilo'), desc: t('designDesc'), icon: Ruler, color: 'text-gray-900', bg: 'bg-gray-100' },
              { title: t('technology'), desc: t('technologyDesc'), icon: ShieldCheck, color: 'text-blue-800', bg: 'bg-blue-50/50' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="absolute -inset-4 bg-gradient-to-b from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[3rem] -z-10"></div>
                <div className="space-y-8 p-4">
                  <div className={`w-20 h-20 rounded-[2rem] ${item.bg} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 border border-gray-100 shadow-sm`}>
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-3xl font-bold tracking-tighter italic text-gray-900 uppercase">{item.title}</h4>
                    <p className="text-lg text-gray-500 font-light leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-6">
                    <div className="w-12 h-[1px] bg-gray-200 group-hover:w-full transition-all duration-700"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-black rounded-[5rem] p-16 md:p-32 text-white relative overflow-hidden text-center md:text-left"
          >
             <div className="absolute inset-0 opacity-40">
                <Image src="/images/about/design-detail.webp" alt="" fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
             </div>
             
             <div className="relative z-10 max-w-2xl space-y-10">
                <h2 className="text-5xl md:text-8xl font-light tracking-tighter leading-none">
                  The Next Era <br />
                  <span className="font-bold italic text-blue-500">Of Luxury.</span>
                </h2>
                <p className="text-xl text-gray-400 font-light leading-relaxed">
                  Join the elite circle of architects and designers who trust Barrera Wallpaper for their most ambitious projects.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                   <Link href="/catalog">
                     <Button className="h-16 px-12 rounded-none bg-white text-black hover:bg-gray-100 font-bold uppercase text-[10px] tracking-[0.4em] shadow-2xl">
                       VIEW SHOWROOM
                     </Button>
                   </Link>
                   <Link href="/contact">
                     <Button variant="outline" className="h-16 px-12 rounded-none border-white/30 bg-white/5 backdrop-blur-xl text-white hover:bg-white hover:text-black font-bold uppercase text-[10px] tracking-[0.4em]">
                       BOOK CONSULTATION
                     </Button>
                   </Link>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
