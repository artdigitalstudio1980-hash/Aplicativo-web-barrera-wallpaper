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
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse tracking-widest uppercase">Verifying Order...</p>
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
            ORDER <span className="text-gray-400 italic">CONFIRMED!</span>
          </h1>
          <p className="text-gray-500 text-lg mb-12 max-w-xl mx-auto">
            {locale === 'es' 
              ? 'Gracias por confiar en Barrera Wallpaper. Tu pedido está siendo procesado.' 
              : 'Thank you for choosing Barrera Wallpaper. Your order is being processed.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 bg-gray-50 p-10 rounded-[2rem] border border-gray-100">
          <div className="text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
            <p className="font-bold">In Preparation</p>
          </div>
          <div className="text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warranty</p>
            <p className="font-bold">10 Years</p>
          </div>
          <div className="text-center">
            <Download className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Invoice</p>
            <button className="font-bold text-black hover:underline">Download PDF</button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/catalog">
            <Button variant="outline" className="rounded-full px-10 h-14 font-bold border-gray-200">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/catalog">
            <Button className="rounded-full px-12 h-14 bg-black text-white font-bold shadow-xl">
              Back to Showroom
            </Button>
          </Link>
        </div>

        <p className="mt-16 text-gray-400 text-xs uppercase tracking-[0.2em]">
          Barrera Wallpaper — Miami & Germany
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
