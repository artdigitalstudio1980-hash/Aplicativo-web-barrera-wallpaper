'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { parseProductImage } from '@/lib/utils';
import PromoBanner from '@/components/promo-banner';
import {
  Search, Loader2, ShoppingCart, 
  Info, X, ShieldCheck, 
  Zap, Calculator, ArrowRight, 
  Maximize2, Palette,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCart } from '@/lib/store/use-cart';
import { useLocale } from '@/components/locale-context';

// --- DATA CONFIGURATION ---
const CATEGORIES_INFO: Record<string, any> = {
  'systexx-pure': {
    title: 'SYSTEXX Pure',
    subtitle: 'German Precision',
    tagline: 'High-Performance Minimalism',
    description: 'Smooth glass textiles that offer extreme durability, fire protection, and a flawless architectural finish.',
    icon: <ShieldCheck className="w-5 h-5" />,
    image: '/publicidad/review-Captura-desde-2026-03-13-16-36-53.png',
    accent: 'bg-blue-600'
  },
  'systexx-phantasy': {
    title: 'SYSTEXX Phantasy',
    subtitle: 'Designer Collection',
    tagline: 'Luxury Jacquard Patterns',
    description: 'Exclusive designs woven into the fabric for dramatic interior statements. A fusion of strength and art.',
    icon: <Palette className="w-5 h-5" />,
    image: '/publicidad/phantasy-versailles-lifestyle.png',
    accent: 'bg-purple-600'
  },
  'systexx-active': {
    title: 'SYSTEXX Active',
    subtitle: 'Functional Mastery',
    tagline: 'The Technical Revolution',
    description: 'Magnetic surfaces, acoustic comfort, and whiteboard capabilities for high-performance spaces.',
    icon: <Zap className="w-5 h-5" />,
    image: '/publicidad/active-category-overview.png',
    accent: 'bg-yellow-500'
  }
};

export default function CatalogPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const { locale, t } = useLocale();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products.filter((p: any) => p.isActive !== false));
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
      filtered = filtered.filter(p => p.category.slug.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery) {
      filtered = filtered.filter(p =>
        (p.nameEs || p.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const productsByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredProducts.forEach(p => {
      const cat = p.category.slug.toLowerCase();
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(p);
    });
    return grouped;
  }, [filteredProducts]);

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
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Loading Master Catalog</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-black selection:text-white">
      {/* --- HERO SHOWROOM --- */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-12"
          >
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 border border-black/10 rounded-full text-[10px] tracking-[0.2em] uppercase mb-6 bg-white/50 backdrop-blur-sm">
                Official Vitrulan Distributor
              </span>
              <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
                Master <span className="font-bold">Catalog</span>
              </h1>
              <p className="text-lg text-gray-500 font-light leading-relaxed">
                Explore the most advanced wall coverings in the world. From jacquard-woven designer patterns to functional magnetic and acoustic systems.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                <Input 
                  placeholder={locale === 'es' ? "Buscar papel tapiz..." : "Search collection..."}
                  className="pl-12 h-14 w-full sm:w-[320px] rounded-none border-gray-200 bg-white focus:ring-0 focus:border-black transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="h-14 px-8 rounded-none bg-black text-white hover:bg-gray-800 gap-3 shadow-xl transition-all">
                <Filter className="w-4 h-4" />
                <span className="font-bold uppercase text-[10px] tracking-widest">Filter</span>
              </Button>
            </div>
          </motion.div>

          {/* FILTER TABS */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 mt-16"
          >
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-8 py-3 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all border ${
                selectedCategory === 'all' 
                  ? 'bg-black text-white border-black shadow-lg' 
                  : 'bg-transparent text-gray-400 border-gray-200 hover:border-black hover:text-black'
              }`}
            >
              All Series
            </button>
            {Object.keys(CATEGORIES_INFO).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-8 py-3 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all border ${
                  selectedCategory === key 
                    ? 'bg-black text-white border-black shadow-lg' 
                    : 'bg-transparent text-gray-400 border-gray-200 hover:border-black hover:text-black'
                }`}
              >
                {CATEGORIES_INFO[key].title}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-gray-100 to-transparent pointer-events-none"></div>
      </section>

      {/* --- PROMO BANNER --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <PromoBanner />
      </div>

      {/* --- PRODUCT DISPLAY --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="space-y-32">
          {Object.entries(productsByCategory).map(([catSlug, catProducts], sectionIdx) => {
            const info = CATEGORIES_INFO[catSlug] || { 
              title: catSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              image: '/publicidad/cover-systexx-collection.png',
              tagline: 'Premium Series',
              description: 'Excellence in architectural wall coverings.'
            };
            
            return (
              <section key={catSlug} className="scroll-mt-32">
                {/* --- CATEGORY POSTER --- */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-0 mb-16 rounded-[2rem] overflow-hidden border border-gray-100 shadow-2xl bg-white"
                >
                  <div className="lg:col-span-7 relative h-[300px] lg:h-[500px]">
                    <Image 
                      src={info.image} 
                      alt={info.title} 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  <div className="lg:col-span-5 p-12 lg:p-16 flex flex-col justify-center">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Collection Profile</span>
                    <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-4">
                      {info.title.split(' ')[0]} <span className="font-bold">{info.title.split(' ')[1]}</span>
                    </h2>
                    <p className="text-blue-600 font-bold text-sm mb-8 tracking-wide uppercase">{info.tagline}</p>
                    <p className="text-gray-500 text-lg font-light leading-relaxed mb-10">
                      {info.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-black">
                      <div className={`w-8 h-[2px] ${info.accent || 'bg-black'}`}></div>
                      {catProducts.length} DESIGNS AVAILABLE
                    </div>
                  </div>
                </motion.div>

                {/* --- PRODUCT TILES --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {catProducts.map((product, idx) => {
                    let imgUrl = parseProductImage(product);
                    
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        viewport={{ once: true }}
                        className="group flex flex-col h-full"
                      >
                        <div 
                          className="relative aspect-[4/5] bg-gray-50 overflow-hidden cursor-pointer rounded-2xl border border-gray-100 group-hover:shadow-2xl transition-all duration-700"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Image 
                            src={imgUrl} 
                            alt={product.name} 
                            fill 
                            className="object-contain group-hover:scale-105 transition-transform duration-1000 p-2"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center backdrop-blur-[2px]">
                            <div className="flex flex-col gap-2">
                              <Button size="sm" className="rounded-none bg-white text-black hover:bg-gray-100 px-6 font-bold tracking-widest text-[9px]">
                                QUICK VIEW
                              </Button>
                              <Link href={`/products/${product.slug}`}>
                                <Button size="sm" variant="secondary" className="rounded-none bg-black text-white hover:bg-gray-800 px-6 font-bold tracking-widest text-[9px] w-full">
                                  VIEW DETAILS
                                </Button>
                              </Link>
                            </div>
                          </div>
                          
                          {/* Price Tag Overlay */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/90 backdrop-blur-md p-4 flex justify-between items-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 rounded-xl">
                              <span className="text-[9px] font-black tracking-widest text-gray-400">PRICE</span>
                              <span className="text-lg font-bold text-black">${product.price.toFixed(0)} <span className="text-[8px] font-light">/ ROLL</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-bold text-gray-400 tracking-widest">{product.sku}</span>
                            <Badge variant="outline" className="text-[8px] uppercase tracking-tighter rounded-full border-gray-200 text-gray-400">German Quality</Badge>
                          </div>
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-snug truncate group-hover:text-blue-600 transition-colors hover:underline">
                              {product.name}
                            </h3>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* --- PRODUCT DETAIL MODAL --- */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden bg-white border-none rounded-[3rem] shadow-3xl max-h-[90vh]">
          <AnimatePresence>
            {selectedProduct && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden"
              >
                {/* Image Panel */}
                <div className="relative w-full lg:w-[55%] aspect-square lg:aspect-auto bg-gray-50 shrink-0">
                  <Image 
                    src={parseProductImage(selectedProduct)}
                    alt={selectedProduct.name} 
                    fill 
                    className="object-contain p-4"
                    unoptimized
                  />
                  <div className="absolute top-8 left-8">
                     <span className="px-4 py-1 bg-black text-white text-[10px] font-bold tracking-[0.2em] rounded-full uppercase">
                       {selectedProduct.category.name}
                     </span>
                  </div>
                </div>

                {/* Info Panel */}
                <div className="flex-1 p-10 lg:p-16 flex flex-col bg-white relative lg:overflow-y-auto lg:max-h-[90vh]">
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-8 right-8 p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 transition-all z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-10">
                    <div>
                      <p className="text-[10px] text-blue-600 font-bold tracking-[0.4em] uppercase mb-4">Architectural Series</p>
                      <h2 className="text-4xl lg:text-6xl font-light tracking-tighter mb-4 leading-tight">
                        {selectedProduct.name}
                      </h2>
                      <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold text-gray-900 tracking-tighter">${selectedProduct.price.toFixed(2)}</span>
                        <span className="text-gray-400 text-xs tracking-widest uppercase font-light">USD Per Roll</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 py-10 border-y border-gray-100">
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Dimensions</p>
                        <p className="text-lg font-light text-gray-900">{selectedProduct.dimensions || '1m x 25m'}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Fire Class</p>
                        <p className="text-lg font-light text-gray-900">A2, s1, d0</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                         <Info className="w-3 h-3" /> Technical Specification
                      </h4>
                      <p className="text-gray-500 text-lg font-light leading-relaxed italic">
                        {selectedProduct.description || 'Precision-engineered German glass textile. Offering unmatched durability, fire resistance, and a sophisticated aesthetic finish for premium interiors.'}
                      </p>
                    </div>

                    <div className="pt-10 flex flex-col gap-4">
                      <Button 
                        onClick={() => handleOpenSimulador(selectedProduct.id)}
                        className="w-full h-16 rounded-none bg-black text-white hover:bg-gray-800 font-bold uppercase text-[10px] tracking-[0.3em] gap-3 shadow-2xl transition-all"
                      >
                        LAUNCH VIRTUAL SHOWROOM
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Button 
                          variant="outline"
                          onClick={() => handleOpenCalculator(selectedProduct.id)}
                          className="h-16 rounded-none border-gray-200 bg-white hover:border-black text-black font-bold uppercase text-[10px] tracking-widest gap-2"
                        >
                          <Calculator className="w-4 h-4" /> CALCULATOR
                        </Button>
                        <Button 
                          onClick={() => {
                            addItem({
                              id: selectedProduct.id,
                              name: selectedProduct.name,
                              price: selectedProduct.price,
                              quantity: 1,
                              image: parseProductImage(selectedProduct),
                              sku: selectedProduct.sku,
                              isRoll: true
                            });
                            setSelectedProduct(null);
                            router.push('/checkout');
                          }}
                          className="h-16 rounded-none bg-blue-600 text-white hover:bg-blue-700 font-bold uppercase text-[10px] tracking-widest gap-2 shadow-xl shadow-blue-600/20"
                        >
                          <ShoppingCart className="w-4 h-4" /> PURCHASE
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
