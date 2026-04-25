import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const IMAGES_DIR = path.join(process.cwd(), 'public/catalog-info/imagen_catalogo');

async function main() {
  console.log('🔧 Iniciando reparación de rutas de imágenes del catálogo...');
  
  const products = await prisma.product.findMany({
    where: { sku: { startsWith: 'SYS-' } }
  });

  console.log(`📦 Encontrados ${products.length} productos SYSTEXX.`);

  for (const product of products) {
    // Generamos el posible nombre de archivo basado en el slug o sku
    // El seed original suele usar nombres limpios como: active-magnetic-m20.png
    let imageName = '';
    
    // Intentamos deducir el nombre del archivo de la imagen original si existe
    if (product.images && product.images.length > 0) {
      const oldPath = product.images[0];
      imageName = oldPath.split('/').pop() || '';
    }

    if (!imageName) {
      console.warn(`⚠️ No se pudo determinar imagen para ${product.sku}`);
      continue;
    }

    const newPath = `/catalog-info/imagen_catalogo/${imageName}`;
    const fullPath = path.join(process.cwd(), 'public', newPath);

    if (fs.existsSync(fullPath)) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          images: [newPath],
          imageUrl: newPath
        }
      });
      console.log(`✅ Actualizado: ${product.sku} -> ${newPath}`);
    } else {
      console.error(`❌ Archivo NO encontrado en disco: ${fullPath}`);
      
      // Intento de búsqueda por SKU si el nombre del archivo falló
      const skuBase = product.sku.toLowerCase().replace(/[^a-z0-9]/g, '-');
      // Buscar archivos que contengan partes del SKU en IMAGES_DIR
      const files = fs.readdirSync(IMAGES_DIR);
      const match = files.find(f => f.toLowerCase().includes(skuBase));
      
      if (match) {
        const foundPath = `/catalog-info/imagen_catalogo/${match}`;
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: [foundPath],
            imageUrl: foundPath
          }
        });
        console.log(`✨ Recuperado por SKU: ${product.sku} -> ${foundPath}`);
      }
    }
  }

  console.log('🎉 Reparación completada.');
}

main()
  .catch((e) => {
    console.error('❌ Error reparando imágenes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
