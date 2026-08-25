'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Calculator, CreditCard, Ruler, AlertCircle, 
  Loader2, Plus, Trash2, Info, CheckCircle2, Sparkles, Send, X,
  ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useLocale } from '@/components/locale-context';
import { useCart } from '@/lib/store/use-cart';
import { parseProductImage } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Wall {
  id: string;
  width: string;
  height: string;
}

function CalculatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const wallpaperId = searchParams.get('wallpaperId');
  const { locale } = useLocale();

  const [loading, setLoading] = useState(true);
  const [wallpaper, setWallpaper] = useState<any | null>(null);
  const [unit, setUnit] = useState<'m' | 'in'>('m');
  const [walls, setWalls] = useState<Wall[]>([{ id: '1', width: '', height: '' }]);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteSending, setQuoteSending] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address1: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
  });

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
      if (data.success && Array.isArray(data.products)) {
        const found = data.products.find((p: any) => p.id === id || p.sku === id);
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

  const calculateArea = () => {
    return walls.reduce((acc, wall) => {
      const w = parseFloat(wall.width) || 0;
      const h = parseFloat(wall.height) || 0;
      let area = w * h;
      if (unit === 'in') area = area * 0.00064516;
      return acc + area;
    }, 0);
  };

  const rawArea = calculateArea();
  const wasteFactor = 1.15; 
  const totalAreaWithWaste = rawArea * wasteFactor;
  const ROLL_SIZE = 25;
  const rollsNeeded = rawArea > 0 ? Math.ceil(totalAreaWithWaste / ROLL_SIZE) : 0;
  const pricePerRoll = wallpaper?.price || 350.00;
  const estimatedTotal = rollsNeeded * pricePerRoll;

  const handleCheckout = async () => {
    if (estimatedTotal <= 0) {
      toast.error(locale === 'es' ? 'Ingresa medidas válidas' : 'Enter valid measurements');
      return;
    }

    addItem({
      id: wallpaper?.id || 'custom',
      name: wallpaper ? (locale === 'es' ? wallpaper.nameEs : wallpaper.name) : 'Custom Wallpaper',
      price: pricePerRoll,
      quantity: rollsNeeded,
      image: wallpaper ? parseProductImage(wallpaper) : '/placeholder.jpg',
      sku: wallpaper?.sku || 'CUSTOM',
      isRoll: true,
      measurements: {
        width: 0,
        height: 0,
        area: totalAreaWithWaste,
        unit: 'm2'
      }
    });

    router.push('/checkout');
  };

  const handleQuoteRequest = async () => {
    if (!quoteForm.customerName || !quoteForm.customerEmail) {
      toast.error(locale === 'es' ? 'Ingresa tu nombre y email' : 'Enter your name and email');
      return;
    }
    setQuoteSending(true);
    try {
      const res = await fetch('/api/estimator/quote-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...quoteForm,
          walls,
          unit,
          wallpaperName: wallpaper ? wallpaper.name : '',
          wallpaperPrice: pricePerRoll,
          language: locale,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuoteOpen(false);
        toast.success(
          locale === 'es'
            ? `¡Solicitud enviada! Cotización ${data.data.quoteNumber} creada.`
            : `Request sent! Quotation ${data.data.quoteNumber} created.`,
        );
      } else {
        toast.error(data.error || (locale === 'es' ? 'Error al enviar' : 'Failed to send'));
      }
    } catch (error) {
      toast.error(locale === 'es' ? 'Error al enviar' : 'Failed to send');
    } finally {
      setQuoteSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading Estimator...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white text-gray-900 selection:bg-black selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              className="pl-0 text-gray-400 hover:text-black hover:bg-transparent group" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
              {locale === 'es' ? 'Volver al catálogo' : 'Back to catalog'}
            </Button>
            <h1 className="text-6xl font-black tracking-tighter italic uppercase leading-none">
              Project <span className="text-gray-200">Estimator</span><span className="text-blue-600">.</span>
            </h1>
            <p className="text-gray-400 text-sm font-light">Calculate the exact amount of material needed for your installation.</p>
          </div>

          <Tabs value={unit} onValueChange={(v: any) => setUnit(v)} className="bg-gray-50 p-1 rounded-2xl border border-gray-100 shadow-sm">
            <TabsList className="bg-transparent border-0 gap-1">
              <TabsTrigger value="m" className="rounded-xl px-8 h-10 data-[state=active]:bg-black data-[state=active]:text-white text-[9px] font-black uppercase tracking-widest transition-all">Metric (m)</TabsTrigger>
              <TabsTrigger value="in" className="rounded-xl px-8 h-10 data-[state=active]:bg-black data-[state=active]:text-white text-[9px] font-black uppercase tracking-widest transition-all">Imperial (in)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left: Input Walls */}
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100"><Ruler className="w-6 h-6 text-black" /></div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">Wall Dimensions</h2>
               </div>
              <Button 
                onClick={addWall} 
                variant="outline" 
                className="rounded-2xl border-gray-200 bg-white hover:bg-gray-50 text-black font-black uppercase text-[9px] tracking-widest px-6 h-12 shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Wall
              </Button>
            </div>

            <AnimatePresence mode="popLayout">
              {walls.map((wall, index) => (
                <motion.div
                  key={wall.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative bg-gray-50/50 border border-gray-100 p-8 rounded-[2.5rem] hover:bg-white hover:shadow-xl hover:border-gray-200 transition-all duration-500"
                >
                  <div className="flex flex-wrap items-end gap-10">
                    <div className="w-14 h-14 rounded-[1.25rem] bg-black text-white flex items-center justify-center text-lg font-black italic shadow-lg shadow-black/10">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-[140px]">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 block">
                        Width ({unit})
                      </Label>
                      <Input 
                        type="number"
                        value={wall.width}
                        onChange={(e) => updateWall(wall.id, 'width', e.target.value)}
                        className="bg-transparent border-0 border-b-2 border-gray-100 rounded-none h-14 text-4xl font-black tracking-tighter italic text-black focus-visible:ring-0 focus-visible:border-black transition-all placeholder:text-gray-100"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex-1 min-w-[140px]">
                      <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 block">
                        Height ({unit})
                      </Label>
                      <Input 
                        type="number"
                        value={wall.height}
                        onChange={(e) => updateWall(wall.id, 'height', e.target.value)}
                        className="bg-transparent border-0 border-b-2 border-gray-100 rounded-none h-14 text-4xl font-black tracking-tighter italic text-black focus-visible:ring-0 focus-visible:border-black transition-all placeholder:text-gray-100"
                        placeholder="0.00"
                      />
                    </div>

                    {walls.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeWall(wall.id)}
                        className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl w-14 h-14 transition-all"
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="bg-blue-50 border border-blue-100 p-8 rounded-[3rem] flex items-start gap-6 shadow-sm">
              <div className="bg-white p-4 rounded-2xl shadow-sm"><Info className="w-6 h-6 text-blue-600" /></div>
              <div className="text-sm leading-relaxed">
                <p className="font-black uppercase text-[10px] tracking-widest text-blue-600 mb-2">Smart Waste Calculation</p>
                <p className="text-blue-900/70 font-light">
                   We apply a <span className="font-bold text-blue-600">15% extra material factor</span> automatically. This ensures perfect pattern matching and professional corner finishes across all SYSTEXX products.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-28">
              <Card className="bg-white border-gray-100 rounded-[3.5rem] overflow-hidden shadow-2xl border">
                <CardContent className="p-12">
                  <div className="flex items-center justify-between mb-10">
                     <h3 className="text-3xl font-black italic uppercase tracking-tighter">Summary</h3>
                     <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>

                  {wallpaper && (
                    <div className="flex items-center gap-8 mb-12 p-6 rounded-[2rem] bg-gray-50 border border-gray-100">
                      <div className="relative w-28 h-28 rounded-[1.5rem] overflow-hidden border border-white shadow-lg shrink-0">
                        <Image 
                          src={parseProductImage(wallpaper)} 
                          alt={wallpaper.name} 
                          fill 
                          className="object-cover" 
                          unoptimized
                        />
                      </div>
                      <div className="flex-1">
                        <Badge className="bg-white text-blue-600 border border-blue-50 font-black text-[8px] uppercase tracking-widest px-3 py-1 mb-2 shadow-sm">
                          {wallpaper.sku}
                        </Badge>
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{wallpaper.name}</h4>
                        <p className="text-gray-400 text-sm mt-2 font-bold">${pricePerRoll.toFixed(2)} <span className="text-[10px] uppercase font-black tracking-widest">/ ROLL</span></p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6 mb-12">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Net Surface Area</span>
                      <span className="text-xl font-bold text-gray-900">{rawArea.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Total incl. Waste</span>
                      <span className="text-xl font-bold text-gray-900">{totalAreaWithWaste.toFixed(2)} m²</span>
                    </div>
                    <div className="pt-10 border-t border-gray-100 flex justify-between items-end">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">Estimated Material Cost</div>
                        <div className="text-6xl font-black italic tracking-tighter text-gray-900">${estimatedTotal.toFixed(2)}</div>
                      </div>
                      <div className="text-gray-300 text-xs mb-3 font-black">USD</div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCheckout} 
                    disabled={estimatedTotal <= 0 || isProcessingCheckout}
                    className="w-full h-24 rounded-[2.5rem] bg-black hover:bg-gray-800 text-white text-2xl font-black italic uppercase tracking-tighter shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group"
                  >
                    {isProcessingCheckout ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <div className="flex items-center gap-4">
                        Proceed to Payment <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                      </div>
                    )}
                  </Button>

                  <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        disabled={estimatedTotal <= 0}
                        className="w-full h-16 rounded-[2.5rem] border-gray-200 bg-white hover:bg-gray-50 text-black text-sm font-black uppercase tracking-widest mt-4 transition-all"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {locale === 'es' ? 'Solicitar cotización de instalación' : 'Request Installation Quote'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg rounded-3xl p-8">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">
                          {locale === 'es' ? 'Cotización de instalación' : 'Installation Quote'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                          {locale === 'es'
                            ? 'Cuéntanos tus datos y uno de nuestros especialistas te enviará una cotización con instalación incluida.'
                            : 'Share your details and one of our specialists will send you a quote with installation included.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                              {locale === 'es' ? 'Nombre completo *' : 'Full name *'}
                            </Label>
                            <Input
                              className="mt-1"
                              value={quoteForm.customerName}
                              onChange={(e) => setQuoteForm({ ...quoteForm, customerName: e.target.value })}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                              Email *
                            </Label>
                            <Input
                              type="email"
                              className="mt-1"
                              value={quoteForm.customerEmail}
                              onChange={(e) => setQuoteForm({ ...quoteForm, customerEmail: e.target.value })}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                              {locale === 'es' ? 'Teléfono' : 'Phone'}
                            </Label>
                            <Input
                              className="mt-1"
                              value={quoteForm.customerPhone}
                              onChange={(e) => setQuoteForm({ ...quoteForm, customerPhone: e.target.value })}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                              {locale === 'es' ? 'Dirección' : 'Address'}
                            </Label>
                            <Input
                              className="mt-1"
                              value={quoteForm.address1}
                              onChange={(e) => setQuoteForm({ ...quoteForm, address1: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                              {locale === 'es' ? 'Ciudad' : 'City'}
                            </Label>
                            <Input
                              className="mt-1"
                              value={quoteForm.city}
                              onChange={(e) => setQuoteForm({ ...quoteForm, city: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                {locale === 'es' ? 'Estado' : 'State'}
                              </Label>
                              <Input
                                className="mt-1"
                                value={quoteForm.state}
                                onChange={(e) => setQuoteForm({ ...quoteForm, state: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">ZIP</Label>
                              <Input
                                className="mt-1"
                                value={quoteForm.zip}
                                onChange={(e) => setQuoteForm({ ...quoteForm, zip: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                              {locale === 'es' ? 'Notas (opcional)' : 'Notes (optional)'}
                            </Label>
                            <Textarea
                              className="mt-1"
                              rows={2}
                              value={quoteForm.notes}
                              onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 text-sm">
                          <p className="text-gray-500">
                            {locale === 'es'
                              ? `~${rollsNeeded} rollos estimados — Material $${estimatedTotal.toFixed(2)} + instalación profesional`
                              : `~${rollsNeeded} estimated rolls — Material $${estimatedTotal.toFixed(2)} + professional installation`}
                          </p>
                        </div>
                        <Button
                          className="w-full h-14 rounded-2xl bg-black hover:bg-gray-800 text-white font-black uppercase tracking-widest"
                          onClick={handleQuoteRequest}
                          disabled={quoteSending}
                        >
                          {quoteSending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              {locale === 'es' ? 'Enviar solicitud' : 'Send request'}
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <div className="mt-10 flex flex-col items-center gap-6">
                    <div className="flex gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                       <Image src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" width={50} height={20} />
                       <Image src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" width={70} height={20} />
                    </div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em] font-black text-center">Encrypted & Secure Material Quote</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex flex-col justify-center items-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-black mb-4" /><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading...</p></div>}>
      <CalculatorContent />
    </Suspense>
  );
}
