'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useLocale } from '@/components/locale-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Heart,
  Target,
  Lightbulb
} from 'lucide-react';

export default function AboutPage() {
  const { t } = useLocale();
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [storyRef, storyInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [valuesRef, valuesInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative py-20 bg-gradient-to-br from-blue-50 to-purple-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              {t('aboutUs')}
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t('aboutSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Oscar Barrera Story */}
      <section ref={storyRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={storyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="space-y-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {t('oscarBarrera')}
                </h2>
                <h3 className="text-xl text-blue-600 font-semibold">
                  {t('founderDesigner')}
                </h3>
              </div>
              
              <div className="space-y-4 text-gray-700 leading-relaxed text-center">
                <p>{t('oscarBio1')}</p>
                <p>{t('oscarBio2')}</p>
                <p>{t('oscarBio3')}</p>
                <p>{t('oscarBio4')}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">10+</div>
                  <div className="text-sm text-gray-700">{t('yearsExperience')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">500+</div>
                  <div className="text-sm text-gray-700">{t('projectsCompleted')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-gray-700">{t('clientSatisfaction')}</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section ref={valuesRef} className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('ourPhilosophy')}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              {t('philosophySubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="h-full text-center hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">{t('art')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700 leading-relaxed">
                    {t('artDesc')}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="h-full text-center hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">{t('designPhilo')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700 leading-relaxed">
                    {t('designDesc')}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={valuesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="h-full text-center hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Lightbulb className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">{t('technology')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-700 leading-relaxed">
                    {t('technologyDesc')}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              {t('ourMission')}
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              {t('missionStatement')}
            </p>
            <div className="italic text-lg text-blue-600 font-medium">
              - {t('oscarBarrera')}, {t('founder')}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
