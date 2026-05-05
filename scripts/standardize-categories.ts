
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Standardizing SYSTEXX Categories...');

  const mappings = [
    { old: 'Pure', new: 'SYSTEXX Pure', slug: 'systexx-pure' },
    { old: 'Active', new: 'SYSTEXX Active', slug: 'systexx-active' },
    { old: 'Phantasy', new: 'SYSTEXX Phantasy', slug: 'systexx-phantasy' },
  ];

  for (const m of mappings) {
    // 1. Ensure new category exists
    const newCat = await prisma.category.upsert({
      where: { slug: m.slug },
      update: { name: m.new, nameEs: m.new },
      create: { name: m.new, nameEs: m.new, slug: m.slug, isActive: true }
    });

    // 2. Find old category
    const oldCat = await prisma.category.findFirst({ where: { name: m.old } });
    if (oldCat) {
      console.log(`Moving products from ${m.old} to ${m.new}...`);
      const updateResult = await prisma.product.updateMany({
        where: { categoryId: oldCat.id },
        data: { categoryId: newCat.id }
      });
      console.log(`Updated ${updateResult.count} products.`);

      // 3. Delete old category if empty
      const remaining = await prisma.product.count({ where: { categoryId: oldCat.id } });
      if (remaining === 0) {
        await prisma.category.delete({ where: { id: oldCat.id } });
        console.log(`Deleted empty category: ${m.old}`);
      }
    }
  }

  console.log('✅ Standardization complete.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
