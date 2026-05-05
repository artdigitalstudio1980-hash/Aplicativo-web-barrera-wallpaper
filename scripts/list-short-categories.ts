
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      category: {
        name: { in: ['Pure', 'Active', 'Phantasy'] }
      }
    },
    include: { category: true }
  });

  console.log(`Found ${products.length} products in short-named categories.`);
  products.forEach(p => {
    console.log(`SKU: ${p.sku} | Name: ${p.name} | Category: ${p.category?.name}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
