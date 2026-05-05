
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: { where: { isActive: true } } }
      }
    }
  });

  console.log('--- PRODUCTS BY CATEGORY ---');
  categories.forEach(c => {
    console.log(`${c.name}: ${c._count.products} active products`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
