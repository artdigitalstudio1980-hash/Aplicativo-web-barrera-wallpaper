require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDatabaseData() {
  try {
    console.log('🔧 Fixing database data issues...\n');

    // 1. Delete products with malformed JSON in images field
    console.log('1. Cleaning up products with malformed data...');
    const deletedProducts = await prisma.$executeRaw`
      DELETE FROM "Product" 
      WHERE "images"::text LIKE '%/images/%' 
      AND "images"::text NOT LIKE '[%]%'
    `;
    console.log(`   ✓ Deleted ${deletedProducts} products with malformed images\n`);

    // 2. Delete AI generation requests with malformed colors
    console.log('2. Cleaning up AI generation requests with malformed data...');
    const deletedRequests = await prisma.$executeRaw`
      DELETE FROM "AIGenerationRequest"
      WHERE "colors"::text LIKE '%white%'
      AND "colors"::text LIKE '%[%]%'
    `;
    console.log(`   ✓ Deleted ${deletedRequests} AI requests with malformed colors\n`);

    console.log('✅ Database cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabaseData();
