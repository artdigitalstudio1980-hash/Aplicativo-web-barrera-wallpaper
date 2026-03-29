'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Loader2, Wand2, ShoppingCart, 
  Ruler, Info, ChevronRight, ChevronLeft, 
  Sparkles, ShieldCheck, Flame, Zap, Droplets,
  Filter, Grid, LayoutGrid, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/components/locale-context';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WallpaperDetailModal } from '@/components/catalog/WallpaperDetailModal';

// --- DATA CONFIGURATION ---
const ADS = [
  { src: '/publicidad/cover-systexx-collection.png', title: 'SYSTEXX Collection', desc: 'German engineering meets interior art.' },
  { src: '/publicidad/active-acoustherm-description.png', title: 'AcousTherm Technology', desc: 'Heats rooms 4x faster and optimizes acoustics.' },
  { src: '/publicidad/active-magnetic-description.png', title: 'Magnetic Walls', desc: 'Transform surfaces into interactive spaces.' },
  { src: '/publicidad/active-fireprotect-description.png', title: 'Fire Protection', desc: 'Non-combustible safety for high-traffic areas.' },
];

export default function CatalogPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [adIndex, setAdIndex] = useState(0);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchLocalCatalog();
    const timer = setInterval(() => setAdIndex((prev) => (prev + 1) % ADS.length), 7000);
    return () => clearInterval(timer);
  }, []);

  const fetchLocalCatalog = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/local-catalog');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching local catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    if (activeTab !== 'all') {
      filtered = filtered.filter(p => p.type === activeTab);
    }
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [products, searchQuery, activeTab]);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-12 h-12 text-black mb-4" />
        </motion.div>
        <p className="text-sm font-black tracking-[0.3em] uppercase italic opacity-50">Sincronizando Catálogo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- LUXURY SCROLL ADVERTISING (TOP) --- */}
        <div className="relative h-[400px] md:h-[500px] rounded-[3.5rem] overflow-hidden mb-20 shadow-[-20px_20px_60px_#d9d9d9,20px_-20px_60px_#ffffff] group cursor-default">
          <AnimatePresence mode="wait">
            <motion.div
              key={adIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image 
                src={ADS[adIndex].src} 
                alt={ADS[adIndex].title} 
                fill 
                className="object-cover brightness-75 scale-100 group-hover:scale-105 transition-transform duration-[5s]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12 md:p-20">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="max-w-3xl"
                >
                  <span className="bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] mb-6 inline-block">
                    SYSTEXX GERMANY
                  </span>
                  <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter uppercase italic leading-[0.9]">
                    {ADS[adIndex].title.split(' ').map((word, i) => i === 1 ? <span key={i} className="text-transparent border-b-4 border-white pb-1" style={{ WebkitTextStroke: '1px white' }}>{word} </span> : word + ' ')}
                  </h2>
                  <p className="text-gray-300 text-lg md:text-2xl font-light leading-relaxed opacity-80 decoration-white/30 underline underline-offset-8">
                    {ADS[adIndex].desc}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute bottom-12 right-12 flex gap-4 z-20">
            {ADS.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setAdIndex(i)}
                className={`h-2 rounded-full transition-all duration-1000 border border-white/20 ${adIndex === i ? 'w-16 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'w-4 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* --- PREMIUM NAVIGATION BAR --- */}
        <div className="flex flex-col space-y-12 mb-24">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  className="h-[2px] bg-black"
                />
                <span className="text-[11px] font-black tracking-[0.5em] uppercase opacity-40">Barrera Digital Showroom</span>
              </div>
              <h1 className="text-7xl md:text-9xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.8] mb-4">
                The <br/> <span className="text-transparent" style={{ WebkitTextStroke: '2px #000' }}>Catalog</span>
              </h1>
              <p className="text-gray-400 text-sm font-medium tracking-widest uppercase italic max-w-md border-l-2 border-gray-100 pl-6">
                Explore our curated selection of German-engineered glass fiber textures.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
              <div className="relative group w-full sm:w-[500px]">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-black transition-all duration-500" />
                <Input 
                  placeholder="SEARCH BY NAME OR SKU..." 
                  className="pl-20 h-24 w-full rounded-[2.5rem] border-gray-100 bg-gray-50/30 focus:bg-white focus:border-black transition-all duration-700 shadow-sm focus:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] text-xs font-black tracking-[0.2em] placeholder:opacity-30 border-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* --- TABS / CLASSIFICATION --- */}
          <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-8 gap-8">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="bg-transparent h-auto p-0 flex gap-10">
                {['all', 'pure', 'active', 'phantasy'].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab} 
                    className={`
                      relative p-0 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] data-[state=active]:text-black text-gray-400
                      hover:text-gray-600 transition-all after:absolute after:bottom-[-2rem] after:left-0 after:h-1 after:w-0 
                      after:bg-black after:transition-all data-[state=active]:after:w-full
                    `}
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-6">
              <LayoutGrid className="w-5 h-5 text-black" />
              <div className="h-4 w-[1px] bg-gray-200"></div>
              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase italic">
                {filteredProducts.length} DESIGNS FOUND
              </p>
            </div>
          </div>
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-20">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.03, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col bg-white"
              >
                <div 
                  className="relative aspect-[3/4.5] rounded-[3rem] overflow-hidden bg-gray-50 mb-8 cursor-pointer shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] group-hover:shadow-[0_45px_100px_-20px_rgba(0,0,0,0.2)] transition-all duration-1000"
                  onClick={() => handleProductClick(product)}
                >
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                    unoptimized
                  />
                  
                  {/* Type Badge */}
                  <div className="absolute top-6 left-6 z-10 transition-transform duration-700 group-hover:-translate-y-2">
                    <span className={`
                      text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md shadow-lg
                      ${product.type === 'active' ? 'bg-orange-600/80' : product.type === 'phantasy' ? 'bg-purple-600/80' : 'bg-blue-600/80'}
                    `}>
                      {product.type}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.22, 1, 0.36, 1]">
                    <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 rounded-[2rem] flex flex-col items-center">
                      <Sparkles className="w-8 h-8 text-white mb-3" />
                      <p className="text-white font-black text-xs mb-6 uppercase tracking-widest italic text-center">Open Technical Sheet</p>
                      <Button variant="secondary" className="w-full rounded-2xl h-14 font-black text-[10px] tracking-[0.2em] bg-white text-black hover:bg-blue-600 hover:text-white transition-all">
                        VIEW DETAILS
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="px-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9] group-hover:text-blue-600 transition-colors duration-500">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">{product.sku}</p>
                        <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Premium Fiber</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gray-900 leading-none">${product.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <Button 
                      onClick={() => handleProductClick(product)}
                      variant="outline" 
                      className="flex-1 h-16 rounded-[1.5rem] border-2 border-gray-100 font-black uppercase text-[10px] tracking-[0.25em] hover:bg-black hover:text-white hover:border-black transition-all duration-500 active:scale-95 shadow-sm"
                    >
                      INFO
                    </Button>
                    <Link href={`/design/?wallpaperId=${product.id}`} className="flex-[2.5]">
                      <Button className="w-full h-16 rounded-[1.5rem] bg-black text-white font-black uppercase text-[10px] tracking-[0.25em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:bg-blue-600 transition-all duration-500 hover:scale-[1.03] active:scale-95 gap-3 group/btn">
                        <Wand2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                        Simulador
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* --- EMPTY STATE --- */}
        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-gray-100 rounded-[4rem]">
            <Filter className="w-16 h-16 text-gray-100 mb-6" />
            <h3 className="text-3xl font-black text-gray-400 tracking-tighter uppercase italic">No designs found</h3>
            <p className="text-gray-300 text-sm tracking-widest uppercase mt-2">Try adjusting your filters or search query.</p>
            <Button 
              variant="link" 
              onClick={() => {setActiveTab('all'); setSearchQuery('');}}
              className="mt-8 text-black font-black uppercase text-xs tracking-widest underline underline-offset-8"
            >
              Reset All Filters
            </Button>
          </div>
        )}
      </div>

      {/* --- MODAL --- */}
      <WallpaperDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
