import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  console.log(`📦 Total de productos en la DB: ${count}`);
  
  const products = await prisma.product.findMany({
    take: 10,
    select: { id: true, sku: true, name: true, imageUrl: true }
  });
  
  console.log('--- Últimos 10 productos cargados ---');
  products.forEach(p => console.log(`SKU: ${p.sku} | Nombre: ${p.name} | URL: ${p.imageUrl}`));
}

main()
  .catch((e) => {
    console.error('❌ Error consultando la DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
