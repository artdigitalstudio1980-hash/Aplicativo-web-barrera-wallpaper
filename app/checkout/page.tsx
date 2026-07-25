'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/store/use-cart';
import { 
  ArrowLeft, CreditCard, ShieldCheck, Truck, 
  Info, Loader2, CheckCircle2, AlertCircle,
  Package, Ruler, Trash2, Plus, Minus, Clock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import PromoBanner from '@/components/promo-banner';

// Purchase Configuration
const MIN_AREA_CALCULATOR = 5; 

export default function UnifiedCheckoutPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, clearCart, needsInstallation, setNeedsInstallation } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  
  const subtotal = getTotal();
  const shipping = subtotal > 500 ? 0 : 50; 
  const total = subtotal + shipping;

  const hasIncompleteItems = items.some(item => {
    if (item.measurements && item.measurements.area < MIN_AREA_CALCULATOR) return true;
    return false;
  });

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (hasIncompleteItems) {
      toast.error(`Minimum order is ${MIN_AREA_CALCULATOR}m² for custom cuts.`);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/checkout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          needsInstallation,
          items: items.map(item => ({
            wallpaperId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            measurements: item.measurements
          })),
        }),
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        const errorMsg = data.error || `Checkout failed (${res.status})`;
        toast.error(errorMsg, {
          description: paymentMethod === 'stripe' 
            ? 'Please try PayPal or contact support.' 
            : 'Please try Stripe or contact support.',
          duration: 6000,
        });
        setIsProcessing(false);
        return;
      }

      // Determine redirect URL based on payment method
      const redirectUrl = paymentMethod === 'stripe' ? data.data?.url : data.data?.approvalUrl;
      
      if (redirectUrl) {
        toast.success('Redirecting to secure payment...', { duration: 3000 });
        setTimeout(() => { window.location.href = redirectUrl; }, 500);
        return;
      } else {
        toast.error('Payment gateway did not return a redirect URL. Please try another method.', { duration: 6000 });
        setIsProcessing(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Network error. Please check your connection and try again.', { duration: 6000 });
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 p-4">
        <Package className="w-20 h-20 text-gray-100 mb-8" />
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-6">Your Cart is Empty</h1>
        <Button onClick={() => router.push('/catalog')} className="h-14 px-10 rounded-2xl bg-black text-white hover:bg-gray-800 uppercase text-[10px] font-black tracking-widest shadow-xl">
          Back to Collections
        </Button>
        <div className="mt-12 w-full max-w-md">
          <PromoBanner variant="card" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white text-gray-900 selection:bg-black selection:text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Side: Cart Review */}
          <div className="lg:flex-1 space-y-12">
            <div>
              <Button 
                variant="ghost" 
                className="pl-0 text-gray-400 hover:text-black hover:bg-transparent mb-6 group"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                Return to Shop
              </Button>
              <h1 className="text-7xl font-black tracking-tighter italic uppercase leading-none">
                Checkout <span className="text-gray-200">.</span>
              </h1>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                 <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Items in your cart</h2>
                 <div className="h-[1px] flex-1 bg-gray-50" />
              </div>
              
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-gray-50/50 border border-gray-100 p-6 md:p-8 rounded-[2.5rem] group hover:bg-white hover:shadow-xl hover:border-gray-200 transition-all duration-500"
                  >
                    <div className="flex flex-col sm:flex-row gap-8">
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge className="bg-white text-gray-400 border border-gray-100 font-black text-[8px] uppercase tracking-widest px-3 py-1 mb-2">
                                {item.sku}
                              </Badge>
                              <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </h3>
                            </div>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          {item.measurements && (
                            <div className="flex flex-wrap gap-3 mt-4">
                              <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 text-[9px] uppercase font-black text-gray-500 flex items-center gap-2 shadow-sm">
                                <Ruler className="w-3 h-3" />
                                {item.measurements.area.toFixed(2)} m²
                              </div>
                              {item.measurements.area < MIN_AREA_CALCULATOR && (
                                <div className="bg-red-50 text-red-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
                                  <AlertCircle className="w-3 h-3" />
                                  Minimum {MIN_AREA_CALCULATOR}m² required
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                          <div className="flex items-center gap-4 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-400 hover:text-black transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-gray-400 hover:text-black transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Item Total</span>
                             <span className="text-3xl font-black italic tracking-tighter">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* --- INSTALLATION OPTION (WHITE THEME) --- */}
            <div className="bg-blue-50/30 border border-blue-100 p-8 rounded-[3rem] group hover:bg-blue-50 transition-all duration-500">
              <div className="flex items-start gap-6">
                <div className="pt-1">
                  <Checkbox 
                    id="installation" 
                    checked={needsInstallation}
                    onCheckedChange={(checked) => setNeedsInstallation(!!checked)}
                    className="w-8 h-8 rounded-xl border-blue-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-lg"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="installation" className="text-2xl font-black uppercase tracking-tighter cursor-pointer text-gray-900">
                    Professional Installation <span className="text-blue-600 italic">BY BARRERA</span>
                  </label>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed font-light max-w-xl">
                    Need expert labor in Miami? Select this option and we will schedule a site visit to provide a separate installation quote.
                  </p>
                  {needsInstallation && (
                    <div className="mt-6 p-5 bg-white rounded-2xl border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
                      <Clock className="w-5 h-5" />
                      Labor quoted separately via official appointment
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quality Seals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-10">
              <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] flex items-center gap-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm"><ShieldCheck className="w-8 h-8 text-blue-600" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">German Engineering</p>
                  <p className="text-sm font-bold text-gray-800 italic">SYSTEXX Certified.</p>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] flex items-center gap-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm"><Truck className="w-8 h-8 text-black" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Secure Delivery</p>
                  <p className="text-sm font-bold text-gray-800 italic">Insured shipping.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Payment Panel */}
          <div className="lg:w-[450px]">
            <div className="sticky top-28">
              <Card className="bg-white border-gray-100 rounded-[3.5rem] overflow-hidden shadow-2xl border">
                <CardContent className="p-12">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                      Order Summary
                    </h3>
                    <CreditCard className="w-8 h-8 text-blue-600" />
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Material Subtotal</span>
                      <span className="text-xl font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Estimated Shipping</span>
                      <span className="text-xl font-bold text-gray-900">
                        {shipping === 0 ? <span className="text-blue-600 italic">FREE</span> : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="pt-10 border-t border-gray-100 flex justify-between items-end">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-2">Total to Pay Now</div>
                        <div className="text-6xl font-black italic tracking-tighter text-gray-900">${total.toFixed(2)}</div>
                      </div>
                      <div className="text-gray-300 text-xs mb-3 font-black">USD</div>
                    </div>
                  </div>

                  <PromoBanner variant="card" />

                  {/* Provider Selector */}
                  <div className="space-y-4 mb-10">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Secure Payment Method</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setPaymentMethod('stripe')}
                        className={`group p-6 rounded-3xl border transition-all duration-500 flex flex-col items-center gap-2 ${
                          paymentMethod === 'stripe' ? 'bg-black border-black shadow-xl' : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <Image 
                          src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" 
                          alt="Stripe" width={70} height={25} 
                          className={`h-6 w-auto transition-all ${paymentMethod === 'stripe' ? 'invert' : 'opacity-40 group-hover:opacity-100'}`} 
                        />
                      </button>

                      <button
                        onClick={() => setPaymentMethod('paypal')}
                        className={`group p-6 rounded-3xl border transition-all duration-500 flex flex-col items-center gap-2 ${
                          paymentMethod === 'paypal' ? 'bg-[#ffc439] border-[#ffc439] shadow-xl' : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <Image 
                          src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" 
                          alt="PayPal" width={70} height={25} 
                          className={`h-6 w-auto transition-all ${paymentMethod === 'paypal' ? '' : 'grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0'}`} 
                        />
                      </button>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCheckout} 
                    disabled={isProcessing}
                    className={`w-full h-24 rounded-[2.5rem] text-2xl font-black italic uppercase tracking-tighter shadow-2xl transition-all hover:scale-[1.02] active:scale-95 ${
                      paymentMethod === 'paypal' 
                        ? 'bg-[#ffc439] hover:bg-[#ffb700] text-blue-900 shadow-[#ffc439]/20' 
                        : 'bg-black hover:bg-gray-800 text-white shadow-black/20'
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-4">
                        Pay ${total.toFixed(2)} <ArrowRight className="w-8 h-8" />
                      </span>
                    )}
                  </Button>
                  
                  <div className="mt-10 flex flex-col items-center gap-6">
                    <div className="flex gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                       <Image src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" width={40} height={20} />
                       <Image src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width={30} height={20} />
                    </div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em] font-black">Encrypted & Secure Transaction</p>
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
