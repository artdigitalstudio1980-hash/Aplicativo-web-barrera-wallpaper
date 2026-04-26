'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calculator, CreditCard, Ruler, AlertCircle, 
  Loader2, Plus, Trash2, Info, CheckCircle2, Sparkles, Send, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useLocale } from '@/components/locale-context';

interface Wall {
  id: string;
  width: string;
  height: string;
}

function CalculatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const wallpaperId = searchParams.get('wallpaperId');
  const { locale } = useLocale();

  const [loading, setLoading] = useState(true);
  const [wallpaper, setWallpaper] = useState<any | null>(null);
  const [unit, setUnit] = useState<'m' | 'in'>('m');
  const [walls, setWalls] = useState<Wall[]>([{ id: '1', width: '', height: '' }]);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // IA Assistant States
  const [aiMessages, setAiMessages] = useState<any[]>([
    { role: 'assistant', content: locale === 'es' 
        ? "¡Hola! Soy tu experto técnico. ¿Tienes dudas sobre las medidas o la instalación de SYSTEXX?" 
        : "Hello! I'm your technical expert. Do you have questions about measurements or SYSTEXX installation?" 
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  useEffect(() => {
    if (wallpaperId) {
      fetchWallpaper(wallpaperId);
    } else {
      setLoading(false);
    }
  }, [wallpaperId]);

  const fetchWallpaper = async (id: string) => {
    try {
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

  const addWall = () => {
    setWalls([...walls, { id: Date.now().toString(), width: '', height: '' }]);
  };

  const removeWall = (id: string) => {
    if (walls.length > 1) {
      setWalls(walls.filter(w => w.id !== id));
    }
  };

  const updateWall = (id: string, field: 'width' | 'height', value: string) => {
    setWalls(walls.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  // Calculations
  const calculateArea = () => {
    return walls.reduce((acc, wall) => {
      const w = parseFloat(wall.width) || 0;
      const h = parseFloat(wall.height) || 0;
      let area = w * h;
      
      if (unit === 'in') {
        // Convert sq inches to sq meters (1 sq in = 0.00064516 sq m)
        area = area * 0.00064516;
      }
      return acc + area;
    }, 0);
  };

  const rawArea = calculateArea();
  const wasteFactor = 1.15; // 15% waste for complex patterns
  const totalAreaWithWaste = rawArea * wasteFactor;
  const pricePerM2 = wallpaper?.price || 45.00;
  const estimatedTotal = totalAreaWithWaste * pricePerM2;

  const handleCheckout = async () => {
    if (estimatedTotal <= 0) {
      toast.error(locale === 'es' ? 'Ingresa medidas válidas' : 'Enter valid measurements');
      return;
    }

    setIsProcessingCheckout(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          items: [{
            wallpaperId: wallpaper?.id || 'custom',
            name: wallpaper ? (locale === 'es' ? wallpaper.nameEs : wallpaper.name) : 'Custom Wallpaper Order',
            price: estimatedTotal,
            quantity: 1,
            measurements: { area: totalAreaWithWaste, unit: 'm2' }
          }]
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.message || 'Checkout failed');
      }
    } catch (error) {
      toast.error(locale === 'es' ? 'Error al iniciar el pago' : 'Error starting checkout');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

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
          measurements: walls,
          unit,
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

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              className="pl-0 text-gray-400 hover:text-white hover:bg-transparent" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {locale === 'es' ? 'Volver al catálogo' : 'Back to catalog'}
            </Button>
            <h1 className="text-5xl font-extralight tracking-tighter flex items-center gap-4">
              <Calculator className="w-10 h-10 text-blue-500" />
              {locale === 'es' ? 'Estimador' : 'Estimator'}
              <span className="text-blue-500">.</span>
            </h1>
          </div>

          <Tabs value={unit} onValueChange={(v: any) => setUnit(v)} className="bg-white/5 p-1 rounded-full border border-white/10">
            <TabsList className="bg-transparent border-0">
              <TabsTrigger value="m" className="rounded-full px-6 data-[state=active]:bg-blue-600">Metric (m)</TabsTrigger>
              <TabsTrigger value="in" className="rounded-full px-6 data-[state=active]:bg-blue-600">Imperial (in)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left: Input Walls (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-light text-gray-400 flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                {locale === 'es' ? 'Dimensiones de Paredes' : 'Wall Dimensions'}
              </h2>
              <Button 
                onClick={addWall} 
                variant="outline" 
                className="rounded-full border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                {locale === 'es' ? 'Añadir Pared' : 'Add Wall'}
              </Button>
            </div>

            <AnimatePresence mode="popLayout">
              {walls.map((wall, index) => (
                <motion.div
                  key={wall.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all"
                >
                  <div className="flex flex-wrap items-end gap-6">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-medium">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-[120px]">
                      <Label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">
                        {locale === 'es' ? 'Ancho' : 'Width'} ({unit})
                      </Label>
                      <Input 
                        type="number"
                        value={wall.width}
                        onChange={(e) => updateWall(wall.id, 'width', e.target.value)}
                        className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 text-2xl font-light focus:ring-0 focus:border-blue-500 transition-colors"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex-1 min-w-[120px]">
                      <Label className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">
                        {locale === 'es' ? 'Alto' : 'Height'} ({unit})
                      </Label>
                      <Input 
                        type="number"
                        value={wall.height}
                        onChange={(e) => updateWall(wall.id, 'height', e.target.value)}
                        className="bg-transparent border-0 border-b border-white/10 rounded-none h-12 text-2xl font-light focus:ring-0 focus:border-blue-500 transition-colors"
                        placeholder="0.00"
                      />
                    </div>

                    {walls.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeWall(wall.id)}
                        className="text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-full"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-[2rem] flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
              <div className="text-sm text-blue-200/80 leading-relaxed">
                <p className="font-medium text-blue-300 mb-1">
                  {locale === 'es' ? 'Cálculo de Merma Inteligente' : 'Smart Waste Calculation'}
                </p>
                {locale === 'es' 
                  ? 'Aplicamos automáticamente un 15% de material extra. Esto es crucial para SYSTEXX para asegurar el calce perfecto de patrones y cortes en esquinas.' 
                  : 'We automatically apply 15% extra material. This is crucial for SYSTEXX to ensure perfect pattern matching and corner cuts.'}
              </div>
            </div>
          </div>

          {/* Right: Summary (4 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-28">
              <Card className="bg-white/5 backdrop-blur-2xl border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
                <CardContent className="p-10">
                  <h3 className="text-2xl font-light mb-8 flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    {locale === 'es' ? 'Resumen' : 'Summary'}
                  </h3>

                  {wallpaper && (
                    <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/10">
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-white/10">
                        <Image 
                          src={Array.isArray(wallpaper.images) ? wallpaper.images[0] : (wallpaper.imageUrl || '')} 
                          alt={wallpaper.name} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-blue-500 font-bold mb-1">Premium Series</div>
                        <h4 className="text-xl font-medium">{locale === 'es' ? wallpaper.nameEs : wallpaper.name}</h4>
                        <p className="text-gray-500 text-sm mt-1">${pricePerM2.toFixed(2)} / m²</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-sm uppercase tracking-wider">{locale === 'es' ? 'Área Neta' : 'Net Area'}</span>
                      <span className="text-lg font-light text-white">{rawArea.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-sm uppercase tracking-wider">{locale === 'es' ? 'Incl. Desperdicio' : 'Incl. Waste'}</span>
                      <span className="text-lg font-light text-white">{totalAreaWithWaste.toFixed(2)} m²</span>
                    </div>
                    <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-bold mb-1">Total Quote</div>
                        <div className="text-5xl font-extralight tracking-tighter">${estimatedTotal.toFixed(2)}</div>
                      </div>
                      <div className="text-gray-500 text-xs mb-1">USD</div>
                    </div>
                  </div>

                  {/* Payment Selection */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setPaymentMethod('stripe')}
                        className={`group relative p-4 rounded-2xl border transition-all duration-500 ${
                          paymentMethod === 'stripe' 
                            ? 'bg-white border-white' 
                            : 'bg-transparent border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${paymentMethod === 'stripe' ? 'text-black/40' : 'text-gray-500 group-hover:text-gray-300'}`}>Card</div>
                        <Image 
                          src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                          alt="Stripe" width={60} height={20} 
                          className={`h-5 w-auto object-contain transition-all ${paymentMethod === 'stripe' ? '' : 'brightness-0 invert opacity-40 group-hover:opacity-100'}`} 
                        />
                      </button>

                      <button
                        onClick={() => setPaymentMethod('paypal')}
                        className={`group relative p-4 rounded-2xl border transition-all duration-500 ${
                          paymentMethod === 'paypal' 
                            ? 'bg-white border-white' 
                            : 'bg-transparent border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${paymentMethod === 'paypal' ? 'text-black/40' : 'text-gray-500 group-hover:text-gray-300'}`}>Digital</div>
                        <Image 
                          src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" 
                          alt="PayPal" width={60} height={20} 
                          className={`h-5 w-auto object-contain transition-all ${paymentMethod === 'paypal' ? '' : 'brightness-0 invert opacity-40 group-hover:opacity-100'}`} 
                        />
                      </button>
                    </div>

                    <Button 
                      onClick={handleCheckout} 
                      disabled={estimatedTotal <= 0 || isProcessingCheckout}
                      className="w-full h-20 rounded-[2rem] bg-blue-600 hover:bg-blue-500 text-white text-xl font-light tracking-tight shadow-xl shadow-blue-600/20 group"
                    >
                      {isProcessingCheckout ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-6 h-6 transition-transform group-hover:scale-110" />
                          {locale === 'es' ? 'Pagar Ahora' : 'Pay Now'}
                        </div>
                      )}
                    </Button>
                    <p className="text-center text-[10px] text-gray-600 uppercase tracking-widest mt-4">Secure 256-bit SSL Encrypted Payment</p>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 flex items-center justify-center gap-8 opacity-20 grayscale">
                 <Image src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" width={50} height={20} className="invert" />
                 <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={70} height={20} className="invert" />
                 <div className="w-px h-4 bg-white/20"></div>
                 <Image src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" width={40} height={20} className="invert" />
                 <Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={30} height={20} className="invert" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Bubble */}
        <div className="fixed bottom-10 right-10 z-[60]">
          <AnimatePresence>
            {isAssistantOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute bottom-24 right-0 w-[380px] h-[500px] flex flex-col bg-[#1a1a1a]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden text-white"
              >
                <div className="p-8 bg-blue-600 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-blue-100 opacity-70">SYSTEXX AI</div>
                      <span className="text-sm font-medium">Technical Support</span>
                    </div>
                  </div>
                  <button onClick={() => setIsAssistantOpen(false)} className="hover:rotate-90 transition-transform"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {aiMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-5 rounded-[1.5rem] text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white/5 border border-white/5 text-gray-300'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && <div className="flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500/50" /></div>}
                </div>

                <div className="p-6 bg-white/5 border-t border-white/5 flex gap-3">
                  <input 
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                    placeholder="Ask about installation..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-full px-6 py-3 text-sm outline-none focus:border-blue-500/50 transition-colors"
                  />
                  <button onClick={handleAiSend} className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsAssistantOpen(!isAssistantOpen)}
            className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50 group"
          >
            {isAssistantOpen ? <X className="w-8 h-8" /> : <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex justify-center items-center bg-black"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>}>
      <CalculatorContent />
    </Suspense>
  );
}
