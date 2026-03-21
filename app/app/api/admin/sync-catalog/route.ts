import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Este es un endpoint de emergencia para sincronizar el catálogo en producción
// sin necesidad de acceso SSH.
export async function GET() {
  try {
    console.log('🌱 Iniciando sincronización manual de SYSTEXX...');
    
    // Categorías
    const categories = [
      { name: 'SYSTEXX Active', nameEs: 'SYSTEXX Active', slug: 'systexx-active' },
      { name: 'SYSTEXX Phantasy', nameEs: 'SYSTEXX Phantasy', slug: 'systexx-phantasy' },
      { name: 'SYSTEXX Pure', nameEs: 'SYSTEXX Pure', slug: 'systexx-pure' }
    ];

    const cats: Record<string, any> = {};
    for (const cat of categories) {
      const c = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: cat,
        create: { ...cat, isActive: true, order: 10 }
      });
      cats[cat.slug] = c;
    }

    // Productos de ejemplo (Los principales de SYSTEXX)
    const products = [
      {
        sku: 'SYS-ACT-MAG-M20',
        name: 'Active Magnetic M20',
        nameEs: 'Active Magnetic M20',
        slug: 'systexx-active-magnetic-m20',
        descriptionEs: 'Revestimiento magnético liso de alta calidad.',
        price: 99.99,
        images: ['/catalog-info/imagen_catalogo/active-magnetic-m20.png'],
        categoryId: cats['systexx-active'].id,
        materialEs: 'Fibra de Vidrio Magnética'
      },
      {
        sku: 'SYS-ACT-ACO-233',
        name: 'Active AcousTherm 233',
        nameEs: 'Active AcousTherm 233',
        slug: 'systexx-active-acoustherm-233',
        descriptionEs: 'Aislamiento acústico y térmico premium.',
        price: 89.99,
        images: ['/catalog-info/imagen_catalogo/active-acoustherm-233.png'],
        categoryId: cats['systexx-active'].id,
        materialEs: 'Fibra de Vidrio Acústica'
      },
      {
        sku: 'SYS-PHA-DD-072',
        name: 'Phantasy Diamond Dust 072',
        nameEs: 'Phantasy Diamond Dust 072',
        slug: 'systexx-phantasy-diamond-dust-072',
        descriptionEs: 'Diseño espectacular inspirado en diamantes.',
        price: 79.99,
        images: ['/catalog-info/imagen_catalogo/phantasy-diamond-dust-072.png'],
        categoryId: cats['systexx-phantasy'].id,
        materialEs: 'Fibra de Vidrio con Relieve'
      }
      // Añadiremos más si es necesario, pero estos son los clave para probar
    ];

    for (const prod of products) {
      await prisma.product.upsert({
        where: { sku: prod.sku },
        update: prod,
        create: { ...prod, isActive: true, stock: 999 }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Catálogo sincronizado con éxito en Hostinger',
      categories: Object.keys(cats).length,
      products: products.length
    });

  } catch (error: any) {
    console.error('Error en sincronización:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
