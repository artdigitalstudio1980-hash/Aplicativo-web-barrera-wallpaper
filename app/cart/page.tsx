
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/lib/store/use-cart';
import { useLocale } from '@/components/locale-context';
import { 
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  ShoppingBag,
  Info
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { items, removeItem, updateQuantity, getTotal, needsInstallation, setNeedsInstallation } = useCart();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const subtotal = getTotal();
  const shipping = subtotal > 500 || items.length === 0 ? 0 : 50;
  const tax = subtotal * 0.07; // Florida Sales Tax average
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 p-4">
        <ShoppingBag className="w-20 h-20 text-gray-100 mb-8" />
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-6">Your Cart is Empty</h1>
        <Button onClick={() => router.push('/catalog')} className="h-14 px-10 rounded-2xl bg-black text-white hover:bg-gray-800 uppercase text-[10px] font-black tracking-widest shadow-xl">
          Start Exploring
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white text-gray-900 selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Main Cart Area */}
          <div className="lg:flex-1 space-y-12">
            <div>
              <Button 
                variant="ghost" 
                className="pl-0 text-gray-400 hover:text-black hover:bg-transparent mb-6 group"
                onClick={() => router.push('/catalog')}
              >
                <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
                Back to Catalog
              </Button>
              <h1 className="text-7xl font-black tracking-tighter italic uppercase leading-none">
                Shopping <span className="text-gray-200">Cart</span>
              </h1>
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
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
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          
                          {item.measurements && (
                            <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              <span className="flex items-center gap-1.5"><Ruler className="w-3 h-3" /> {item.measurements.width}x{item.measurements.height}{item.measurements.unit}</span>
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md">{item.measurements.area} {item.measurements.unit}²</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-8">
                          <div className="flex items-center bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-lg"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-10 text-center text-sm font-black">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-lg"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-2xl font-black tracking-tighter">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-[400px] shrink-0">
            <div className="sticky top-32 space-y-8">
              <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShoppingBag className="w-32 h-32" />
                </div>
                
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Summary</h2>
                
                <div className="space-y-4 font-light tracking-wide text-gray-400">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                    <span className="text-xl text-white font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest">Shipping</span>
                    <span className="text-xl text-white font-medium">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest">Estimated Tax</span>
                    <span className="text-xl text-white font-medium">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Due</span>
                  <span className="text-5xl font-black italic tracking-tighter">${total.toFixed(2)}</span>
                </div>

                <Button 
                  onClick={() => router.push('/checkout')}
                  className="w-full h-20 rounded-2xl bg-white text-black hover:bg-gray-200 transition-all font-black uppercase text-xs tracking-[0.2em] shadow-xl group"
                >
                  Proceed to Payment
                  <ArrowLeft className="w-5 h-5 ml-4 rotate-180 transition-transform group-hover:translate-x-2" />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center gap-3">
                  <Truck className="w-6 h-6 text-blue-600" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Global Shipping</span>
                </div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col items-center text-center gap-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Secure Payments</span>
                </div>
              </div>

              {/* Installation Notice */}
              <div className="bg-blue-50/50 border border-blue-100 p-8 rounded-[2.5rem] flex gap-5">
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-widest text-blue-900">Installation?</h4>
                  <p className="text-[11px] text-blue-700/80 leading-relaxed">
                    Professional installation is available in Miami & South Florida. Request a quote during checkout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
