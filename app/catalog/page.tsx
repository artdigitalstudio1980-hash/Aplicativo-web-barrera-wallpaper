'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Loader2, Wand2, ShoppingCart, 
  Ruler, Info, ChevronRight, X,
  Sparkles, ShieldCheck, Flame, Zap, Droplets,
  Calculator, ArrowRight, Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// --- DATA CONFIGURATION ---
const ADS = [
  { src: '/catalogo/active-magnetic-whiteboard-description.png', title: 'SYSTEXX Active', desc: 'Magnetic walls and whiteboard surfaces for interactive spaces.' },
  { src: '/catalogo/active-absorb-description.png', title: 'Acoustic Comfort', desc: 'Reduce noise levels with our sound-absorbing glass textile.' },
  { src: '/catalogo/phantasy-description.png', title: 'Phantasy Designs', desc: 'Exclusive patterns for sophisticated interior architectural statements.' },
];

const CATEGORIES = [
  { id: 'all', name: 'All Collections', slug: 'all' },
  { id: 'pure', name: 'Pure', slug: 'pure' },
  { id: 'active', name: 'Active', slug: 'active' },
  { id: 'phantasy', name: 'Phantasy', slug: 'phantasy' },
];

export default function CatalogPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adIndex, setAdIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
    const timer = setInterval(() => setAdIndex((prev) => (prev + 1) % ADS.length), 7000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.slug === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(p =>
        (p.nameEs || p.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const handleOpenSimulador = (productId: string) => {
    router.push(`/design/?wallpaperId=${productId}`);
  };

  const handleOpenCalculator = (productId: string) => {
    router.push(`/calculator/?wallpaperId=${productId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
        <p className="text-sm font-bold tracking-widest uppercase">Initializing Virtual Showroom...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- LUXURY SCROLL ADVERTISING (TOP) --- */}
        <div className="relative h-[300px] md:h-[400px] rounded-[3rem] overflow-hidden mb-12 shadow-2xl group">
          <AnimatePresence mode="wait">
            <motion.div
              key={adIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <Image 
                src={ADS[adIndex].src} 
                alt={ADS[adIndex].title} 
                fill 
                className="object-cover brightness-90"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10 md:p-16">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 inline-block">
                    SYSTEXX Technology
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase italic">
                    {ADS[adIndex].title}
                  </h2>
                  <p className="text-gray-200 text-lg max-w-2xl font-light">
                    {ADS[adIndex].desc}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-10 right-10 flex gap-3">
            {ADS.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setAdIndex(i)}
                className={`h-1 rounded-full transition-all duration-500 ${adIndex === i ? 'w-12 bg-white' : 'w-3 bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* --- STORE HEADER & FILTERS --- */}
        <div className="flex flex-col gap-10 mb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">
                Virtual <span className="text-gray-400">Showroom</span>
              </h1>
              <p className="text-gray-500 max-w-md font-light">
                Explore the exclusive German SYSTEXX collection. 
                Pure aesthetics, functional excellence, and creative freedom.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search wallpaper..." 
                  className="pl-12 h-14 w-full sm:w-[350px] rounded-full border-gray-100 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link href="/design/">
                <Button className="h-14 px-8 rounded-full bg-black text-white hover:bg-gray-800 gap-3 shadow-xl transition-all hover:scale-105">
                  <Wand2 className="w-5 h-5" />
                  <span className="font-bold uppercase text-xs tracking-widest">AI Designer</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* CATEGORY TABS */}
          <div className="flex flex-wrap gap-3 border-b border-gray-100 pb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat.slug 
                    ? 'bg-black text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProducts.map((product, idx) => {
            const imgUrl = product.images?.[0] || '/images/placeholder.png';
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative flex flex-col bg-white"
              >
                <div 
                  className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-gray-50 mb-6 cursor-pointer shadow-sm group-hover:shadow-2xl transition-all duration-700"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Image 
                    src={imgUrl} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    unoptimized
                  />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-8 text-center backdrop-blur-[2px]">
                    <Maximize2 className="w-8 h-8 text-white mb-2" />
                    <p className="text-white font-black text-xs uppercase tracking-widest">Quick View</p>
                  </div>

                  <div className="absolute top-6 right-6">
                    <Badge className="bg-white/90 backdrop-blur-md text-black border-none font-black text-[9px] uppercase tracking-tighter px-3 py-1">
                      {product.category.name}
                    </Badge>
                  </div>
                </div>

                <div className="px-2 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic leading-tight group-hover:text-blue-600 transition-colors truncate">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">{product.sku}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="text-xl font-black text-gray-900">${product.price.toFixed(2)}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedProduct(product)}
                      className="rounded-full h-8 px-4 text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-gray-100"
                    >
                      Details <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-40 text-center">
            <Info className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-gray-900 uppercase italic">No wallpapers found</h3>
            <p className="text-gray-400">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* --- PRODUCT DETAIL MODAL --- */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white border-none rounded-[3rem] shadow-2xl">
          {selectedProduct && (
            <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto md:overflow-hidden">
              {/* Image Side */}
              <div className="relative w-full md:w-[55%] aspect-square md:aspect-auto h-[400px] md:h-auto bg-gray-100 group">
                <Image 
                  src={selectedProduct.images?.[0] || '/images/placeholder.png'} 
                  alt={selectedProduct.name} 
                  fill 
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-8 left-8 flex flex-col gap-2">
                   <Badge className="bg-black text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-2">
                    {selectedProduct.category.name} Collection
                  </Badge>
                  {selectedProduct.sku.includes('ACT') && (
                    <Badge className="bg-blue-600 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-2">
                      Technical Performance
                    </Badge>
                  )}
                </div>
              </div>

              {/* Info Side */}
              <div className="flex-1 p-8 md:p-12 flex flex-col justify-between bg-white relative">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 transition-colors md:hidden"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] text-gray-400 font-mono tracking-[0.3em] uppercase mb-2">{selectedProduct.sku}</p>
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-4">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-3xl font-black text-gray-900">${selectedProduct.price.toFixed(2)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Material</p>
                      <p className="text-sm font-bold text-gray-800">{selectedProduct.material || 'Premium Glass Textile'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dimensions</p>
                      <p className="text-sm font-bold text-gray-800">{selectedProduct.dimensions || '1m x 25m'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Origin</p>
                      <p className="text-sm font-bold text-gray-800">Germany (Vitrulan)</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rating</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => <Sparkles key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-500 leading-relaxed font-light">
                      Professional-grade wallcovering engineered for durability and style. 
                      Suitable for both residential and high-traffic commercial environments. 
                      Impact resistant, fire rated, and Oeko-Tex certified.
                    </p>
                  </div>
                </div>

                {/* Bottom Buttons Barra */}
                <div className="mt-12 space-y-3">
                  <Button 
                    onClick={() => handleOpenSimulador(selectedProduct.id)}
                    className="w-full h-16 rounded-2xl bg-black text-white hover:bg-gray-800 font-black uppercase text-xs tracking-[0.2em] gap-3 shadow-xl group/sim"
                  >
                    <Wand2 className="w-5 h-5 group-hover/sim:animate-pulse" />
                    Open Simulador
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => handleOpenCalculator(selectedProduct.id)}
                      className="flex-1 h-16 rounded-2xl border-gray-200 hover:bg-gray-50 text-black font-black uppercase text-[10px] tracking-widest gap-2"
                    >
                      <Calculator className="w-4 h-4" />
                      Calculadora
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 h-16 rounded-2xl border-gray-200 hover:bg-gray-50 text-black font-black uppercase text-[10px] tracking-widest gap-2"
                      onClick={() => router.push(`/cart/?add=${selectedProduct.id}`)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Buy Direct
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
