'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/store/use-cart';
import { useLocale } from '@/components/locale-context';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const { locale } = useLocale();
  const [loading, setLoading] = useState(true);
  const orderNumber = searchParams.get('order');

  useEffect(() => {
    if (clearCart) {
      clearCart();
    }
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-sm font-bold animate-pulse tracking-widest uppercase">
          {locale === 'es' ? 'Confirmando orden...' : 'Confirming Order...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-white text-black">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase">
            {locale === 'es' ? 'ORDEN CONFIRMADA' : 'ORDER CONFIRMED'}
            <span className="text-gray-400 italic">!</span>
          </h1>
          {orderNumber && (
            <p className="text-lg text-gray-500 mb-2 font-mono">#{orderNumber}</p>
          )}
          <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
            {locale === 'es'
              ? 'Gracias por confiar en Barrera Wallpaper. Recibirás un email de confirmación con los detalles de tu orden.'
              : 'Thank you for choosing Barrera Wallpaper. You\'ll receive a confirmation email with your order details.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 text-center">
            <Package className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{locale === 'es' ? 'Estado' : 'Status'}</p>
            <p className="font-bold text-lg">{locale === 'es' ? 'En preparación' : 'In Preparation'}</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 text-center">
            <ShoppingBag className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{locale === 'es' ? 'Garantía' : 'Warranty'}</p>
            <p className="font-bold text-lg">10 Years</p>
          </div>
          <div className="bg-yellow-50 p-8 rounded-[2rem] border border-yellow-100 text-center">
            <Gift className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
            <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest">{locale === 'es' ? '¿Nuevo cliente?' : 'New Customer?'}</p>
            <Link href="/register" className="font-bold text-lg text-black underline hover:no-underline">
              {locale === 'es' ? 'Regístrate y obtén 10% OFF' : 'Register & get 10% OFF'}
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/catalog">
            <Button variant="outline" className="rounded-full px-10 h-14 font-bold border-gray-200">
              {locale === 'es' ? 'Seguir comprando' : 'Continue Shopping'}
            </Button>
          </Link>
          <Link href="/catalog">
            <Button className="rounded-full px-12 h-14 bg-black text-white font-bold shadow-xl">
              {locale === 'es' ? 'Volver al showroom' : 'Back to Showroom'}
            </Button>
          </Link>
        </div>

        <p className="mt-16 text-gray-400 text-xs uppercase tracking-[0.2em]">
          Barrera Wallpaper &mdash; Miami & Germany
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
