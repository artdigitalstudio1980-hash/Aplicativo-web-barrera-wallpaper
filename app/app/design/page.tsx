
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from '@/components/locale-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  Palette, 
  Wand2, 
  Upload, 
  Download,
  ArrowRight,
  CheckCircle,
  Loader2,
  Brain,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface AIExample {
  id: string;
  prompt: string;
  imageUrl: string;
  style: string;
}

export default function DesignPage() {
  const { t, locale } = useLocale();
  const [aiExamples, setAiExamples] = useState<AIExample[]>([]);

  useEffect(() => {
    // Fetch AI examples
    fetchAIExamples();
  }, []);

  const fetchAIExamples = async () => {
    try {
      const response = await fetch('/api/ai-examples');
      const data = await response.json();
      if (data.success) {
        setAiExamples(data.data);
      }
    } catch (error) {
      console.error('Error fetching AI examples:', error);
      // Fallback examples
      setAiExamples([
        {
          id: '1',
          prompt: 'Modern geometric pattern with gold and navy blue colors',
          imageUrl: '/images/ai-example-1.jpg',
          style: 'Modern'
        },
        {
          id: '2', 
          prompt: 'Tropical botanical leaves in watercolor style',
          imageUrl: '/images/ai-example-2.jpg',
          style: 'Botanical'
        },
        {
          id: '3',
          prompt: 'Abstract marble texture with rose gold veining',
          imageUrl: '/images/ai-example-3.jpg',
          style: 'Abstract'
        }
      ]);
    }
  };

  const designOptions = [
    {
      title: locale === 'es' ? 'Generador AI de Wallpapers' : 'AI Wallpaper Generator',
      description: locale === 'es' 
        ? 'Crea diseños únicos usando inteligencia artificial. Describe tu visión y observa cómo cobra vida.'
        : 'Create unique designs using artificial intelligence. Describe your vision and watch it come to life.',
      icon: Brain,
      href: '/ai-studio',
      badge: 'NEW',
      badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
      features: locale === 'es' 
        ? ['Diseños únicos con IA', 'Producción automatizada', 'Entrega directa']
        : ['Unique AI designs', 'Automated production', 'Direct fulfillment']
    },
    {
      title: locale === 'es' ? 'Diseño Personalizado' : 'Custom Design Service',
      description: locale === 'es'
        ? 'Trabaja directamente con Oscar Barrera para crear un diseño completamente personalizado.'
        : 'Work directly with Oscar Barrera to create a completely custom design.',
      icon: Palette,
      href: '/contact?service=custom-design',
      features: locale === 'es'
        ? ['Consulta personal', 'Diseño único', 'Instalación incluida']
        : ['Personal consultation', 'Unique design', 'Installation included']
    },
    {
      title: locale === 'es' ? 'Sube Tu Diseño' : 'Upload Your Design',
      description: locale === 'es'
        ? '¿Tienes tu propio diseño? Súbelo y lo imprimiremos en papel tapiz de alta calidad.'
        : 'Have your own design? Upload it and we\'ll print it on high-quality wallpaper.',
      icon: Upload,
      href: '/contact?service=print-design',
      features: locale === 'es'
        ? ['Cualquier formato', 'Impresión premium', 'Múltiples materiales']
        : ['Any format accepted', 'Premium printing', 'Multiple materials']
    }
  ];

  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-wide">
            {locale === 'es' ? 'ESTUDIO DE DISEÑO' : 'DESIGN STUDIO'}
          </h1>
          <div className="w-24 h-px bg-black mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
            {locale === 'es' 
              ? 'Transforma tu espacio con diseños únicos. Desde generación con IA hasta consultas personalizadas.'
              : 'Transform your space with unique designs. From AI generation to personal consultations.'
            }
          </p>
        </motion.div>

        {/* Design Options */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {designOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg relative overflow-hidden">
                  {option.badge && (
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-white text-xs font-medium ${option.badgeColor}`}>
                      {option.badge}
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto w-16 h-16 ${option.badge ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-4`}>
                      <Icon className={`w-8 h-8 ${option.badge ? 'text-purple-600' : 'text-gray-700'}`} />
                    </div>
                    <CardTitle className="text-xl font-light tracking-wide">
                      {option.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="text-center space-y-6">
                    <p className="text-gray-600 font-light leading-relaxed">
                      {option.description}
                    </p>
                    
                    <div className="space-y-2">
                      {option.features.map((feature) => (
                        <div key={feature} className="flex items-center justify-center text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <Link href={option.href}>
                      <Button 
                        className={`w-full ${option.badge 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                          : 'bg-black hover:bg-gray-800'
                        } text-white font-light tracking-wide transition-all duration-300`}
                      >
                        {locale === 'es' ? 'COMENZAR' : 'GET STARTED'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* AI Examples Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 tracking-wide">
              {locale === 'es' ? 'CREACIONES CON IA' : 'AI CREATIONS'}
            </h2>
            <div className="w-24 h-px bg-black mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
              {locale === 'es'
                ? 'Explora diseños únicos creados con inteligencia artificial'
                : 'Explore unique designs created with artificial intelligence'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiExamples.map((example, index) => (
              <motion.div
                key={example.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={example.imageUrl}
                      alt={example.prompt}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-black/70 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">
                        {example.style}
                      </Badge>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        "{example.prompt}"
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/ai-studio">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8">
                <Zap className="w-5 h-5 mr-2" />
                {locale === 'es' ? 'CREAR CON IA AHORA' : 'CREATE WITH AI NOW'}
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Process Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 rounded-lg p-8 md:p-12"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4 tracking-wide">
              {locale === 'es' ? 'CÓMO FUNCIONA' : 'HOW IT WORKS'}
            </h2>
            <div className="w-24 h-px bg-black mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: locale === 'es' ? 'Describe' : 'Describe',
                description: locale === 'es' ? 'Tu visión de diseño' : 'Your design vision'
              },
              {
                step: '02', 
                title: locale === 'es' ? 'Genera' : 'Generate',
                description: locale === 'es' ? 'IA crea el diseño' : 'AI creates the design'
              },
              {
                step: '03',
                title: locale === 'es' ? 'Personaliza' : 'Customize', 
                description: locale === 'es' ? 'Material y tamaño' : 'Material and size'
              },
              {
                step: '04',
                title: locale === 'es' ? 'Recibe' : 'Receive',
                description: locale === 'es' ? 'En tu puerta' : 'At your door'
              }
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 font-light text-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-light text-gray-900 mb-2 tracking-wide uppercase">
                  {item.title}
                </h3>
                <p className="text-gray-600 font-light">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
