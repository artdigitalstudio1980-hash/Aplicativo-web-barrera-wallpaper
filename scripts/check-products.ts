
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const activeCount = await prisma.product.count({ where: { isActive: true } });
  const totalCount = await prisma.product.count();
  console.log(`📊 Total Products: ${totalCount} | Active Products: ${activeCount}`);
  
  console.log('--- DIAGNÓSTICO DE PRODUCTOS (Primeros 10) ---');
  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  products.forEach((p, i) => {
    console.log(`[${i + 1}] SKU: ${p.sku} | Name: ${p.name}`);
    console.log(`    Images Field: ${JSON.stringify(p.images)}`);
    console.log(`    Cloud Path: ${p.cloudStoragePath || 'NULL'}`);
    console.log(`    Category: ${p.category?.name}`);
    console.log('-------------------------------------------');
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
