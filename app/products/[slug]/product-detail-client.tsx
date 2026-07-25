'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, ShieldCheck, Ruler, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-context';
import { useCart } from '@/lib/store/use-cart';
import { toast } from 'sonner';

interface ProductDetailProps {
  product: any;
}

export default function ProductDetailClient({ product }: ProductDetailProps) {
  const { locale } = useLocale();
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);

  const images = Array.isArray(product.images) ? product.images : [];
  const imageUrl = product.imageUrl || images[0] || '';

  const name = locale === 'es' && product.nameEs ? product.nameEs : product.name;
  const description = locale === 'es' && product.descriptionEs ? product.descriptionEs : product.description;
  const material = locale === 'es' && product.materialEs ? product.materialEs : product.material;
  const categoryName = locale === 'es' && product.category?.nameEs ? product.category.nameEs : product.category?.name || '';

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      productId: product.id,
      quantity: 1,
      price: product.salePrice || product.price,
      image: imageUrl,
    });
    toast.success(locale === 'es' ? 'Añadido al carrito' : 'Added to cart');
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/catalog">
          <Button variant="ghost" size="sm" className="mb-8 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {locale === 'es' ? 'Volver al Catálogo' : 'Back to Catalog'}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Package className="w-16 h-16" />
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {categoryName}
              </p>
              <h1 className="text-3xl md:text-4xl font-bold">{name}</h1>
            </div>

            <div className="flex items-baseline gap-3">
              {product.salePrice ? (
                <>
                  <span className="text-3xl font-black text-rose-600">${product.salePrice}</span>
                  <span className="text-xl line-through text-gray-400">${product.price}</span>
                </>
              ) : (
                <span className="text-3xl font-black">${product.price}</span>
              )}
            </div>

            {description && (
              <p className="text-gray-600 leading-relaxed">{description}</p>
            )}

            <div className="grid grid-cols-2 gap-4">
              {material && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <ShieldCheck className="w-5 h-5 text-gray-700 mb-2" />
                  <p className="text-sm font-medium">{locale === 'es' ? 'Material' : 'Material'}</p>
                  <p className="text-sm text-muted-foreground">{material}</p>
                </div>
              )}
              {product.dimensions && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <Ruler className="w-5 h-5 text-gray-700 mb-2" />
                  <p className="text-sm font-medium">{locale === 'es' ? 'Dimensiones' : 'Dimensions'}</p>
                  <p className="text-sm text-muted-foreground">{product.dimensions}</p>
                </div>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <Button onClick={handleAddToCart} size="lg" className="w-full rounded-full">
                <ShoppingCart className="w-5 h-5 mr-2" />
                {locale === 'es' ? 'Añadir al Carrito' : 'Add to Cart'}
              </Button>
              <Button variant="outline" size="lg" className="w-full rounded-full" asChild>
                <Link href="/contact">
                  {locale === 'es' ? 'Solicitar Cotización' : 'Request Quote'}
                </Link>
              </Button>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
              <ShieldCheck className="w-4 h-4 inline mr-2" />
              {locale === 'es'
                ? 'Envío seguro a todo el mundo. Instalación profesional disponible en Miami.'
                : 'Secure worldwide shipping. Professional installation available in Miami.'}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
