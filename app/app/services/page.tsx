
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from '@/components/locale-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Home,
  Building,
  CheckCircle,
  Clock,
  Shield,
  MapPin,
  Phone,
  Calendar,
  Star,
  Award,
  Truck,
  Ruler
} from 'lucide-react';

const getServices = (t: any) => [
  {
    titleKey: 'residentialInstallationTitle',
    descriptionKey: 'residentialInstallationDesc',
    icon: Home,
    featuresKeys: [
      'freeDesignConsultation',
      'surfaceMeasurement',
      'certifiedInstallation',
      'twoYearWarranty',
      'postInstallation'
    ],
    pricingKey: 'from',
    pricingValue: '$15/m²',
    durationValue: '1-2',
    coverageValue: 'Miami, FL'
  },
  {
    titleKey: 'commercialInstallationTitle',
    descriptionKey: 'commercialInstallationDesc',
    icon: Building,
    featuresKeys: [
      'fullProjectPlanning',
      'trafficResistant',
      'afterHoursInstallation',
      'safetyCertifications',
      'preventiveMaintenance'
    ],
    pricingKey: 'customQuote',
    pricingValue: '',
    durationValue: '2-5',
    coverageValue: 'Florida'
  }
];

const getProcess = (t: any) => [
  {
    step: 1,
    titleKey: 'initialConsultation',
    descriptionKey: 'initialConsultationDesc',
    icon: Phone
  },
  {
    step: 2,
    titleKey: 'measurementBudget',
    descriptionKey: 'measurementBudgetDesc',
    icon: Ruler
  },
  {
    step: 3,
    titleKey: 'spacePreparation',
    descriptionKey: 'spacePreparationDesc',
    icon: Shield
  },
  {
    step: 4,
    titleKey: 'professionalInstallation2',
    descriptionKey: 'professionalInstallationDesc2',
    icon: Award
  },
  {
    step: 5,
    titleKey: 'finalInspection',
    descriptionKey: 'finalInspectionDesc',
    icon: CheckCircle
  }
];

export default function ServicesPage() {
  const { t } = useLocale();
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [servicesRef, servicesInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [processRef, processInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const services = getServices(t);
  const process = getProcess(t);

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative py-20 bg-gradient-to-br from-green-50 to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              {t('installationServices')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('installationSubtitle')}
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <MapPin className="w-5 h-5" />
              <span className="font-semibold">{t('mainCoverage')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section ref={servicesRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('ourServices')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('ourServicesSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={service.titleKey}
                  initial={{ opacity: 0, y: 30 }}
                  animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{t(service.titleKey as any)}</CardTitle>
                          <CardDescription className="text-base">
                            {t(service.descriptionKey as any)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        {service.featuresKeys.map((featureKey, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700">{t(featureKey as any)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">
                            {service.pricingValue ? `${t(service.pricingKey as any)} ${service.pricingValue}` : t(service.pricingKey as any)}
                          </div>
                          <div className="text-sm text-gray-600">{t('price')}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{service.durationValue} {t('days')}</div>
                          <div className="text-sm text-gray-600">{t('duration')}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{service.coverageValue}</div>
                          <div className="text-sm text-gray-600">{t('coverage')}</div>
                        </div>
                      </div>

                      <Link href="/contact">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          {t('requestQuote')}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Installation Process */}
      <section ref={processRef} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={processInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('installationProcess')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('provenProcess')}
            </p>
          </motion.div>

          <div className="space-y-8">
            {process.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={processInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex items-center gap-8 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}
                >
                  <div className="flex-1">
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {t(step.titleKey as any)}
                            </h3>
                            <p className="text-gray-600">
                              {t(step.descriptionKey as any)}
                            </p>
                          </div>
                          <div className="text-3xl font-bold text-blue-600 flex-shrink-0">
                            {step.step}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              {t('readyToTransformSpace')}
            </h2>
            <p className="text-xl text-blue-100">
              {t('contactToday')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {t('scheduleConsultation')}
                </Button>
              </Link>
              <a href="tel:+13055550123">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  {t('callNow')}
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
