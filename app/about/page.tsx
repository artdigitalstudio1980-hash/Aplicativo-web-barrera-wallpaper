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
  Ruler
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
      
      {/* --- LUXURY HERO SECTION WITH VIDEO OVERLAY --- */}
      <section 
        ref={heroRef}
        className="relative h-[90vh] flex items-center justify-center overflow-hidden"
      >
        {/* Background Image/Video Placeholder */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about/hero.png"
            alt="Luxury Interior Wallcoverings"
            fill
            className="object-cover brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={heroInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 text-center px-4"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 text-white text-xs font-bold tracking-[0.3em] uppercase mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Miami's Premier Wallcoverings
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic leading-tight">
            The Difference Between <br/> Common & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Extraordinary</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light leading-relaxed">
            "The difference between a common space and an extraordinary place is a Wallpaper." We transform luxury showrooms, residential spaces, and nurseries with unparalleled precision.
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-white opacity-50"
        >
          <div className="w-px h-20 bg-gradient-to-b from-white to-transparent mx-auto"></div>
        </motion.div>
      </section>

      {/* --- THE VISIONARY: OSCAR BARRERA --- */}
      <section className="py-32 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Image Side with Parallax */}
            <motion.div 
              style={{ y: y1 }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-black/10"
            >
              <Image
                src="/images/about/oscar_barrera.jpeg"
                alt="Oscar Barrera - Precision and Luxury"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-10 left-10 text-white">
                <p className="text-4xl font-bold tracking-tight">Oscar Barrera</p>
                <p className="text-lg opacity-80 font-light">Founder & Principal Designer</p>
              </div>
            </motion.div>

            {/* Text Side */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Our Legacy</h2>
                <h3 className="text-5xl font-bold text-gray-900 leading-tight">
                  Crafting Stories Through <span className="italic text-gray-400">Exceptional Design</span>
                </h3>
              </div>

              <div className="space-y-6 text-lg text-gray-600 font-light leading-relaxed">
                <p>{t('oscarBio1')}</p>
                <p>{t('oscarBio2')}</p>
                <div className="bg-gray-50 border-l-4 border-blue-600 p-8 italic text-gray-900 text-xl rounded-r-3xl relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                  "The difference between a common space and an extraordinary place is a Wallpaper. Our mission is to elevate Miami's most exclusive interiors—from luxury auto showrooms to high-end nurseries—through flawless artistry."
                </div>
                <p>{t('oscarBio3')}</p>
              </div>

              {/* Stats Grid */}
              <div ref={statsRef} className="grid grid-cols-3 gap-8 pt-10 border-t border-gray-100">
                {[
                  { value: '10+', label: t('yearsExperience'), icon: Award },
                  { value: '500+', label: t('projectsCompleted'), icon: CheckCircle2 },
                  { value: '98%', label: t('clientSatisfaction'), icon: Users },
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={statsInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: i * 0.2 }}
                  >
                    <p className="text-3xl font-black text-gray-900 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- INSTALLATION VIDEO SHOWCASE (PLACEHOLDER) --- */}
      <section className="py-24 bg-black text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em] mb-4">In Motion</h2>
              <h3 className="text-5xl font-bold italic tracking-tighter">Precision Installation</h3>
            </div>
            <p className="text-gray-400 max-w-sm font-light">
              Watch our team transform spaces in Miami with the world's most durable glass fiber wallcoverings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['/images/about/installation_people_1.jpeg', '/images/about/installation_people_2.jpeg', '/images/about/installation_people_3.jpg'].map((src, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden bg-gray-900 group cursor-pointer shadow-xl"
              >
                <Image
                  src={src}
                  alt="Installation Team"
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-6 left-6 text-sm font-bold uppercase tracking-widest translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 text-white">
                  Installation Team
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- TRANSFORMED SPACES GALLERY --- */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Inspiration</h2>
            <h3 className="text-5xl font-bold text-gray-900 tracking-tighter uppercase italic">Transformed Spaces</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['/images/about/space_1.jpg', '/images/about/space_2.jpg', '/images/about/space_3.jpeg'].map((src, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-2xl group"
              >
                <Image
                  src={src}
                  alt="Decorative Space"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- OUR PHILOSOPHY: GLASSMORHPISM CARDS --- */}
      <section ref={philosophyRef} className="py-32 bg-gray-50 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">The Core</h2>
            <h3 className="text-5xl font-bold text-gray-900 tracking-tighter uppercase italic">{t('ourPhilosophy')}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { title: t('art'), desc: t('artDesc'), icon: Heart, color: 'from-blue-500 to-cyan-400' },
              { title: t('designPhilo'), desc: t('designDesc'), icon: Target, color: 'from-purple-500 to-pink-400' },
              { title: t('technology'), desc: t('technologyDesc'), icon: Lightbulb, color: 'from-orange-500 to-yellow-400' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={philosophyInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.2 }}
                className="glass-card p-10 rounded-[3rem] border border-white/50 bg-white/40 backdrop-blur-xl hover:bg-white/60 transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-8 shadow-lg group-hover:rotate-12 transition-transform`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h4>
                <p className="text-gray-600 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA: READY TO TRANSFORM --- */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-black rounded-[4rem] p-16 md:p-24 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
              <Image 
                src="/images/about/space_2.jpg" 
                alt="" 
                fill 
                className="object-cover"
              />
            </div>
            
            <div className="relative z-10 space-y-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                Experience the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-white">Next Era of Walls</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                {t('discoverThousands')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/catalog/">
                  <Button className="rounded-full h-16 px-12 bg-white text-black hover:bg-gray-200 text-lg font-bold transition-all shadow-2xl">
                    Explore Collections
                  </Button>
                </Link>
                <Link href="/contact/">
                  <Button variant="outline" className="rounded-full h-16 px-12 border-white/30 text-white hover:bg-white/10 text-lg font-bold backdrop-blur-md">
                    Schedule Consultation
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
