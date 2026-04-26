require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const products = await prisma.product.findMany({ take: 2 });
  console.log(JSON.stringify(products, null, 2));
}
main().finally(() => prisma.$disconnect());
