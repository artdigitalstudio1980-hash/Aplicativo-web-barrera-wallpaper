'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/components/locale-context';
import { Button } from '@/components/ui/button';
import { 
  Users,
  Palette,
  Award,
  TrendingUp,
  Star,
  Home,
  Building,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const { t } = useLocale();
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return <div className="relative overflow-x-hidden">
      <section 
        ref={heroRef}
        className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center bg-white py-12 sm:py-0"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 sm:space-y-12">
            {/* Main Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-64 h-20 sm:w-80 sm:h-24 mx-auto"
            >
              <Image
                src="/images/Barrera_logo_black-2.png"
                alt="Barrera Wallpaper"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
            
            <div className="space-y-4 sm:space-y-8">
              <h1 className="text-3xl md:text-6xl font-light text-gray-900 leading-tight tracking-wide px-2 sm:px-0">
                {t('heroTitle')}
              </h1>
              
              <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light px-4 sm:px-0">
                {t('heroSubtitle')}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 sm:px-0"
            >
              <Link href="/catalog" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-8 sm:px-12 py-6 text-lg font-light tracking-wide transition-all duration-300 rounded-none"
                >
                  {t('exploreCollection')}
                </Button>
              </Link>
              
              <Link href="/design" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto border-2 border-black text-black hover:bg-black hover:text-white px-8 sm:px-12 py-6 text-lg font-light tracking-wide transition-all duration-300 rounded-none"
                >
                  {t('designWithAI')}
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
          >
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={statsInView ? { scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex justify-center"
              >
                <Users className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">500+</h3>
              <p className="text-xs sm:text-base text-gray-600">{t('happyCustomers')}</p>
            </div>
            
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={statsInView ? { scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center"
              >
                <Palette className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600" />
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">1000+</h3>
              <p className="text-xs sm:text-base text-gray-600">{t('uniqueDesigns')}</p>
            </div>
            
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={statsInView ? { scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex justify-center"
              >
                <Award className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">10+</h3>
              <p className="text-xs sm:text-base text-gray-600">{t('yearsExperience')}</p>
            </div>
            
            <div className="text-center space-y-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={statsInView ? { scale: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center"
              >
                <TrendingUp className="w-8 h-8 sm:w-12 sm:h-12 text-orange-600" />
              </motion.div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">98%</h3>
              <p className="text-xs sm:text-base text-gray-600">{t('satisfactionRate')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 sm:py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 sm:mb-20"
          >
            <h2 className="text-2xl md:text-4xl font-light text-gray-900 mb-4 sm:mb-6 tracking-wide">
              {t('whyChooseUs')}
            </h2>
            <div className="w-16 sm:w-24 h-px bg-black mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 sm:gap-y-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <Palette className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
              </div>
              <h3 className="text-lg sm:text-xl font-light tracking-wide text-gray-900">{t('aiPoweredDesign')}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-light max-w-xs mx-auto">
                {t('aiPoweredDesignDesc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <Home className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
              </div>
              <h3 className="text-lg sm:text-xl font-light tracking-wide text-gray-900">{t('professionalInstallation')}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-light max-w-xs mx-auto">
                {t('professionalInstallationDesc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <Star className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
              </div>
              <h3 className="text-lg sm:text-xl font-light tracking-wide text-gray-900">{t('premiumMaterials')}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-light max-w-xs mx-auto">
                {t('premiumMaterialsDesc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <Building className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
              </div>
              <h3 className="text-lg sm:text-xl font-light tracking-wide text-gray-900">{t('commercialSolutions')}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-light max-w-xs mx-auto">
                {t('commercialSolutionsDesc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
              </div>
              <h3 className="text-lg sm:text-xl font-light tracking-wide text-gray-900">{t('qualityGuarantee')}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-light max-w-xs mx-auto">
                {t('qualityGuaranteeDesc')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center space-y-4"
            >
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
              </div>
              <h3 className="text-lg sm:text-xl font-light tracking-wide text-gray-900">{t('artisticVision')}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-light max-w-xs mx-auto">
                {t('artisticVisionDesc')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8 sm:space-y-12"
          >
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-2xl md:text-4xl font-light text-gray-900 tracking-wide px-2">
                {t('readyToTransform')}
              </h2>
              <div className="w-16 sm:w-24 h-px bg-black mx-auto"></div>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed px-4 sm:px-0">
                {t('discoverThousands')}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 sm:px-0">
              <Link href="/catalog" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white px-8 sm:px-12 py-6 text-lg font-light tracking-wide transition-all duration-300 rounded-none"
                >
                  {t('browseCatalog')}
                </Button>
              </Link>
              
              <Link href="/contact" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-black text-black hover:bg-black hover:text-white px-8 sm:px-12 py-6 text-lg font-light tracking-wide transition-all duration-300 rounded-none"
                >
                  {t('getConsultation')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>;
}
