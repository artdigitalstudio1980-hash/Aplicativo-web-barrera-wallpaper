import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import catalogData from '../../../../prisma/catalog_master.json';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // SEGURIDAD: En producción deberías usar un "secret key" en la URL o verificar la sesión de admin
  // ej: /api/admin/sync-catalog?key=TU_CLAVE_SECRETA
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (key !== 'sincronizar2024') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    console.log('🌱 Iniciando carga de catálogo vía API Route...');
    
    let stats = { categories: 0, products: 0 };

    for (const categorySection of catalogData) {
      // 1. Crear o actualizar la Categoría
      const slug = categorySection.category.toLowerCase().replace(/\s+/g, '-');
      const category = await prisma.category.upsert({
        where: { slug: slug },
        update: {
          name: categorySection.category,
          nameEs: categorySection.category,
        },
        create: {
          name: categorySection.category,
          nameEs: categorySection.category,
          slug: slug,
          isActive: true,
        },
      });
      stats.categories++;

      // 2. Insertar Productos de esa categoría
      for (const product of categorySection.products) {
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
            price: 65.0, // Precio temporal
            isActive: true,
            stock: 999,
            categoryId: category.id,
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
            price: 65.0,
            isActive: true,
            stock: 999,
            categoryId: category.id,
            images: [],
            colors: [],
            styles: [categorySection.category.split(' ')[1].toLowerCase()]
          },
        });
        stats.products++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Catálogo SYSTEXX cargado correctamente',
      stats 
    });

  } catch (error: any) {
    console.error('❌ Error sincronizando catálogo:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
