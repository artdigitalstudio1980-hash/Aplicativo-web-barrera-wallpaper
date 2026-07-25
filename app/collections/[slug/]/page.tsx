'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  images: any;
  imageUrl?: string;
  isFeatured: boolean;
  category: Category;
}

export default function CollectionPage() {
  const { slug } = useParams();
  const { locale } = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCollectionData();
    }
  }, [slug]);

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products');
      const data = await res.json();
      
      if (data.success) {
        // Filter products by category slug
        const filteredProducts = data.products.filter(
          (p: Product) => p.category.slug === slug
        );
        
        setProducts(filteredProducts);
        
        if (filteredProducts.length > 0) {
          setCategory(filteredProducts[0].category);
        } else {
          // If no products, try to find the category info anyway from all products
          const cat = data.products.find((p: Product) => p.category.slug === slug)?.category;
          if (cat) setCategory(cat);
        }
      } else {
        toast.error('Failed to load collection');
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
      toast.error('Error loading collection');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const categoryName = category 
    ? (locale === 'es' ? category.nameEs : category.name)
    : (typeof slug === 'string' ? slug.replace(/-/g, ' ').toUpperCase() : 'Collection');

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs / Back */}
        <div className="mb-8">
          <Link href="/catalog">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {locale === 'es' ? 'Volver al Catálogo' : 'Back to Catalog'}
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 capitalize">
            {categoryName}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {locale === 'es' 
              ? `Explora nuestra colección ${categoryName}`
              : `Explore our ${categoryName} collection`}
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => {
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
                  <div className="bg-card rounded-xl overflow-hidden shadow-lg border hover:shadow-2xl transition-all duration-300">
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={locale === 'es' ? product.nameEs : product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-slate-200">
                          <span className="text-slate-400">No Image</span>
                        </div>
                      )}
                      
                      {product.salePrice && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          {locale === 'es' ? 'Oferta' : 'Sale'}
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-bold text-xl mb-1 text-gray-900 hover:text-blue-600 hover:underline transition-colors">
                          {locale === 'es' ? product.nameEs : product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mb-4">
                        {locale === 'es' ? product.category.nameEs : product.category.name}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          {product.salePrice ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-black text-rose-600">${product.salePrice}</span>
                              <span className="text-sm line-through text-gray-400">${product.price}</span>
                            </div>
                          ) : (
                            <span className="text-2xl font-black text-gray-900">${product.price}</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Link href={`/products/${product.slug}`}>
                            <Button size="sm" variant="outline" className="rounded-full px-4">
                              {locale === 'es' ? 'Detalles' : 'Details'}
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
          <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-xl text-muted-foreground">
              {locale === 'es' ? 'No hay productos en esta colección todavía.' : 'No products in this collection yet.'}
            </p>
            <Link href="/catalog" className="mt-4 inline-block text-blue-600 hover:underline">
               {locale === 'es' ? 'Ver todo el catálogo' : 'View all catalog'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
