import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Actualizando precios de todos los productos a 350.0...');
  
  const result = await prisma.product.updateMany({
    data: {
      price: 350.0,
    },
  });

  console.log(`Precios actualizados para ${result.count} productos.`);
}

main()
  .catch((e) => {
    console.error('Error actualizando precios:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
