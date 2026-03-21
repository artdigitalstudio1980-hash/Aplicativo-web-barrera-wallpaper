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

// --- DATA CONFIGURATION ---
const ADS = [
  { src: '/publicidad/cover-systexx-collection.png', title: 'SYSTEXX Collection', desc: 'German engineering meets interior art.' },
  { src: '/publicidad/active-acoustherm-description.png', title: 'AcousTherm Technology', desc: 'Heats rooms 4x faster and optimizes acoustics.' },
  { src: '/publicidad/active-magnetic-description.png', title: 'Magnetic Walls', desc: 'Transform surfaces into interactive spaces.' },
  { src: '/publicidad/active-fireprotect-description.png', title: 'Fire Protection', desc: 'Non-combustible safety for high-traffic areas.' },
  { src: '/publicidad/systexx-properties.png', title: 'Technical Superiority', desc: 'Impact resistant, crack-bridging, and Oeko-Tex certified.' },
];

export default function CatalogPage() {
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

        {/* --- STORE HEADER --- */}
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

        {/* --- GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredProducts.map((product, idx) => {
            // Ajuste de la ruta: Ahora las imágenes están en /catalogo/
            const fileName = product.images?.[0]?.split('/').pop();
            const imgUrl = fileName ? `/catalogo/${fileName}` : '/images/placeholder.png';
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
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
                    <Sparkles className="w-10 h-10 text-white mb-4 animate-pulse" />
                    <p className="text-white font-bold text-xl mb-6 uppercase tracking-tighter italic">Visualize in your space</p>
                    <Button variant="secondary" className="rounded-full px-10 font-black text-xs tracking-widest">
                      OPEN SIMULADOR
                    </Button>
                  </div>
                </div>

                <div className="px-2 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic leading-tight group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-gray-900">${product.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Link href={`/calculator/?wallpaperId=${product.id}`} className="flex-1">
                      <Button className="w-full h-14 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg">
                        Calculate & Buy
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
