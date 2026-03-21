'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, SlidersHorizontal, Loader2, Wand2, 
  ShoppingCart, MessageSquare, Ruler, Info, 
  ChevronRight, ChevronLeft, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/components/locale-context';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  nameEs: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  nameEs: string;
  description?: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  images: string[];
  imageUrl?: string;
  isFeatured: boolean;
  isCustomizable: boolean;
  dimensions?: string;
  material?: string;
  category: Category;
}

// Imágenes de publicidad para el slider superior
const AD_IMAGES = [
  { src: '/catalog-info/active-category-overview.png', title: 'SYSTEXX Active', desc: 'Funcionalidad extrema: Magnético, Acústico y Térmico.' },
  { src: '/catalog-info/phantasy-description.png', title: 'SYSTEXX Phantasy', desc: 'Diseños opulentos y texturas creativas.' },
  { src: '/catalog-info/active-magnetic-description.png', title: 'Paredes Magnéticas', desc: 'Transforma cualquier espacio en una oficina creativa.' },
  { src: '/catalog-info/systexx-properties.png', title: 'Tecnología Alemana', desc: 'Fibra de vidrio de alta resistencia con tecnología Aqua.' },
];

export default function CatalogPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [adIndex, setAdIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
    const timer = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % AD_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        const uniqueCategories = Array.from(
          new Map(data.products.map((p: Product) => [p.category.id, p.category])).values()
        );
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar el catálogo');
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
        p.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [products, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-premium">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-sm font-medium animate-pulse">Cargando catálogo premium...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- PUBLICIDAD SUPERIOR (SLIDER) --- */}
        <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-12 shadow-2xl group">
          <AnimatePresence mode="wait">
            <motion.div
              key={adIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <Image 
                src={AD_IMAGES[adIndex].src} 
                alt={AD_IMAGES[adIndex].title} 
                fill 
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                <motion.h2 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-5xl font-bold text-white mb-2"
                >
                  {AD_IMAGES[adIndex].title}
                </motion.h2>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/80 text-lg max-w-xl"
                >
                  {AD_IMAGES[adIndex].desc}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Controles del Slider */}
          <div className="absolute bottom-6 right-8 flex gap-2">
            {AD_IMAGES.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setAdIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${adIndex === i ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* --- HEADER & FILTROS --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-2">
              CATÁLOGO <span className="font-bold">EXCLUSIVO</span>
            </h1>
            <p className="text-gray-500 max-w-md">
              Descubre revestimientos técnicos que combinan arte, durabilidad y tecnología IA.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Buscar textura, SKU o tipo..." 
                className="pl-10 rounded-full border-gray-200 focus:ring-2 focus:ring-black/5 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Link href="/design">
              <Button className="rounded-full bg-black text-white hover:bg-gray-800 gap-2 shadow-lg shadow-black/10">
                <Wand2 className="w-4 h-4" />
                Diseñador IA
              </Button>
            </Link>
          </div>
        </div>

        {/* Categorías (Pills) */}
        <div className="flex flex-wrap gap-2 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-black text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
          >
            Todos los productos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.slug ? 'bg-black text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
            >
              {cat.nameEs || cat.name}
            </button>
          ))}
        </div>

        {/* --- GRID DE PRODUCTOS (GLASS CARD STYLE) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, idx) => {
            const imgUrl = product.imageUrl || (Array.isArray(product.images) ? product.images[0] : '') || '';
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card rounded-[2rem] overflow-hidden flex flex-col group cursor-pointer"
                onClick={() => router.push(`/design?wallpaperId=${product.id}`)}
              >
                {/* Imagen del Producto */}
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image 
                    src={imgUrl} 
                    alt={product.nameEs || product.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    unoptimized
                  />
                  
                  {/* Overlay en Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center backdrop-blur-[2px]">
                    <Sparkles className="w-8 h-8 text-white mb-3 animate-pulse" />
                    <p className="text-white font-medium text-lg mb-4">Probar en mi pared</p>
                    <Button variant="secondary" className="rounded-full font-bold">
                      ABRIR SIMULADOR
                    </Button>
                  </div>

                  {/* Badges Premium */}
                  <div className="absolute top-5 left-5 flex flex-col gap-2">
                    <span className="bg-white/90 backdrop-blur-md text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                      {product.category.slug.replace('systexx-', '')}
                    </span>
                    {product.sku.includes('MAG') && (
                      <span className="bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                        Magnético
                      </span>
                    )}
                  </div>
                </div>

                {/* Información del Producto */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary transition-colors">
                      {product.nameEs || product.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">{product.sku}</p>
                  </div>

                  {/* Ficha Técnica Rápida */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Ruler className="w-4 h-4" />
                      <span className="text-xs">{product.dimensions || '1 x 25 m'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Info className="w-4 h-4" />
                      <span className="text-xs truncate">{product.materialEs || 'Fibra de Vidrio con tecnología Aqua'}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100/50">
                    <span className="text-2xl font-black text-gray-900">
                      ${product.price.toFixed(2)}
                      <span className="text-[10px] font-medium text-gray-400 ml-1">/rollo</span>
                    </span>
                    <button className="bg-gray-100 p-2.5 rounded-full hover:bg-black hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-40 glass-card rounded-3xl">
            <p className="text-xl text-gray-400">No hemos encontrado texturas con esos criterios.</p>
            <Button variant="link" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Ver todo el catálogo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
