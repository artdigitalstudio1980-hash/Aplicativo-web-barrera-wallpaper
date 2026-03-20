import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Modern', nameEs: 'Moderno', slug: 'modern' },
  { name: 'Classic', nameEs: 'Clásico', slug: 'classic' },
  { name: 'Tropical', nameEs: 'Tropical', slug: 'tropical' },
  { name: 'Abstract', nameEs: 'Abstracto', slug: 'abstract' },
  { name: 'Minimalist', nameEs: 'Minimalista', slug: 'minimalist' },
  { name: 'Textured', nameEs: 'Texturizado', slug: 'textured' },
  { name: 'Geometric', nameEs: 'Geométrico', slug: 'geometric' },
  { name: 'Floral', nameEs: 'Floral', slug: 'floral' },
];

const STYLE_NAMES: string[][] = [
  ['modern', 'geometric'], ['classic', 'elegant'], ['tropical', 'botanical'],
  ['abstract', 'modern'], ['minimalist', 'modern'], ['textured', 'natural'],
  ['geometric', 'contemporary'], ['floral', 'romantic'],
];

const MATERIALS = [
  'Non-woven fabric, pre-pasted',
  'Premium vinyl, washable',
  'Paper, eco-friendly ink',
  'Non-woven fabric, paste-the-wall',
  'Vinyl, embossed texture',
  'Fabric-backed vinyl',
];

const COLORS_SETS = [
  ['gold', 'navy', 'white'], ['cream', 'beige', 'taupe'], ['emerald', 'forest', 'white'],
  ['blue', 'silver', 'white'], ['charcoal', 'slate', 'gray'], ['terracotta', 'rust', 'ivory'],
  ['blush', 'rose', 'cream'], ['midnight', 'sapphire', 'gold'],
];

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  console.log('🌱 Seeding catalog from local wallpaper images...');

  // Ensure categories exist
  const catMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        nameEs: cat.nameEs,
        slug: cat.slug,
        isActive: true,
        order: CATEGORIES.indexOf(cat) + 1,
      },
    });
    catMap[cat.slug] = record.id;
  }
  console.log(`✅ Categories ready: ${Object.keys(catMap).length}`);

  // Read catalog images
  const catalogDir = path.join(__dirname, '../public/catalogo_wallpaper');
  const files = fs.existsSync(catalogDir)
    ? fs.readdirSync(catalogDir).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    : [];

  console.log(`📷 Found ${files.length} catalog images`);

  let seeded = 0;
  const catSlugs = CATEGORIES.map(c => c.slug);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const imageUrl = `/catalogo_wallpaper/${file}`;
    const index = i + 1;
    const catSlug = catSlugs[i % catSlugs.length];
    const catId = catMap[catSlug];
    const styleSet = STYLE_NAMES[i % STYLE_NAMES.length];
    const colorSet = COLORS_SETS[i % COLORS_SETS.length];
    const material = MATERIALS[i % MATERIALS.length];
    const price = parseFloat((45 + (i % 10) * 10).toFixed(2));

    const name = `Barrera Design ${String(index).padStart(3, '0')}`;
    const nameEs = `Diseño Barrera ${String(index).padStart(3, '0')}`;
    const slug = `barrera-design-${String(index).padStart(3, '0')}`;
    const sku = `BW-CAT-${String(index).padStart(4, '0')}`;

    try {
      await prisma.product.upsert({
        where: { sku },
        update: {
          images: [imageUrl],
          isActive: true,
        },
        create: {
          name,
          nameEs,
          description: `Premium wallpaper design from the Barrera collection. ${styleSet.join(', ')} style with ${colorSet.join(', ')} tones. Professional installation available in Miami.`,
          descriptionEs: `Diseño de papel tapiz premium de la colección Barrera. Estilo ${styleSet.join(', ')} con tonos ${colorSet.join(', ')}. Instalación profesional disponible en Miami.`,
          slug,
          sku,
          price,
          images: [imageUrl],
          colors: colorSet,
          styles: styleSet,
          dimensions: 'Roll: 20.5" × 33 ft (covers ~56 sq ft)',
          material,
          materialEs: material,
          isCustomizable: true,
          isActive: true,
          isFeatured: index <= 12,
          stock: 50,
          categoryId: catId,
        },
      });
      seeded++;
    } catch (e: any) {
      // slug conflict — update instead
      if (e.code === 'P2002') {
        try {
          await prisma.product.update({
            where: { slug },
            data: { images: [imageUrl], isActive: true },
          });
          seeded++;
        } catch (_) {}
      } else {
        console.error(`  ⚠ Skipped ${file}: ${e.message}`);
      }
    }
  }

  console.log(`✅ Seeded/updated ${seeded} catalog products from images`);
  console.log('🎉 Catalog seed complete!');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
