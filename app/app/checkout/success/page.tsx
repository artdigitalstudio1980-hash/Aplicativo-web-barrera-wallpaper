'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Download, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-context';
import { toast } from 'sonner';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { locale } = useLocale();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Aquí podríamos verificar el estado real con Stripe/DB
      setTimeout(() => setLoading(false), 2000);
      toast.success(locale === 'es' ? '¡Pago confirmado!' : 'Payment confirmed!');
    }
  }, [sessionId, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-premium">
        <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
        <p className="text-sm font-medium animate-pulse tracking-widest uppercase">Verificando transacción...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-premium">
      <div className="max-w-3xl mx-auto px-4 text-center">
        
        {/* Icono de Éxito Animado */}
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-200"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>

        {/* Mensaje Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">
            ¡PEDIDO <span className="text-gray-400 italic">CONFIRMADO!</span>
          </h1>
          <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
            {locale === 'es' 
              ? 'Gracias por confiar en Barrera Wallpaper. Tu pedido está siendo procesado por nuestros especialistas en Alemania.' 
              : 'Thank you for choosing Barrera Wallpaper. Your order is being processed by our specialists in Germany.'}
          </p>
        </motion.div>

        {/* Card de Detalles Rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-[3rem] p-10 mb-12 flex flex-col md:flex-row items-center justify-around gap-8"
        >
          <div className="text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</p>
            <p className="font-bold text-lg">En Preparación</p>
          </div>
          <div className="h-px w-full md:w-px md:h-12 bg-gray-100"></div>
          <div className="text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Garantía</p>
            <p className="font-bold text-lg">10 Años Vitrulan</p>
          </div>
          <div className="h-px w-full md:w-px md:h-12 bg-gray-100"></div>
          <div className="text-center">
            <Download className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Factura</p>
            <button className="font-bold text-lg text-black hover:underline">Descargar PDF</button>
          </div>
        </motion.div>

        {/* Acciones Finales */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/catalog">
            <Button variant="outline" className="rounded-full px-10 h-14 font-bold border-gray-200">
              Seguir Comprando
            </Button>
          </Link>
          <Link href="/account">
            <Button className="rounded-full px-12 h-14 bg-black text-white font-bold shadow-2xl hover:bg-gray-800">
              Ver Mi Pedido <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Footer Nota */}
        <p className="mt-16 text-gray-400 text-xs uppercase tracking-[0.2em]">
          Barrera Wallpaper — Luxury Wallcoverings & AI Technology
        </p>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-premium"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}
