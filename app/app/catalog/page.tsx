'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
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
  slug: string;
  price: number;
  salePrice?: number;
  images: string[];
  imageUrl?: string;
  isFeatured: boolean;
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
        
        // Extract unique categories
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

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.slug === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.nameEs.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'name':
        filtered.sort((a, b) => (locale === 'es' ? a.nameEs : a.name).localeCompare(locale === 'es' ? b.nameEs : b.name));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy, locale]);

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {locale === 'es' ? 'Catálogo de Papeles Tapiz' : 'Wallpaper Catalog'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {locale === 'es' 
              ? 'Explora nuestra colección de diseños exclusivos' 
              : 'Explore our collection of exclusive designs'}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder={locale === 'es' ? 'Buscar productos...' : 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              size="sm"
            >
              {locale === 'es' ? 'Todos' : 'All'}
            </Button>
            {categories.map((cat: any) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.slug)}
                size="sm"
              >
                {locale === 'es' ? cat.nameEs : cat.name}
              </Button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex justify-center items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {locale === 'es' ? option.labelEs : option.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => {
              // Handle Json type safely - images can be null or array
              const imagesArray = Array.isArray(product.images) ? product.images : [];
              const imageUrl = product.imageUrl || imagesArray[0] || '';
              
              return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-card rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={locale === 'es' ? product.nameEs : product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    {product.isFeatured && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                        {locale === 'es' ? 'Destacado' : 'Featured'}
                      </div>
                    )}
                    {product.salePrice && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {locale === 'es' ? 'Oferta' : 'Sale'}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {locale === 'es' ? product.nameEs : product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {locale === 'es' ? product.category.nameEs : product.category.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        {product.salePrice ? (
                          <div>
                            <p className="text-2xl font-bold text-red-600">${product.salePrice.toFixed(2)}</p>
                            <p className="text-sm line-through text-muted-foreground">${product.price.toFixed(2)}</p>
                          </div>
                        ) : (
                          <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link href="/cart">
                          <Button size="sm">
                            {locale === 'es' ? 'Comprar' : 'Buy'}
                          </Button>
                        </Link>
                        <Link href="/contact">
                          <Button size="sm" variant="outline">
                            {locale === 'es' ? 'Cotizar' : 'Quote'}
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
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {locale === 'es' ? 'No se encontraron productos' : 'No products found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
