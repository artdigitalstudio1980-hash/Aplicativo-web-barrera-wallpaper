
import { PrismaClient } from '@prisma/client';
import { PICTOREM_MATERIALS, DEFAULT_PICTOREM_OPTIONS } from '../lib/pictorem';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed process...');

  // Seed Pictorem Products
  console.log('📦 Seeding Pictorem products...');

  const pictoremProducts = [
    // Canvas options
    {
      material: 'canvas',
      type: 'stretched',
      name: 'Canvas Print - Gallery Wrapped',
      nameEs: 'Impresión en Lienzo - Envuelto en Galería',
      description: 'Premium canvas print with gallery wrap finish. Ready to hang.',
      descriptionEs: 'Impresión en lienzo premium con acabado envuelto en galería. Listo para colgar.',
      baseMarkup: 2.2,
      minPrice: 35.0,
      maxPrice: 400.0,
      minWidth: 8,
      maxWidth: 60,
      minHeight: 8,
      maxHeight: 60
    },
    {
      material: 'canvas',
      type: 'roll',
      name: 'Canvas Print - Roll',
      nameEs: 'Impresión en Lienzo - Rollo',
      description: 'Canvas print delivered as a roll for custom framing.',
      descriptionEs: 'Impresión en lienzo entregada como rollo para enmarcado personalizado.',
      baseMarkup: 1.8,
      minPrice: 25.0,
      maxPrice: 300.0,
      minWidth: 8,
      maxWidth: 60,
      minHeight: 8,
      maxHeight: 60
    },
    // Metal options
    {
      material: 'metal',
      type: 'al',
      name: 'Aluminum Print',
      nameEs: 'Impresión en Aluminio',
      description: 'High-gloss aluminum print with vibrant colors and durability.',
      descriptionEs: 'Impresión en aluminio de alto brillo con colores vibrantes y durabilidad.',
      baseMarkup: 2.5,
      minPrice: 45.0,
      maxPrice: 500.0,
      minWidth: 8,
      maxWidth: 48,
      minHeight: 8,
      maxHeight: 48
    },
    {
      material: 'metal',
      type: 'hd',
      name: 'HD Metal Print',
      nameEs: 'Impresión en Metal HD',
      description: 'Ultra high-definition metal print with exceptional detail.',
      descriptionEs: 'Impresión en metal de ultra alta definición con detalle excepcional.',
      baseMarkup: 2.8,
      minPrice: 55.0,
      maxPrice: 600.0,
      minWidth: 8,
      maxWidth: 48,
      minHeight: 8,
      maxHeight: 48
    },
    // Acrylic options
    {
      material: 'acrylic',
      type: 'da8',
      name: 'Acrylic Print - 1/8" Thickness',
      nameEs: 'Impresión en Acrílico - Grosor 1/8"',
      description: 'Modern acrylic print with depth and luminosity.',
      descriptionEs: 'Impresión en acrílico moderna con profundidad y luminosidad.',
      baseMarkup: 2.6,
      minPrice: 50.0,
      maxPrice: 450.0,
      minWidth: 8,
      maxWidth: 48,
      minHeight: 8,
      maxHeight: 48
    },
    {
      material: 'acrylic',
      type: 'da16',
      name: 'Acrylic Print - 1/4" Thickness',
      nameEs: 'Impresión en Acrílico - Grosor 1/4"',
      description: 'Premium thick acrylic print with museum-quality appearance.',
      descriptionEs: 'Impresión en acrílico grueso premium con apariencia de calidad de museo.',
      baseMarkup: 3.0,
      minPrice: 70.0,
      maxPrice: 550.0,
      minWidth: 8,
      maxWidth: 48,
      minHeight: 8,
      maxHeight: 48
    },
    // Paper options
    {
      material: 'paper',
      type: 'poster',
      name: 'Poster Print',
      nameEs: 'Impresión en Póster',
      description: 'High-quality poster print on premium paper.',
      descriptionEs: 'Impresión de póster de alta calidad en papel premium.',
      baseMarkup: 2.0,
      minPrice: 15.0,
      maxPrice: 150.0,
      minWidth: 8,
      maxWidth: 60,
      minHeight: 8,
      maxHeight: 60
    },
    {
      material: 'paper',
      type: 'art',
      name: 'Fine Art Print',
      nameEs: 'Impresión de Arte Fino',
      description: 'Museum-quality fine art print on archival paper.',
      descriptionEs: 'Impresión de arte fino de calidad de museo en papel de archivo.',
      baseMarkup: 2.3,
      minPrice: 25.0,
      maxPrice: 200.0,
      minWidth: 8,
      maxWidth: 44,
      minHeight: 8,
      maxHeight: 44
    },
    {
      material: 'paper',
      type: 'glossphoto',
      name: 'Glossy Photo Print',
      nameEs: 'Impresión Fotográfica Brillante',
      description: 'Professional glossy photo print with vibrant colors.',
      descriptionEs: 'Impresión fotográfica brillante profesional con colores vibrantes.',
      baseMarkup: 2.1,
      minPrice: 20.0,
      maxPrice: 180.0,
      minWidth: 8,
      maxWidth: 44,
      minHeight: 8,
      maxHeight: 44
    },
    // Wood options
    {
      material: 'wood',
      type: 'ru14',
      name: 'Wood Print - Rustic',
      nameEs: 'Impresión en Madera - Rústica',
      description: 'Natural wood print with rustic finish for unique warmth.',
      descriptionEs: 'Impresión en madera natural con acabado rústico para calidez única.',
      baseMarkup: 2.7,
      minPrice: 55.0,
      maxPrice: 480.0,
      minWidth: 8,
      maxWidth: 48,
      minHeight: 8,
      maxHeight: 48
    },
    {
      material: 'wood',
      type: 'pineveneer',
      name: 'Wood Print - Pine Veneer',
      nameEs: 'Impresión en Madera - Chapa de Pino',
      description: 'Elegant pine veneer wood print with smooth finish.',
      descriptionEs: 'Elegante impresión en chapa de pino con acabado suave.',
      baseMarkup: 2.6,
      minPrice: 50.0,
      maxPrice: 450.0,
      minWidth: 8,
      maxWidth: 48,
      minHeight: 8,
      maxHeight: 48
    },
    // Additional Acrylic options
    {
      material: 'acrylic',
      type: 'a38',
      name: 'Acrylic Print - 3/8" Thickness',
      nameEs: 'Impresión en Acrílico - Grosor 3/8"',
      description: 'Extra thick acrylic print for maximum depth and impact.',
      descriptionEs: 'Impresión en acrílico extra grueso para máxima profundidad e impacto.',
      baseMarkup: 3.2,
      minPrice: 80.0,
      maxPrice: 600.0,
      minWidth: 8,
      maxWidth: 48,
      minHeight: 8,
      maxHeight: 48
    },
    // Additional Metal options
    {
      material: 'metal',
      type: 'alw',
      name: 'White Metal Print',
      nameEs: 'Impresión en Metal Blanco',
      description: 'Brushed aluminum with white base for soft, elegant look.',
      descriptionEs: 'Aluminio cepillado con base blanca para un aspecto suave y elegante.',
      baseMarkup: 2.6,
      minPrice: 50.0,
      maxPrice: 520.0,
      minWidth: 8,
      maxWidth: 48,
      minHeight: 8,
      maxHeight: 48
    }
  ];

  for (const product of pictoremProducts) {
    await prisma.pictoremProduct.upsert({
      where: {
        material_type: {
          material: product.material,
          type: product.type
        }
      },
      update: product,
      create: product
    });
  }

  console.log(`✅ Seeded ${pictoremProducts.length} Pictorem products`);

  // Seed Categories
  console.log('📂 Seeding categories...');

  const categories = [
    {
      name: 'Modern',
      nameEs: 'Moderno',
      slug: 'modern',
      description: 'Contemporary designs with clean lines and bold patterns',
      descriptionEs: 'Diseños contemporáneos con líneas limpias y patrones audaces',
      order: 1,
      isActive: true
    },
    {
      name: 'Classic',
      nameEs: 'Clásico',
      slug: 'classic',
      description: 'Timeless traditional patterns and elegant designs',
      descriptionEs: 'Patrones tradicionales atemporales y diseños elegantes',
      order: 2,
      isActive: true
    },
    {
      name: 'Tropical',
      nameEs: 'Tropical',
      slug: 'tropical',
      description: 'Vibrant botanical and nature-inspired designs',
      descriptionEs: 'Diseños vibrantes botánicos e inspirados en la naturaleza',
      order: 3,
      isActive: true
    },
    {
      name: 'Abstract',
      nameEs: 'Abstracto',
      slug: 'abstract',
      description: 'Artistic and creative contemporary patterns',
      descriptionEs: 'Patrones contemporáneos artísticos y creativos',
      order: 4,
      isActive: true
    },
    {
      name: 'Minimalist',
      nameEs: 'Minimalista',
      slug: 'minimalist',
      description: 'Simple, clean designs with subtle elegance',
      descriptionEs: 'Diseños simples y limpios con elegancia sutil',
      order: 5,
      isActive: true
    }
  ];

  const createdCategories: Record<string, any> = {};
  
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category
    });
    createdCategories[category.slug] = created;
  }

  console.log(`✅ Seeded ${categories.length} categories`);

  // Seed Products
  console.log('🖼️  Seeding products...');

  const products = [
    {
      name: 'Modern Geometric',
      nameEs: 'Geométrico Moderno',
      description: 'Contemporary geometric pattern with bold shapes and clean lines. Perfect for modern spaces.',
      descriptionEs: 'Patrón geométrico contemporáneo con formas audaces y líneas limpias. Perfecto para espacios modernos.',
      slug: 'modern-geometric',
      sku: 'WP-MOD-001',
      price: 89.99,
      salePrice: null,
      images: ['/images/wallpaper-modern-geometric.jpg'],
      colors: ['gold', 'navy', 'white'],
      styles: ['modern', 'geometric'],
      dimensions: 'Roll: 20.5" x 33 ft (covers ~56 sq ft)',
      material: 'Non-woven fabric, pre-pasted',
      materialEs: 'Tela no tejida, prepegada',
      isCustomizable: true,
      isActive: true,
      isFeatured: true,
      stock: 50,
      categoryId: createdCategories['modern'].id
    },
    {
      name: 'Classic Damask',
      nameEs: 'Damasco Clásico',
      description: 'Elegant traditional damask pattern with intricate details. Timeless beauty for any room.',
      descriptionEs: 'Elegante patrón de damasco tradicional con detalles intrincados. Belleza atemporal para cualquier habitación.',
      slug: 'classic-damask',
      sku: 'WP-CLA-001',
      price: 129.99,
      salePrice: 99.99,
      images: ['/images/wallpaper-classic-damask.jpg'],
      colors: ['cream', 'gold', 'beige'],
      styles: ['classic', 'elegant'],
      dimensions: 'Roll: 20.5" x 33 ft (covers ~56 sq ft)',
      material: 'Vinyl, washable',
      materialEs: 'Vinilo, lavable',
      isCustomizable: true,
      isActive: true,
      isFeatured: true,
      stock: 35,
      categoryId: createdCategories['classic'].id
    },
    {
      name: 'Tropical Leaves',
      nameEs: 'Hojas Tropicales',
      description: 'Lush tropical foliage pattern bringing nature indoors. Fresh and vibrant design.',
      descriptionEs: 'Exuberante patrón de follaje tropical que trae la naturaleza al interior. Diseño fresco y vibrante.',
      slug: 'tropical-leaves',
      sku: 'WP-TRO-001',
      price: 79.99,
      salePrice: null,
      images: ['/images/wallpaper-tropical.jpg'],
      colors: ['green', 'emerald', 'white'],
      styles: ['tropical', 'botanical'],
      dimensions: 'Roll: 20.5" x 33 ft (covers ~56 sq ft)',
      material: 'Paper, eco-friendly',
      materialEs: 'Papel, ecológico',
      isCustomizable: true,
      isActive: true,
      isFeatured: true,
      stock: 45,
      categoryId: createdCategories['tropical'].id
    },
    {
      name: 'Abstract Flow',
      nameEs: 'Flujo Abstracto',
      description: 'Dynamic abstract pattern with flowing organic shapes. Contemporary art for your walls.',
      descriptionEs: 'Patrón abstracto dinámico con formas orgánicas fluidas. Arte contemporáneo para tus paredes.',
      slug: 'abstract-flow',
      sku: 'WP-ABS-001',
      price: 95.99,
      salePrice: null,
      images: ['/images/wallpaper-abstract-flow.jpg'],
      colors: ['blue', 'purple', 'white'],
      styles: ['abstract', 'modern'],
      dimensions: 'Roll: 20.5" x 33 ft (covers ~56 sq ft)',
      material: 'Non-woven fabric, paste-the-wall',
      materialEs: 'Tela no tejida, pegar a la pared',
      isCustomizable: true,
      isActive: true,
      isFeatured: false,
      stock: 30,
      categoryId: createdCategories['abstract'].id
    },
    {
      name: 'Minimalist Lines',
      nameEs: 'Líneas Minimalistas',
      description: 'Clean minimalist design with subtle stripes. Perfect for creating a calm, modern space.',
      descriptionEs: 'Diseño minimalista limpio con rayas sutiles. Perfecto para crear un espacio moderno y tranquilo.',
      slug: 'minimalist-lines',
      sku: 'WP-MIN-001',
      price: 69.99,
      salePrice: null,
      images: ['/images/wallpaper-minimalist.jpg'],
      colors: ['white', 'gray', 'silver'],
      styles: ['minimalist', 'modern'],
      dimensions: 'Roll: 20.5" x 33 ft (covers ~56 sq ft)',
      material: 'Non-woven fabric',
      materialEs: 'Tela no tejida',
      isCustomizable: false,
      isActive: true,
      isFeatured: false,
      stock: 60,
      categoryId: createdCategories['minimalist'].id
    },
    {
      name: 'Victorian Elegance',
      nameEs: 'Elegancia Victoriana',
      description: 'Ornate Victorian pattern with rich details. Sophisticated luxury for traditional interiors.',
      descriptionEs: 'Patrón victoriano ornamentado con ricos detalles. Lujo sofisticado para interiores tradicionales.',
      slug: 'victorian-elegance',
      sku: 'WP-CLA-002',
      price: 139.99,
      salePrice: null,
      images: ['/images/wallpaper-victorian.jpg'],
      colors: ['burgundy', 'gold', 'cream'],
      styles: ['classic', 'victorian', 'elegant'],
      dimensions: 'Roll: 20.5" x 33 ft (covers ~56 sq ft)',
      material: 'Vinyl, embossed',
      materialEs: 'Vinilo, con relieve',
      isCustomizable: true,
      isActive: true,
      isFeatured: false,
      stock: 25,
      categoryId: createdCategories['classic'].id
    }
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }

  console.log(`✅ Seeded ${products.length} products`);

  // Seed sample AI generation requests (optional)
  console.log('🎨 Seeding sample AI generation requests...');

  const samplePrompts = [
    {
      prompt: 'Modern geometric pattern with gold and navy blue colors, luxury wallpaper design',
      style: 'modern',
      colors: ['gold', 'navy blue'],
      status: 'COMPLETED' as const,
      generatedImageUrl: '/images/sample-ai-1.jpg',
      processingTime: 15,
      cost: 0.04
    },
    {
      prompt: 'Tropical botanical leaves in watercolor style, green and emerald tones',
      style: 'watercolor',
      colors: ['green', 'emerald'],
      status: 'COMPLETED' as const,
      generatedImageUrl: '/images/sample-ai-2.jpg',
      processingTime: 18,
      cost: 0.04
    },
    {
      prompt: 'Abstract marble texture with rose gold veining, elegant wallpaper',
      style: 'abstract',
      colors: ['white', 'rose gold'],
      status: 'COMPLETED' as const,
      generatedImageUrl: '/images/sample-ai-3.jpg',
      processingTime: 12,
      cost: 0.04
    }
  ];

  for (const prompt of samplePrompts) {
    await prisma.aIGenerationRequest.create({
      data: prompt
    });
  }

  console.log(`✅ Seeded ${samplePrompts.length} sample AI generation requests`);

  console.log('🎉 Seed process completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed process failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });