'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Loader2, Wand2, ShoppingCart, MessageSquare, Ruler } from 'lucide-react';
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

const sortOptions = [
  { value: 'featured', labelEn: 'Featured', labelEs: 'Destacados' },
  { value: 'price-low', labelEn: 'Price: Low to High', labelEs: 'Precio: Menor a Mayor' },
  { value: 'price-high', labelEn: 'Price: High to Low', labelEs: 'Precio: Mayor a Menor' },
  { value: 'name', labelEn: 'Name', labelEs: 'Nombre' }
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

  useEffect(() => {
    fetchProducts();
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
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
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
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }
    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const isSystexx = (product: Product) =>
    product.category.slug.startsWith('systexx');

  const handleVisualizeOnWall = (productId: string) => {
    router.push(`/design?wallpaperId=${productId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Wallpaper Catalog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our collection of premium glass fiber and decorative wallcoverings.
            Click <span className="text-primary font-semibold">Visualize on Wall</span> to preview any product in your own space.
          </p>
        </div>

        {/* Design Tool Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 mb-8 flex items-center gap-4">
          <div className="bg-primary/10 rounded-full p-2 shrink-0">
            <Wand2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Design Visualizer available</p>
            <p className="text-xs text-muted-foreground">
              Upload a photo of your room and preview any wallpaper directly on your walls before buying.
            </p>
          </div>
          <Link href="/design">
            <Button size="sm" variant="outline" className="shrink-0">
              Open Design Tool
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
            >
              All
            </Button>
            {categories.map((cat: any) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.slug)}
                size="sm"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="flex justify-center items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm bg-background"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground text-center mb-6">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const imagesArray = Array.isArray(product.images) ? product.images : [];
              const imageUrl = product.imageUrl || imagesArray[0] || '';
              const systexx = isSystexx(product);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full">

                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {systexx && (
                          <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                            SYSTEXX
                          </span>
                        )}
                        {product.isFeatured && (
                          <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Featured
                          </span>
                        )}
                        {product.isCustomizable && (
                          <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Custom
                          </span>
                        )}
                        {product.salePrice && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Sale
                          </span>
                        )}
                      </div>

                      {/* Visualize overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          size="sm"
                          onClick={() => handleVisualizeOnWall(product.id)}
                          className="gap-2 bg-white text-black hover:bg-white/90 font-semibold"
                        >
                          <Wand2 className="w-4 h-4" />
                          Visualize on Wall
                        </Button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                          {product.category.name}
                        </p>
                        <h3 className="font-semibold text-base leading-tight mb-1">
                          {product.name}
                        </h3>

                        {/* Dimensions */}
                        {product.dimensions && (
                          <div className="flex items-start gap-1 mt-1 mb-2">
                            <Ruler className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-tight">
                              {product.dimensions}
                            </p>
                          </div>
                        )}

                        {/* Material */}
                        {product.material && (
                          <p className="text-xs text-muted-foreground/70 truncate">
                            {product.material}
                          </p>
                        )}
                      </div>

                      {/* Price + Actions */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center mb-3">
                          {product.salePrice ? (
                            <div>
                              <span className="text-xl font-bold text-red-600">${product.salePrice.toFixed(2)}</span>
                              <span className="text-sm line-through text-muted-foreground ml-2">${product.price.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                          )}
                          <span className="text-xs text-muted-foreground">/roll</span>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="col-span-1 text-xs gap-1 px-2"
                            onClick={() => handleVisualizeOnWall(product.id)}
                          >
                            <Wand2 className="w-3 h-3" />
                            Try
                          </Button>
                          <Link href={`/shop/${product.slug}`} className="col-span-1">
                            <Button size="sm" className="w-full text-xs gap-1 px-2">
                              <ShoppingCart className="w-3 h-3" />
                              Buy
                            </Button>
                          </Link>
                          <Link href="/contact" className="col-span-1">
                            <Button size="sm" variant="outline" className="w-full text-xs gap-1 px-2">
                              <MessageSquare className="w-3 h-3" />
                              Quote
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No products found</p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
