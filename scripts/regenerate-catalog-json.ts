
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Regenerating catalog_master.json from database...');

  const categories = await prisma.category.findMany({
    where: {
      name: { startsWith: 'SYSTEXX' }
    },
    include: {
      products: {
        where: { isActive: true }
      }
    }
  });

  const catalog = categories.map(c => ({
    category: c.name,
    products: c.products.map(p => ({
      sku: p.sku,
      name: p.name,
      nameEs: p.nameEs,
      weight: (p as any).weight || '225 g/m²',
      dimensions: p.dimensions || '1 x 25 m',
      description: p.description,
      descriptionEs: p.descriptionEs
    }))
  }));

  const outputPath = path.join(process.cwd(), 'prisma', 'catalog_master.json');
  fs.writeFileSync(outputPath, JSON.stringify(catalog, null, 2));

  console.log(`✅ Regenerated ${outputPath} with ${categories.reduce((acc, c) => acc + c.products.length, 0)} products.`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
