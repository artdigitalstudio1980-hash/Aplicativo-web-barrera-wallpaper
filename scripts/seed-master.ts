
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

  // Helper para buscar imagen con lógica difusa
  const findImage = (category: string, sku: string, name: string) => {
    const cat = category.toLowerCase();
    const catPrefix = cat.includes('pure') ? 'pure' : 
                     cat.includes('phantasy') ? 'phantasy' : 
                     cat.includes('active') ? 'active' : '';
    
    // Extraer número o identificador del SKU (ej: SYS-PUR-044 -> 044)
    const skuParts = sku.split('-');
    const skuNum = skuParts[skuParts.length - 1]?.toLowerCase() || '';
    
    // Limpiar nombre para búsqueda
    const nameClean = name.toLowerCase().replace(/\s+/g, '-');
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Prioridad: Prefijo de categoría + número de SKU (ej: pure...044)
    let match = availableImages.find(img => {
      const lowerImg = img.toLowerCase();
      return lowerImg.includes(catPrefix) && lowerImg.includes(skuNum) && skuNum.length > 1;
    });

    // 2. Por nombre del producto
    if (!match) {
      match = availableImages.find(img => img.toLowerCase().includes(nameClean));
    }

    // 3. Por slug de nombre
    if (!match) {
      match = availableImages.find(img => img.toLowerCase().includes(nameSlug));
    }

    return match ? `/catalogo/${match}` : null;
  };

  // 2. Cargar Categorías Base
  const baseCategories = [
    { name: 'SYSTEXX Pure', nameEs: 'SYSTEXX Pure', slug: 'systexx-pure', order: 1 },
    { name: 'SYSTEXX Phantasy', nameEs: 'SYSTEXX Phantasy', slug: 'systexx-phantasy', order: 2 },
    { name: 'SYSTEXX Active', nameEs: 'SYSTEXX Active', slug: 'systexx-active', order: 3 },
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

      let mappedCount = 0;
      let missingCount = 0;

      for (const prod of section.products) {
        // Generar un slug único combinando el nombre y el SKU para evitar colisiones
        const namePart = prod.nameEs.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const skuPart = prod.sku.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const prodSlug = `${namePart}-${skuPart}`;
        
        const imagePath = findImage(section.category, prod.sku, prod.name);
        
        if (imagePath) mappedCount++; else missingCount++;

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
            images: images,
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
      console.log(`📊 Categoría: ${section.category} | Éxito: ${mappedCount} | Faltan: ${missingCount}`);
    }
  }

  console.log('🎉 Sincronización Maestra completada.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
