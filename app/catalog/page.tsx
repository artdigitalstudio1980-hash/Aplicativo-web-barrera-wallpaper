'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { parseProductImage } from '@/lib/utils';
import { 
  Search, Loader2, Wand2, ShoppingCart, 
  Ruler, Info, X, Sparkles, ShieldCheck, 
  Flame, Zap, Droplets, Calculator, ArrowRight, 
  Maximize2, Layers, Activity, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCart } from '@/lib/store/use-cart';

// --- DATA CONFIGURATION ---
const ADS = [
  { src: '/catalogo/active-magnetic-whiteboard-description.png', title: 'SYSTEXX Active', desc: 'Magnetic walls and whiteboard surfaces for interactive spaces.' },
  { src: '/catalogo/active-absorb-description.png', title: 'Acoustic Comfort', desc: 'Reduce noise levels with our sound-absorbing glass textile.' },
  { src: '/catalogo/phantasy-description.png', title: 'Phantasy Designs', desc: 'Exclusive patterns for sophisticated interior architectural statements.' },
];

const CATEGORIES_INFO: Record<string, any> = {
  'systexx-pure': {
    title: 'SYSTEXX Pure',
    subtitle: 'High-Performance Minimalism',
    description: 'Smooth glass textiles that offer extreme durability and fire protection.',
    icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
    image: '/publicidad/review-Captura-desde-2026-03-13-16-36-53.png',
    label: 'Durability & Elegance'
  },
  'systexx-phantasy': {
    title: 'SYSTEXX Phantasy',
    subtitle: 'Luxury Jacquard Patterns',
    description: 'Exclusive designs woven into the fabric for dramatic interior statements.',
    icon: <Palette className="w-5 h-5 text-purple-600" />,
    image: '/publicidad/phantasy-versailles-lifestyle.png',
    label: 'Exclusive Designer Patterns'
  },
  'systexx-active': {
    title: 'SYSTEXX Active',
    subtitle: 'The Functional Revolution',
    description: 'Magnetic surfaces, acoustic comfort, and whiteboard capabilities.',
    icon: <Zap className="w-5 h-5 text-yellow-600" />,
    image: '/publicidad/active-category-overview.png',
    label: 'Functional Wall Systems'
  }
};

export default function CatalogPage() {
  const router = useRouter();
  const { addItem } = useCart();
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
        <p className="text-xs font-black tracking-[0.2em] uppercase text-gray-400">Loading Catalog...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white text-gray-900 selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- LUXURY BANNER --- */}
        <div className="relative h-[250px] md:h-[350px] rounded-[2.5rem] overflow-hidden mb-16 shadow-sm border border-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={adIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image 
                src={ADS[adIndex].src} 
                alt={ADS[adIndex].title} 
                fill 
                className="object-cover brightness-[0.95]"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent flex flex-col justify-end p-10">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-black text-[9px] font-black uppercase tracking-[0.3em] mb-2 block">Premium Collection</span>
                  <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase italic leading-none mb-2">
                    {ADS[adIndex].title}
                  </h2>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- HEADER & SEARCH --- */}
        <div className="flex flex-col gap-10 mb-16">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-black text-black tracking-tighter uppercase italic leading-none">
                Virtual <span className="text-gray-300">Showroom</span>
              </h1>
              <p className="text-gray-400 text-sm font-light">Explore our official German SYSTEXX glass textile collections.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search wallpaper..." 
                  className="pl-12 h-14 w-full sm:w-[300px] rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Link href="/design/">
                <Button className="h-14 px-8 rounded-2xl bg-black text-white hover:bg-gray-800 gap-3 shadow-lg transition-all">
                  <Wand2 className="w-4 h-4" />
                  <span className="font-black uppercase text-[10px] tracking-widest">AI Designer</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* FILTER TABS */}
          <div className="flex flex-wrap gap-2 border-b border-gray-50 pb-6">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                selectedCategory === 'all' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {Object.keys(CATEGORIES_INFO).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  selectedCategory === key 
                    ? 'bg-black text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                {CATEGORIES_INFO[key].title}
              </button>
            ))}
          </div>
        </div>

        {/* --- DYNAMIC SECTIONS --- */}
        <div className="space-y-32">
          {Object.entries(productsByCategory).map(([catSlug, catProducts]) => {
            const info = CATEGORIES_INFO[catSlug] || { 
              title: catSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
              image: '/publicidad/active-category-overview.png',
              label: 'SYSTEXX Collection',
              description: 'Premium German glass textiles for high-performance wall surfaces.'
            };
            
            return (
              <section key={catSlug} className="scroll-mt-32">
                {/* --- SECTION HERO HEADER (PUBLICITY) --- */}
                <div className="relative h-[250px] md:h-[350px] rounded-[3rem] overflow-hidden mb-16 shadow-sm border border-gray-100 group">
                   <Image 
                    src={info.image || '/publicidad/active-category-overview.png'} 
                    alt={info.title} 
                    fill 
                    className="object-cover brightness-75 group-hover:scale-105 transition-transform duration-[5s]" 
                    unoptimized 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center p-12 md:p-16">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="h-[2px] w-8 bg-white" />
                      <span className="text-white text-[10px] font-black uppercase tracking-[0.4em]">{info.label}</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">
                      {info.title}
                    </h2>
                    <p className="text-gray-300 text-sm md:text-base font-light leading-relaxed max-w-xl">
                      {info.description}
                    </p>
                  </div>
                </div>

                {/* --- HORIZONTAL PRODUCT GRID (IMAGE LEFT) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {catProducts.map((product, idx) => {
                    let imgUrl = parseProductImage(product);
                    
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        viewport={{ once: true }}
                        className="group flex flex-col sm:flex-row bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-500 shadow-sm hover:shadow-xl h-auto sm:h-[220px]"
                      >
                        {/* IMAGE ON THE LEFT (SHOWING RECTANGLE ON RIGHT) */}
                        <div 
                          className="relative w-full sm:w-[220px] aspect-square sm:aspect-auto sm:h-full bg-gray-50 border-r border-gray-50 cursor-pointer overflow-hidden"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Image 
                            src={imgUrl} 
                            alt={product.name} 
                            fill 
                            className="object-contain sm:object-cover object-center sm:object-right transition-transform duration-700 group-hover:scale-110"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[1px]">
                             <Maximize2 className="w-6 h-6 text-black" />
                          </div>
                        </div>

                        {/* INFO ON THE RIGHT - NO OVERLAP */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                               <Badge className="bg-gray-50 text-gray-400 border-none font-black text-[8px] uppercase tracking-widest px-2 py-1">
                                {product.sku}
                              </Badge>
                              <span className="text-xl font-black text-black tracking-tighter">${product.price.toFixed(2)}</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter uppercase italic leading-[1.1] group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-6">
                             <Button 
                              variant="ghost" 
                              onClick={() => setSelectedProduct(product)}
                              className="flex-1 sm:flex-none rounded-xl h-10 px-4 text-[9px] font-black uppercase tracking-widest gap-2 bg-gray-50 hover:bg-gray-100"
                            >
                              Details <ArrowRight className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              onClick={() => handleOpenCalculator(product.id)}
                              className="flex-1 sm:flex-none rounded-xl h-10 px-4 text-[9px] font-black uppercase tracking-widest gap-2 bg-gray-50 hover:bg-gray-100"
                            >
                              <Calculator className="w-3 h-3" /> Calculator
                            </Button>
                          </div>
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
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white border-none rounded-[3rem] shadow-2xl">
          {selectedProduct && (
            <div className="flex flex-col lg:flex-row h-full max-h-[90vh] overflow-y-auto lg:overflow-hidden">
              <div className="relative w-full lg:w-[55%] aspect-square lg:aspect-auto h-[400px] lg:h-auto bg-gray-50 border-r border-gray-50">
                <Image 
                  src={parseProductImage(selectedProduct)}
                  alt={selectedProduct.name} 
                  fill 
                  className="object-contain" // Shows whole image with rectangle
                  unoptimized
                />
              </div>

              <div className="flex-1 p-10 lg:p-14 flex flex-col justify-between bg-white relative">
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-8 right-8 p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-10">
                  <div>
                    <p className="text-[10px] text-blue-600 font-black tracking-[0.3em] uppercase mb-3">SYSTEXX GERMANY</p>
                    <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-4">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-3xl font-black text-gray-900 tracking-tighter">${selectedProduct.price.toFixed(2)} <span className="text-gray-300 text-xs tracking-widest uppercase">/ SQ FT</span></p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Dimensions</p>
                      <p className="text-sm font-bold text-gray-900">1m x 25m</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Fire Class</p>
                      <p className="text-sm font-bold text-gray-900">B-s1,d0</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[9px] font-black text-black uppercase tracking-widest flex items-center gap-2">
                       <Info className="w-3 h-3" /> Key Specifications
                    </h4>
                    <p className="text-gray-500 text-xs leading-relaxed font-light">
                      High-durability glass textile. Impact resistant, repaintable, and fire-rated for commercial and residential use.
                    </p>
                  </div>
                </div>

                <div className="mt-12 flex flex-col gap-3">
                  <Button 
                    onClick={() => handleOpenSimulador(selectedProduct.id)}
                    className="w-full h-16 rounded-2xl bg-black text-white hover:bg-gray-800 font-black uppercase text-xs tracking-[0.2em] gap-3 shadow-lg"
                  >
                    <Wand2 className="w-5 h-5" />
                    Open Visualizer
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => handleOpenCalculator(selectedProduct.id)}
                      className="h-16 rounded-2xl border-gray-200 bg-white hover:bg-gray-50 text-black font-black uppercase text-[9px] tracking-widest gap-2 shadow-sm"
                    >
                      <Calculator className="w-4 h-4" />
                      Calculator
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
                        router.push('/checkout');
                      }}
                      className="h-16 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 font-black uppercase text-[9px] tracking-widest gap-2 shadow-md shadow-blue-600/10"
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
