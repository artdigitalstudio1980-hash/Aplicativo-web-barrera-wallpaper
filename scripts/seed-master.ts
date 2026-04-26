
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Sincronización Maestra del Catálogo...');

  // 1. Obtener lista de imágenes disponibles
  const catalogDir = path.join(process.cwd(), 'public/catalogo');
  let availableImages: string[] = [];
  if (fs.existsSync(catalogDir)) {
    availableImages = fs.readdirSync(catalogDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'));
    console.log(`📸 Encontradas ${availableImages.length} imágenes en public/catalogo/`);
  } else {
    console.warn('⚠️ La carpeta public/catalogo no existe.');
  }

  // Helper para buscar imagen
  const findImage = (category: string, sku: string, name: string) => {
    const catPrefix = category.toLowerCase().includes('pure') ? 'pure' : 
                     category.toLowerCase().includes('phantasy') ? 'phantasy' : 
                     category.toLowerCase().includes('active') ? 'active' : '';
    
    const skuNum = sku.split('-').pop()?.toLowerCase() || '';
    const nameClean = name.toLowerCase().replace(/\s+/g, '-');

    // Buscar por SKU (ej: pure-weave-044 contiene '044')
    let match = availableImages.find(img => 
      img.toLowerCase().includes(catPrefix) && img.toLowerCase().includes(skuNum)
    );

    // Si no, buscar por nombre
    if (!match) {
      match = availableImages.find(img => 
        img.toLowerCase().includes(catPrefix) && img.toLowerCase().includes(nameClean)
      );
    }

    return match ? `/catalogo/${match}` : null;
  };

  // 2. Cargar Categorías Base
  const baseCategories = [
    { name: 'Modern', nameEs: 'Moderno', slug: 'modern', order: 1 },
    { name: 'Classic', nameEs: 'Clásico', slug: 'classic', order: 2 },
    { name: 'Tropical', nameEs: 'Tropical', slug: 'tropical', order: 3 },
    { name: 'Abstract', nameEs: 'Abstracto', slug: 'abstract', order: 4 },
    { name: 'Minimalist', nameEs: 'Minimalista', slug: 'minimalist', order: 5 },
  ];

  for (const cat of baseCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: { ...cat, isActive: true }
    });
  }

  // 3. Cargar SYSTEXX desde JSON
  const dataPath = path.join(process.cwd(), 'prisma/catalog_master.json');
  if (fs.existsSync(dataPath)) {
    const catalogData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    for (const section of catalogData) {
      const catSlug = section.category.toLowerCase().replace(/\s+/g, '-');
      const category = await prisma.category.upsert({
        where: { slug: catSlug },
        update: { name: section.category, nameEs: section.category },
        create: {
          name: section.category,
          nameEs: section.category,
          slug: catSlug,
          isActive: true,
          order: 10
        },
      });

      for (const prod of section.products) {
        const prodSlug = prod.nameEs.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const imagePath = findImage(section.category, prod.sku, prod.name);
        const images = imagePath ? [imagePath] : [];

        await prisma.product.upsert({
          where: { sku: prod.sku },
          update: {
            name: prod.name,
            nameEs: prod.nameEs,
            description: prod.description,
            descriptionEs: prod.descriptionEs,
            slug: prodSlug,
            dimensions: prod.dimensions,
            isActive: true,
            categoryId: category.id,
            images: images, // Actualizar imágenes si se encuentran
          },
          create: {
            sku: prod.sku,
            name: prod.name,
            nameEs: prod.nameEs,
            description: prod.description,
            descriptionEs: prod.descriptionEs,
            slug: prodSlug,
            price: 45.0,
            images: images,
            colors: [],
            styles: [section.category.split(' ')[1]?.toLowerCase() || 'systexx'],
            dimensions: prod.dimensions,
            material: "Glass Fiber / Fibra de Vidrio",
            materialEs: "Fibra de Vidrio con Tecnología Aqua",
            isActive: true,
            stock: 999,
            categoryId: category.id,
          },
        });
      }
      console.log(`✅ Categoría SYSTEXX: ${section.category} (${section.products.length} productos) cargada.`);
    }
  } else {
    console.warn(`⚠️ No se encontró catalog_master.json en ${dataPath}`);
  }

  console.log('🎉 Sincronización Maestra completada con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el Master Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
