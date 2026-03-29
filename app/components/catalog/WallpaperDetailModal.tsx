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
    weight?: string;
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

          {/* --- INFO PANEL --- */}
          <div className="w-full md:w-[450px] flex flex-col bg-white overflow-y-auto border-l border-zinc-100">
            <div className="p-8 md:p-12 space-y-10 flex-1">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black px-4 py-1.5 rounded-full text-white uppercase tracking-widest ${label.color}`}>
                    {label.name}
                  </span>
                  <span className="text-[10px] text-gray-300 font-mono tracking-widest uppercase">/ {product.sku}</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.85]">
                  {product.name}
                </h2>
                {product.price && (
                  <p className="text-3xl font-black text-blue-600 tracking-tighter mt-4">${product.price.toFixed(2)}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-all">
                    <Ruler className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Dimensions</p>
                    <p className="text-base font-bold text-gray-900 tracking-tight">{product.dimensions || '1.00 x 25.00 m'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-all">
                    <Maximize2 className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Weight / Density</p>
                    <p className="text-base font-bold text-gray-900 tracking-tight">{product.weight || '225 g/m²'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-all shrink-0">
                    <Info className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">Description</p>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                      {product.description || 'Premium German-engineered glass fiber wallcovering. Durable, impact-resistant, and aesthetically unmatched.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Calculator Section */}
              <div className="pt-10 border-t border-gray-100">
                <Link href={`/calculator/?wallpaperId=${product.id}`}>
                  <Button variant="outline" className="w-full h-20 rounded-[2rem] border-2 border-dashed border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Calculator className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-black uppercase text-xs tracking-widest text-gray-900">Roll Calculator</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Calculadora de Rollos</p>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>

            {/* --- BOTTOM BAR: SIMULATOR --- */}
            <div className="p-8 bg-zinc-900 mt-auto">
              <Link href={`/design/?wallpaperId=${product.id}`} className="w-full block">
                <Button className="w-full h-20 rounded-[2rem] bg-white text-black hover:bg-blue-600 hover:text-white transition-all gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 active:scale-95 group overflow-hidden relative">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-4 z-10"
                  >
                    <Wand2 className="w-7 h-7" />
                    <span className="font-black uppercase text-base tracking-[0.25em] italic">Open Simulador</span>
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 -translate-x-full" />
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
