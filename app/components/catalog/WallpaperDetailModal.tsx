'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Wand2, Calculator, Ruler, Hash, 
  Info, Maximize2, ShoppingCart, Layers 
} from 'lucide-react';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface WallpaperDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    sku: string;
    imageUrl: string;
    type: 'pure' | 'active' | 'phantasy';
    dimensions?: string;
    description?: string;
    price?: number;
  } | null;
}

export function WallpaperDetailModal({ isOpen, onClose, product }: WallpaperDetailModalProps) {
  if (!product) return null;

  const typeLabels = {
    pure: { name: 'SYSTEXX Pure', color: 'bg-blue-500' },
    active: { name: 'SYSTEXX Active', color: 'bg-orange-500' },
    phantasy: { name: 'SYSTEXX Phantasy', color: 'bg-purple-500' },
  };

  const label = typeLabels[product.type] || { name: 'Premium Collection', color: 'bg-black' };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-[75vw] h-[90vh] p-0 overflow-hidden border-none bg-black/95 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row h-full">
          
          {/* --- LEFT: FULL IMAGE VIEW --- */}
          <div className="relative flex-1 bg-zinc-900 overflow-hidden">
            <motion.div 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full h-full"
            >
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </motion.div>
            
            {/* Overlay badge */}
            <div className="absolute top-6 left-6 z-10">
              <span className={`${label.color} text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg`}>
                {label.name}
              </span>
            </div>
          </div>

          {/* --- RIGHT: INFO PANEL --- */}
          <div className="w-full md:w-[400px] flex flex-col bg-white overflow-y-auto">
            <div className="p-8 md:p-12 space-y-10 flex-1">
              <div className="space-y-2">
                <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">{product.sku}</p>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-tight">
                  {product.name}
                </h2>
                {product.price && (
                  <p className="text-2xl font-black text-blue-600 mt-2">${product.price.toFixed(2)}</p>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <Layers className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Paper Type</p>
                    <p className="text-sm font-bold text-gray-900 uppercase italic">{label.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <Ruler className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Measurements</p>
                    <p className="text-sm font-bold text-gray-900">{product.dimensions || '1.00 x 25.00 m'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                    <Info className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Description</p>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-[280px]">
                      {product.description || 'Premium German-engineered glass fiber wallcovering. Durable, impact-resistant, and aesthetically unmatched.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Calculator Section */}
              <div className="pt-8 border-t border-gray-100">
                <Link href={`/calculator/?wallpaperId=${product.id}`}>
                  <Button variant="outline" className="w-full h-16 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all gap-3 group">
                    <Calculator className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    <span className="font-black uppercase text-xs tracking-widest text-gray-600 group-hover:text-blue-600">Calculadora de Rollos</span>
                  </Button>
                </Link>
                <p className="text-[10px] text-gray-400 text-center mt-4">Compra directa sin simulación previa</p>
              </div>
            </div>

            {/* --- BOTTOM BAR: SIMULATOR --- */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
              <Link href={`/design/?wallpaperId=${product.id}`} className="w-full block">
                <Button className="w-full h-16 rounded-2xl bg-black text-white hover:bg-blue-600 transition-all gap-4 shadow-xl transform hover:-translate-y-1 active:scale-95 group">
                  <Wand2 className="w-6 h-6 animate-pulse" />
                  <span className="font-black uppercase text-sm tracking-[0.2em]">Open Simulador</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Custom close button over the black part */}
        <DialogClose className="absolute right-6 top-6 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all">
          <X className="w-6 h-6" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
