'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Calculator, CreditCard, Ruler, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useLocale } from '@/components/locale-context';

import { Suspense } from 'react';
import { Send, Sparkles, X } from 'lucide-react';

function CalculatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wallpaperId = searchParams.get('wallpaperId');
  const { locale } = useLocale();

  const [loading, setLoading] = useState(true);
  const [wallpaper, setWallpaper] = useState<any | null>(null);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // IA Assistant States
  const [aiMessages, setAiMessages] = useState<any[]>([
    { role: 'assistant', content: "Hello! I'm your technical estimator. Do you have questions about measurements or installation for this product?" }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const handleAiSend = async () => {
    if (!aiInput.trim() || isAiLoading) return;
    const msg = aiInput.trim();
    setAiInput('');
    const newMsgs = [...aiMessages, { role: 'user', content: msg }];
    setAiMessages(newMsgs);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/chat/technical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMsgs,
          measurements: { width, height },
          product: wallpaper?.name
        }),
      });
      const data = await res.json();
      setAiMessages([...newMsgs, data]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (wallpaperId) {
      fetchWallpaper(wallpaperId);
    } else {
      setLoading(false); // Can be used without specific wallpaper
    }
  }, [wallpaperId]);

  const fetchWallpaper = async (id: string) => {
    try {
      // Reusing the products API to find the specific one
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        const found = data.products.find((p: any) => p.id === id);
        if (found) setWallpaper(found);
      }
    } catch (error) {
      console.error('Error fetching wallpaper:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculations
  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;
  
  // Custom wallpaper is usually sold by square meter. We add 10% for waste/matching.
  const rawArea = w * h;
  const totalAreaWithWaste = rawArea * 1.1; 
  
  // Base price per m2. If product has price, we use it, otherwise a default premium price.
  const pricePerM2 = wallpaper?.price || 45.00;
  const estimatedTotal = totalAreaWithWaste > 0 ? totalAreaWithWaste * pricePerM2 : 0;

  const handleCheckout = async () => {
    if (estimatedTotal <= 0) {
      toast.error(locale === 'es' ? 'Ingresa medidas válidas mayores a 0' : 'Enter valid measurements greater than 0');
      return;
    }

    setIsProcessingCheckout(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            wallpaperId: wallpaper?.id || 'custom',
            name: wallpaper ? (locale === 'es' ? wallpaper.nameEs : wallpaper.name) : 'Custom Wallpaper Order',
            price: estimatedTotal,
            quantity: 1,
            measurements: { width: w, height: h, unit: 'm' }
          }]
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      } else {
        throw new Error(data.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(locale === 'es' ? 'Error al iniciar el pago' : 'Error starting checkout');
      
      // Fallback redirect for testing if Stripe is not fully configured
      setTimeout(() => {
        toast.info(locale === 'es' ? 'Simulando pago exitoso (Modo Demo)...' : 'Simulating successful payment (Demo Mode)...');
        router.push('/checkout/success?session_id=demo_session');
      }, 2000);

    } finally {
      setIsProcessingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const imagesArray = Array.isArray(wallpaper?.images) ? wallpaper.images : [];
  const imageUrl = wallpaper?.imageUrl || imagesArray[0] || '';

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            {locale === 'es' ? 'Volver' : 'Go Back'}
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-light tracking-wide text-gray-900 flex items-center justify-center gap-3">
            <Calculator className="w-8 h-8" />
            {locale === 'es' ? 'CALCULADORA DE MATERIAL' : 'MATERIAL CALCULATOR'}
          </h1>
          <p className="mt-4 text-gray-600">
            {locale === 'es' 
              ? 'Ingresa las medidas de tu pared en metros para cotizar la cantidad exacta de papel tapiz que necesitas.' 
              : 'Enter your wall measurements in meters to quote the exact amount of wallpaper you need.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left: Input Form */}
          <Card className="rounded-3xl shadow-xl overflow-hidden border-0">
            <CardContent className="p-8">
              <h3 className="text-xl font-medium mb-6 flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                {locale === 'es' ? 'Medidas de la Pared' : 'Wall Measurements'}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="width" className="text-gray-600">{locale === 'es' ? 'Ancho (Metros)' : 'Width (Meters)'}</Label>
                  <Input 
                    id="width" 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="Ej. 3.5" 
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="mt-2 text-lg h-12 rounded-xl"
                  />
                </div>
                
                <div>
                  <Label htmlFor="height" className="text-gray-600">{locale === 'es' ? 'Alto (Metros)' : 'Height (Meters)'}</Label>
                  <Input 
                    id="height" 
                    type="number" 
                    step="0.01"
                    min="0"
                    placeholder="Ej. 2.4" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="mt-2 text-lg h-12 rounded-xl"
                  />
                </div>

                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>
                    {locale === 'es' 
                      ? 'Automáticamente añadimos un 10% extra por desperdicio y merma para asegurar que cubras toda tu pared.' 
                      : 'We automatically add an extra 10% for waste to ensure you cover your entire wall.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Summary and Payment */}
          <div className="space-y-6">
            {wallpaper && (
              <Card className="rounded-3xl shadow-sm border overflow-hidden">
                <div className="flex items-center p-4 gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={wallpaper.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{locale === 'es' ? wallpaper.nameEs : wallpaper.name}</h4>
                    <p className="text-gray-500 text-sm">{locale === 'es' ? 'Diseño Seleccionado' : 'Selected Design'}</p>
                    <p className="text-sm font-medium mt-1">${pricePerM2.toFixed(2)} / m²</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="rounded-3xl shadow-xl overflow-hidden border-0 bg-gray-900 text-white">
              <CardContent className="p-8">
                <h3 className="text-xl font-medium mb-6 text-gray-100">
                  {locale === 'es' ? 'Resumen de Cotización' : 'Quote Summary'}
                </h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-300">
                    <span>{locale === 'es' ? 'Área neta' : 'Net area'}</span>
                    <span>{rawArea.toFixed(2)} m²</span>
                  </div>
                  <div className="flex justify-between text-gray-300 border-b border-gray-700 pb-4">
                    <span>{locale === 'es' ? 'Área total (+10% merma)' : 'Total area (+10% waste)'}</span>
                    <span>{totalAreaWithWaste.toFixed(2)} m²</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <span className="text-lg text-gray-100">{locale === 'es' ? 'Total Estimado' : 'Estimated Total'}</span>
                    <span className="text-4xl font-bold text-white">
                      ${estimatedTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout} 
                  disabled={estimatedTotal <= 0 || isProcessingCheckout}
                  className="w-full h-14 text-lg font-light tracking-wide rounded-xl bg-white text-black hover:bg-gray-200"
                >
                  {isProcessingCheckout ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-3" />
                      {locale === 'es' ? 'Proceder al Pago' : 'Proceed to Checkout'}
                    </>
                  )}
                </Button>
                
                <div className="flex justify-center gap-4 mt-6 opacity-60 grayscale">
                  {/* Mock Payment Icons */}
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" width={40} height={20} className="h-5 w-auto object-contain brightness-200" />
                  <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={60} height={20} className="h-5 w-auto object-contain brightness-200" />
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* --- AI TECHNICAL ASSISTANT BUBBLE --- */}
        <div className="fixed bottom-10 left-10 z-[60]">
          <AnimatePresence>
            {isAssistantOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute bottom-20 left-0 w-[320px] h-[400px] flex flex-col bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 overflow-hidden text-black"
              >
                <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-200" />
                    <span className="text-xs font-black uppercase tracking-widest text-blue-50">Technical Expert</span>
                  </div>
                  <button onClick={() => setIsAssistantOpen(false)}><X className="w-4 h-4" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  {aiMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-2xl ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && <Loader2 className="w-4 h-4 animate-spin mx-auto text-gray-400" />}
                </div>

                <div className="p-3 bg-gray-50 flex gap-2">
                  <input 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                    placeholder="Ask technical question..."
                    className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-[10px] outline-none"
                  />
                  <button onClick={handleAiSend} className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
          >
            {isAssistantOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>}>
      <CalculatorContent />
    </Suspense>
  );
}
