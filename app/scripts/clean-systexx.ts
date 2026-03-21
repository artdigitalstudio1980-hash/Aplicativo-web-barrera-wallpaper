import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando productos de SYSTEXX para recarga...');
  const result = await prisma.product.deleteMany({
    where: {
      sku: {
        startsWith: 'SYS-',
      },
    },
  });
  console.log(`✅ Eliminados ${result.count} productos de SYSTEXX.`);
}

main()
  .catch((e) => {
    console.error('❌ Error limpiando la DB:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
