
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga del catálogo SYSTEXX desde JSON...');

  const dataPath = path.join(__dirname, '../prisma/catalog_master.json');
  const catalogData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  for (const categorySection of catalogData) {
    console.log(`📂 Procesando categoría: ${categorySection.category}...`);

    // Crear o actualizar la categoría
    const slug = categorySection.category.toLowerCase().replace(/\s+/g, '-');
    const category = await prisma.category.upsert({
      where: { slug },
      update: {
        name: categorySection.category,
        nameEs: categorySection.category,
      },
      create: {
        name: categorySection.category,
        nameEs: categorySection.category,
        slug,
        isActive: true,
      },
    });

    for (const product of categorySection.products) {
      console.log(`  🖼️  Cargando producto: ${product.nameEs}...`);
      
      const productSlug = product.nameEs.toLowerCase().replace(/\s+/g, '-');

      await prisma.product.upsert({
        where: { sku: product.sku },
        update: {
          name: product.name,
          nameEs: product.nameEs,
          description: product.description,
          descriptionEs: product.descriptionEs,
          slug: productSlug,
          dimensions: product.dimensions,
          material: "Glass Fiber / Fibra de Vidrio",
          materialEs: "Fibra de Vidrio con Tecnología Aqua",
          price: 45.0, // Precio base de ejemplo
          isActive: true,
          stock: 999,
          categoryId: category.id,
          images: [], // Se llenará tras organizar las capturas
          colors: [],
          styles: [categorySection.category.split(' ')[1].toLowerCase()]
        },
        create: {
          sku: product.sku,
          name: product.name,
          nameEs: product.nameEs,
          description: product.description,
          descriptionEs: product.descriptionEs,
          slug: productSlug,
          dimensions: product.dimensions,
          material: "Glass Fiber / Fibra de Vidrio",
          materialEs: "Fibra de Vidrio con Tecnología Aqua",
          price: 45.0,
          isActive: true,
          stock: 999,
          categoryId: category.id,
          images: [],
          colors: [],
          styles: [categorySection.category.split(' ')[1].toLowerCase()]
        },
      });
    }
  }

  console.log('✅ Catálogo SYSTEXX cargado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el script de carga:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
