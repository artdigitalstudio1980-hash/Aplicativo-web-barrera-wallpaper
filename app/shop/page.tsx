
'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from '@/components/locale-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  ShoppingCart,
  Heart,
  Eye,
  Star,
  Filter,
  Truck,
  Shield,
  RotateCcw,
  Loader2
} from 'lucide-react';

// --- DATA CONFIGURATION ---
interface Product {
  id: number;
  name: string;
  category: { slug: string; name: string }; // Expected structure from API
  price: number;
  originalPrice: number | null;
  image: string; // Expecting a relative path like /catalogo/filename.jpg
  rating: number;
  reviews: number;
  inStock: boolean;
  bestseller: boolean;
  material: string;
  coverage: string;
  sku: string;
}

// --- API ENDPOINT FOR PRODUCTS ---
const PRODUCTS_API_ENDPOINT = '/api/products';

export default function ShopPage() {
  const { t } = useLocale();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('bestseller');
  const [cartItems, setCartItems] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [gridRef, gridInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(PRODUCTS_API_ENDPOINT);
        const data = await res.json();
        if (data.success && data.products) {
          // Process products to ensure correct image paths and category structure
          const processedProducts = data.products.map((p: any) => ({
            ...p,
            // Adjust image path: assuming API returns filename and we need to prefix with /catalogo/
            image: p.image ? `/catalogo/${p.image.split('/').pop()}` : '/images/placeholder.png',
            // Ensure category is an object with slug and name, default if missing
            category: p.category?.slug ? p.category : { slug: 'uncategorized', name: 'Uncategorized' }
          }));
          setProducts(processedProducts);
        } else {
          console.error('Failed to fetch products:', data.message);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.slug === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        (p.nameEs || p.name).toLowerCase().includes(searchTerm.toLowerCase()) || // Assuming nameEs might exist
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort filtered results
    if (sortBy === 'bestseller') {
      filtered.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const addToCart = (productId: number) => {
    setCartItems(prev => {
      if (prev.includes(productId)) return prev; // Prevent duplicates
      return [...prev, productId];
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-black mb-4" />
        <p className="text-sm font-bold tracking-widest uppercase">Loading Showroom...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative py-20 bg-gradient-to-br from-purple-50 to-pink-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Tienda Online
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compra directamente nuestros wallpapers prediseñados con envío internacional
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Envío Internacional</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Pago Seguro</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                <span>Garantía 30 días</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="contemporary">Contemporáneo</SelectItem>
                  <SelectItem value="botanical">Botánico</SelectItem>
                  <SelectItem value="artistic">Artístico</SelectItem>
                  <SelectItem value="vintage">Vintage</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bestseller">Más Vendidos</SelectItem>
                  <SelectItem value="price-low">Precio: Menor</SelectItem>
                  <SelectItem value="price-high">Precio: Mayor</SelectItem>
                  <SelectItem value="rating">Calificación</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  alert('Filtros adicionales próximamente');
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Más Filtros
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {filteredProducts.length} de {products.length} productos
            </div>
            <div className="text-sm text-gray-600">
              {cartItems.length} artículos en el carrito
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section ref={gridRef} className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={gridInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={gridInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 h-full">
                  <div className="relative aspect-square bg-gray-200 overflow-hidden rounded-t-lg">
                    {product.bestseller && (
                      <Badge className="absolute top-2 left-2 z-10 bg-orange-500">
                        Bestseller
                      </Badge>
                    )}
                    {product.originalPrice && (
                      <Badge className="absolute top-2 right-2 z-10 bg-red-500">
                        Oferta
                      </Badge>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                          Agotado
                        </Badge>
                      </div>
                    )}
                    
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    
                    {/* Overlay buttons */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" className="bg-white/90">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/90">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-4 flex-1">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                          {product.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">({product.reviews} reseñas)</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-blue-600">
                            ${product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <div>{product.material}</div>
                          <div>Cobertura: {product.coverage}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0">
                    <div className="w-full space-y-2">
                      <Button 
                        onClick={() => addToCart(product.id)}
                        disabled={!product.inStock}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {product.inStock ? (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Añadir al Carrito
                          </>
                        ) : (
                          'Agotado'
                        )}
                      </Button>
                      
                      {product.inStock && (
                        <Link href="/cart">
                          <Button variant="outline" className="w-full">
                            Comprar Ahora
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros o el término de búsqueda
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Envío Internacional
              </h3>
              <p className="text-gray-600">
                Enviamos a todo el mundo con tracking completo y seguro de envío
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pago Seguro
              </h3>
              <p className="text-gray-600">
                Procesamiento seguro con Stripe. Aceptamos todas las tarjetas principales
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Garantía de Devolución
              </h3>
              <p className="text-gray-600">
                30 días para devoluciones sin preguntas si no estás completamente satisfecho
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Cart Summary (if items in cart) */}
      {cartItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Card className="w-80 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Carrito ({cartItems.length})</span>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Ver Carrito
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                Artículos listos para checkout
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

