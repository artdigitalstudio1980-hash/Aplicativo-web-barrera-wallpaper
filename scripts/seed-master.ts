
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando Sincronización Maestra del Catálogo...');

  // 1. Cargar Categorías Base
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
  console.log('✅ Categorías base listas.');

  // 2. Cargar SYSTEXX desde JSON
  const dataPath = path.join(__dirname, '../prisma/catalog_master.json');
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
          },
          create: {
            sku: prod.sku,
            name: prod.name,
            nameEs: prod.nameEs,
            description: prod.description,
            descriptionEs: prod.descriptionEs,
            slug: prodSlug,
            price: 45.0,
            images: [],
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
    console.warn('⚠️ No se encontró catalog_master.json en app/prisma/');
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
