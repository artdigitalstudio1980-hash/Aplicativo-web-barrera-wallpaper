'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Image as ImageIcon, Wand2, ArrowRight, Loader2, CheckCircle, RefreshCcw, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLocale } from '@/components/locale-context';

export default function VisualizerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedWallpaperId = searchParams.get('wallpaperId');
  const { locale } = useLocale();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedWallpaper, setSelectedWallpaper] = useState<any | null>(null);
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchWallpapers();
  }, []);

  const fetchWallpapers = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && data.products) {
        setWallpapers(data.products.slice(0, 10)); // Just 10 for visualizer testing
        if (preselectedWallpaperId) {
          const wp = data.products.find((p: any) => p.id === preselectedWallpaperId);
          if (wp) setSelectedWallpaper(wp);
        }
      }
    } catch (error) {
      console.error('Error fetching wallpapers:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(locale === 'es' ? 'La imagen debe ser menor a 5MB' : 'Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !selectedWallpaper) return;
    
    setIsGenerating(true);
    try {
      // Create generation request
      const res = await fetch('/api/ai/visualize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomImage: selectedImage,
          wallpaperId: selectedWallpaper.id,
          wallpaperName: selectedWallpaper.name,
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setGeneratedImage(data.generatedImage);
        toast.success(locale === 'es' ? '¡Visualización generada con éxito!' : 'Visualization generated successfully!');
        setStep(3);
      } else {
        throw new Error(data.error || 'Failed to generate');
      }
    } catch (error) {
      console.error('Generation err:', error);
      toast.error(locale === 'es' ? 'Error al generar la vista. Intenta de nuevo.' : 'Error generating view. Try again.');
      // For testing if API fails or lacks keys, we can fallback
      setTimeout(() => {
        setGeneratedImage(selectedImage); // Fake fallback
        setStep(3);
        toast.error('Usando imagen de prueba por fallo en API IA (Falta Key).');
      }, 2000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-4 text-gray-900">
            {locale === 'es' ? 'PRUÉBALO EN TU PARED' : 'TRY IT ON YOUR WALL'}
          </h1>
          <div className="w-24 h-px bg-black mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {locale === 'es' 
              ? 'Sube una foto de tu habitación y deja que nuestra Inteligencia Artificial aplique el papel tapiz seleccionado de forma realista y gratuita.'
              : 'Upload a photo of your room and let our AI apply your selected wallpaper realistically for free.'}
          </p>
        </div>

        {/* Steps Progress */}
        <div className="flex justify-center items-center mb-12 space-x-4 md:space-x-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
                {s}
              </div>
              {s < 3 && <div className={`h-1 w-12 md:w-24 ml-4 md:ml-8 rounded-full ${step > s ? 'bg-black' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-6 md:p-10 min-h-[500px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: UPLOAD IMAGE */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <div 
                  className="w-full max-w-2xl border-2 border-dashed border-gray-300 rounded-3xl p-12 hover:border-black hover:bg-gray-50 transition-all cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="w-16 h-16 text-gray-400 mx-auto mb-6 group-hover:text-black transition-colors" />
                  <h3 className="text-2xl font-medium mb-2">
                    {locale === 'es' ? 'Sube o arrastra una foto' : 'Upload or drag a photo'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {locale === 'es' ? 'Soporta JPG o PNG hasta 5MB' : 'Supports JPG or PNG up to 5MB'}
                  </p>
                  <Button variant="outline" className="rounded-full px-8 border-gray-300">
                    {locale === 'es' ? 'Seleccionar Archivo' : 'Select File'}
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg, image/png" 
                    onChange={handleImageUpload} 
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: SELECT WALLPAPER & GENERATE */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-10"
              >
                {/* Left: Uploaded Image */}
                <div className="space-y-4">
                  <h3 className="text-xl font-medium flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" /> 
                    {locale === 'es' ? 'Tu Habitación' : 'Your Room'}
                  </h3>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                    <Image src={selectedImage!} alt="Room" fill className="object-cover" />
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md hover:bg-white text-black"
                      onClick={() => setStep(1)}
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      {locale === 'es' ? 'Cambiar Foto' : 'Change Photo'}
                    </Button>
                  </div>
                </div>

                {/* Right: Wallpapers & Action */}
                <div className="space-y-6 flex flex-col">
                  <div>
                    <h3 className="text-xl font-medium flex items-center gap-2 mb-4">
                      <Wand2 className="w-5 h-5" />
                      {locale === 'es' ? 'Elige un Diseño' : 'Choose a Design'}
                    </h3>
                    
                    {wallpapers.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {wallpapers.map((wp) => {
                          const imagesArray = Array.isArray(wp.images) ? wp.images : [];
                          const imageUrl = wp.imageUrl || imagesArray[0] || '';
                          const isSelected = selectedWallpaper?.id === wp.id;

                          return (
                            <div 
                              key={wp.id}
                              onClick={() => setSelectedWallpaper(wp)}
                              className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isSelected ? 'border-black scale-95 shadow-lg' : 'border-transparent hover:border-gray-300'}`}
                            >
                              {imageUrl ? (
                                <Image src={imageUrl} alt={wp.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-200"></div>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                  <CheckCircle className="text-white w-8 h-8 drop-shadow-md" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-xl">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-100">
                    <Button 
                      onClick={handleGenerate} 
                      disabled={!selectedWallpaper || isGenerating}
                      className="w-full h-14 text-lg font-light tracking-wide rounded-xl bg-gradient-to-r from-gray-900 to-black hover:from-black hover:to-gray-800 shadow-xl shadow-black/20"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          {locale === 'es' ? 'Aplicando IA...' : 'Applying AI...'}
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5 mr-3 text-purple-400" />
                          {locale === 'es' ? 'Ver Resultado Mágico' : 'See Magic Result'}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-center mt-3 text-gray-500">
                      {locale === 'es' ? '*El proceso de IA puede demorar de 10 a 30 segundos.' : '*AI process may take 10 to 30 seconds.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: RESULT */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-full max-w-4xl relative aspect-video rounded-3xl overflow-hidden shadow-2xl mb-8 group">
                  <Image src={generatedImage!} alt="Generated Room" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-6">
                    <div className="text-white">
                      <h4 className="font-medium text-lg">{selectedWallpaper?.name}</h4>
                      <p className="text-sm opacity-80">{locale === 'es' ? 'Simulación generada por IA' : 'AI Generated Simulation'}</p>
                    </div>
                    <Button variant="outline" className="bg-white/20 hover:bg-white text-white hover:text-black border-none backdrop-blur-md">
                      <Maximize className="w-4 h-4 mr-2" />
                      {locale === 'es' ? 'Ampliar' : 'Expand'}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-2xl mx-auto">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="flex-1 rounded-xl h-14"
                    onClick={() => {
                      setStep(2);
                      setGeneratedImage(null);
                    }}
                  >
                    <RefreshCcw className="w-5 h-5 mr-2" />
                    {locale === 'es' ? 'Probar otro diseño' : 'Try another design'}
                  </Button>
                  
                  <Button 
                    size="lg"
                    className="flex-1 rounded-xl h-14 bg-black hover:bg-gray-800 text-white shadow-xl"
                    onClick={() => router.push(`/calculator?wallpaperId=${selectedWallpaper?.id}&imgSession=true`)}
                  >
                    {locale === 'es' ? 'Cotizar Material' : 'Quote Material'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
