'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Loader2, Wand2, ShoppingCart, 
  Ruler, Info, ChevronRight, ChevronLeft, 
  Sparkles, ShieldCheck, Flame, Zap, Droplets
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/components/locale-context';
import { toast } from 'sonner';

// --- DATA CONFIGURATION ---

const ADS = [
  { src: '/catalog-info/imagen_publicidad/cover-systexx-collection.png', title: 'SYSTEXX Collection', desc: 'German engineering meets interior art.' },
  { src: '/catalog-info/imagen_publicidad/active-acoustherm-description.png', title: 'AcousTherm Technology', desc: 'Heats rooms 4x faster and optimizes acoustics.' },
  { src: '/catalog-info/imagen_publicidad/active-magnetic-description.png', title: 'Magnetic Walls', desc: 'Transform surfaces into interactive spaces.' },
  { src: '/catalog-info/imagen_publicidad/active-fireprotect-description.png', title: 'Fire Protection', desc: 'Non-combustible safety for high-traffic areas.' },
  { src: '/catalog-info/imagen_publicidad/systexx-properties.png', title: 'Technical Superiority', desc: 'Impact resistant, crack-bridging, and Oeko-Tex certified.' },
];

export default function CatalogPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adIndex, setAdIndex] = useState(0);

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
        <div className="relative h-[350px] md:h-[450px] rounded-[3rem] overflow-hidden mb-16 shadow-2xl group">
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
                className="object-cover brightness-75"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-10 md:p-16">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 inline-block">
                    Premium Feature
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">
                    {ADS[adIndex].title}
                  </h2>
                  <p className="text-gray-300 text-lg md:text-xl max-w-2xl font-light">
                    {ADS[adIndex].desc}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Ad Nav Dots */}
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
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic">
              Virtual <span className="text-gray-400">Showroom</span>
            </h1>
            <p className="text-gray-500 max-w-md font-light">
              Explore the full range of German-engineered SYSTEXX wallcoverings. 
              Durable, technical, and aesthetically unmatched.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search collection..." 
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

        {/* Categories Navigation */}
        <div className="flex flex-wrap gap-3 mb-16 border-b border-gray-100 pb-8">
          {['all', 'systexx-active', 'systexx-phantasy', 'systexx-pure'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat 
                ? 'bg-black text-white shadow-2xl' 
                : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-900 hover:text-gray-900'
              }`}
            >
              {cat.replace('systexx-', '') === 'all' ? 'All Collections' : cat.replace('systexx-', '')}
            </button>
          ))}
        </div>

        {/* --- SALES CATALOG GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProducts.map((product, idx) => {
            const imgUrl = product.images?.[0] || '';
            const isSpecial = product.sku.includes('MAG') || product.sku.includes('ACO') || product.sku.includes('ABS');
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative flex flex-col bg-white"
              >
                {/* Product Image Container */}
                <div 
                  className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-gray-50 mb-6 cursor-pointer shadow-sm group-hover:shadow-2xl transition-all duration-700"
                  onClick={() => router.push(`/design/?wallpaperId=${product.id}`)}
                >
                  <Image 
                    src={imgUrl} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    unoptimized
                  />
                  
                  {/* Overlay Interaction */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                    <Sparkles className="w-10 h-10 text-white mb-4 animate-pulse" />
                    <p className="text-white font-bold text-xl mb-6 uppercase tracking-tighter italic">Visualize in your space</p>
                    <Button variant="secondary" className="rounded-full px-10 font-black text-xs tracking-widest">
                      OPEN SIMULADOR
                    </Button>
                  </div>

                  {/* Technical Badges */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-md text-black text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                      {product.category.name.replace('SYSTEXX ', '')}
                    </span>
                    {isSpecial && (
                      <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-pulse">
                        Technical Line
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div className="px-2 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic leading-tight group-hover:text-blue-600 transition-colors">
                        {product.nameEs || product.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gray-900">${product.price.toFixed(2)}</span>
                      <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">per roll</p>
                    </div>
                  </div>

                  {/* Specs Mini-Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="flex items-center gap-2 text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <Ruler className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{product.dimensions || '1 x 25 m'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Aqua Tech</span>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Link href={`/calculator/?wallpaperId=${product.id}`} className="flex-1">
                      <Button className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:shadow-black/20">
                        Calculate & Buy
                      </Button>
                    </Link>
                    <button className="w-14 h-14 flex items-center justify-center rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all">
                      <ShoppingCart className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-[4rem]">
            <Info className="w-12 h-12 mx-auto text-gray-200 mb-6" />
            <p className="text-2xl font-black text-gray-300 uppercase tracking-tighter italic">No textures found in this collection</p>
            <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="mt-4 text-black font-bold uppercase text-xs tracking-widest underline underline-offset-8">
              Reset Filters
            </Button>
          </div>
        )}

        {/* --- FOOTER BANNER: WHY SYSTEXX --- */}
        <section className="mt-32 p-12 md:p-20 rounded-[4rem] bg-gray-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic mb-8">
                Unmatched German <br /><span className="text-blue-500">Technical Standards</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex gap-4">
                  <Flame className="w-6 h-6 text-orange-500 shrink-0" />
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest mb-1">Fire Rated</p>
                    <p className="text-sm text-gray-400 font-light">A2-s1, d0 non-combustible certification.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-green-500 shrink-0" />
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest mb-1">Impact Resistant</p>
                    <p className="text-sm text-gray-400 font-light">Bridges cracks and protects walls for 30+ years.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Zap className="w-6 h-6 text-yellow-500 shrink-0" />
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest mb-1">Aqua Technology</p>
                    <p className="text-sm text-gray-400 font-light">Water-activated adhesive for 40% faster install.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Users className="w-6 h-6 text-blue-500 shrink-0" />
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest mb-1">Oeko-Tex Standard</p>
                    <p className="text-sm text-gray-400 font-light">Safe for hospitals, schools, and nursery rooms.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
              <Image src="/catalog-info/imagen_publicidad/active-category-overview.png" alt="SYSTEXX Overview" fill className="object-cover" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
