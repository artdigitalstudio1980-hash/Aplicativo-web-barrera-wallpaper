import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Pure', nameEs: 'Pure', slug: 'pure', description: 'Standard high-quality glass textile wallcoverings.', descriptionEs: 'Revestimientos de tejido de vidrio estándar de alta calidad.' },
  { name: 'Active', nameEs: 'Active', slug: 'active', description: 'Functional wallcoverings with magnetic, acoustic, or fire-protective properties.', descriptionEs: 'Revestimientos funcionales con propiedades magnéticas, acústicas o de protección contra incendios.' },
  { name: 'Phantasy', nameEs: 'Phantasy', slug: 'phantasy', description: 'Designer glass textile patterns for high-end interiors.', descriptionEs: 'Patrones de tejido de vidrio de diseño para interiores de alta gama.' },
];

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  console.log('🌱 Syncing catalog from public/catalogo...');

  // 1. Ensure categories exist
  const catMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nameEs: cat.nameEs,
        description: cat.description,
        descriptionEs: cat.descriptionEs,
      },
      create: {
        name: cat.name,
        nameEs: cat.nameEs,
        slug: cat.slug,
        description: cat.description,
        descriptionEs: cat.descriptionEs,
        isActive: true,
      },
    });
    catMap[cat.slug] = record.id;
  }
  console.log(`✅ Categories synchronized: ${Object.keys(catMap).length}`);

  // 2. Read catalog images
  const catalogDir = path.join(process.cwd(), 'public/catalogo');
  if (!fs.existsSync(catalogDir)) {
    console.error(`❌ Catalog directory not found: ${catalogDir}`);
    return;
  }

  const files = fs.readdirSync(catalogDir).filter(f => {
    const isImage = /\.(png|jpg|jpeg|webp)$/i.test(f);
    const isInfo = /description|overview|lifestyle|logo|glassfleece|intro|page|cover/i.test(f);
    return isImage && !isInfo;
  });

  console.log(`📷 Found ${files.length} product images to process`);

  // 3. Deactivate old products that are not in this folder (optional, but requested "only use images in public/catalogo")
  // For now, we just upsert and make sure they are active.

  let seeded = 0;
  for (const file of files) {
    // Determine category from filename
    let catSlug = 'pure';
    if (file.startsWith('active-')) catSlug = 'active';
    else if (file.startsWith('phantasy-')) catSlug = 'phantasy';
    
    const catId = catMap[catSlug];
    
    // Parse name from filename: active-absorb-060.png -> Absorb 060
    const cleanName = file.replace(`${catSlug}-`, '').replace(/\.[^/.]+$/, '').replace(/-/g, ' ');
    const name = cleanName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const sku = `SYSTEXX-${catSlug.toUpperCase()}-${file.replace(`${catSlug}-`, '').replace(/\.[^/.]+$/, '').toUpperCase()}`;
    const slug = slugify(`${catSlug}-${cleanName}`);
    
    // Metadata based on category
    let price = 89.00;
    let dimensions = '1m x 25m (25m²)';
    let material = 'Glass Textile';
    
    if (catSlug === 'active') {
      price = 149.00;
      dimensions = '1m x 15m (15m²)';
      material = 'Functional Glass Textile';
    } else if (catSlug === 'phantasy') {
      price = 119.00;
      dimensions = '1m x 25m (25m²)';
      material = 'Designer Glass Textile';
    }

    try {
      await prisma.product.upsert({
        where: { sku },
        update: {
          name: `SYSTEXX ${catSlug.charAt(0).toUpperCase() + catSlug.slice(1)} ${name}`,
          nameEs: `SYSTEXX ${catSlug.charAt(0).toUpperCase() + catSlug.slice(1)} ${name}`,
          images: [`/catalogo/${file}`],
          isActive: true,
          categoryId: catId,
          price: price,
          dimensions: dimensions,
          material: material,
        },
        create: {
          name: `SYSTEXX ${catSlug.charAt(0).toUpperCase() + catSlug.slice(1)} ${name}`,
          nameEs: `SYSTEXX ${catSlug.charAt(0).toUpperCase() + catSlug.slice(1)} ${name}`,
          slug,
          sku,
          price,
          images: [`/catalogo/${file}`],
          colors: ['white'],
          styles: [catSlug, 'modern'],
          dimensions,
          material,
          materialEs: material,
          isActive: true,
          categoryId: catId,
        },
      });
      seeded++;
    } catch (e: any) {
      console.error(`  ⚠ Error processing ${file}: ${e.message}`);
    }
  }

  // 4. Deactivate products that are not in the new list to ensure "only use images in public/catalogo"
  const currentSkus = files.map(file => {
    const catSlug = file.startsWith('active-') ? 'active' : (file.startsWith('phantasy-') ? 'phantasy' : 'pure');
    return `SYSTEXX-${catSlug.toUpperCase()}-${file.replace(`${catSlug}-`, '').replace(/\.[^/.]+$/, '').toUpperCase()}`;
  });

  const deactivated = await prisma.product.updateMany({
    where: {
      sku: { notIn: currentSkus },
      isActive: true
    },
    data: { isActive: false }
  });

  console.log(`✅ Seeded/updated ${seeded} products`);
  console.log(`📴 Deactivated ${deactivated.count} old products`);
  console.log('🎉 Catalog sync complete!');
}

main()
  .catch(e => { console.error('❌ Sync failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
