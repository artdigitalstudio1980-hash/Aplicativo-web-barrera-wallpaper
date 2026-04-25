require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDatabaseData() {
  try {
    console.log('🔧 Fixing remaining database data issues...\n');

    // 1. Delete products with empty arrays in images field
    console.log('1. Cleaning up products with empty arrays...');
    const deletedProducts1 = await prisma.$executeRaw`
      DELETE FROM "Product" 
      WHERE "images"::text = '[]'
    `;
    console.log(`   ✓ Deleted ${deletedProducts1} products with empty image arrays\n`);

    // 2. Delete all AIGenerationRequest with any color data (they have wrong format)
    console.log('2. Cleaning up ALL AI generation requests...');
    const deletedRequests = await prisma.$executeRaw`
      TRUNCATE TABLE "AIGenerationRequest" CASCADE
    `;
    console.log(`   ✓ Truncated AIGenerationRequest table\n`);

    // 3. Delete all remaining products to start fresh
    console.log('3. Cleaning up ALL products...');
    const deletedProducts2 = await prisma.$executeRaw`
      TRUNCATE TABLE "Product" CASCADE
    `;
    console.log(`   ✓ Truncated Product table\n`);

    console.log('✅ Database cleanup completed successfully!');
    console.log('   Note: All products and AI generation requests have been deleted.');
    console.log('   The admin can add new products through the admin panel.');
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabaseData();
