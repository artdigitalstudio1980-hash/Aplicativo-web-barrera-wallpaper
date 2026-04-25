const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '../public/catalogo_wallpaper');
const WALLPAPERS_DIR = path.join(__dirname, '../public/wallpapers');
const INFO_DIR = path.join(__dirname, '../public/catalog-info');

if (!fs.existsSync(WALLPAPERS_DIR)) fs.mkdirSync(WALLPAPERS_DIR, { recursive: true });
if (!fs.existsSync(INFO_DIR)) fs.mkdirSync(INFO_DIR, { recursive: true });

const WALLPAPER_MAP = {
  'Captura desde 2026-03-13 16-25-06.png': 'active-magnetic-m22.png',
  'Captura desde 2026-03-13 16-25-38.png': 'active-magnetic-m39.png',
  'Captura desde 2026-03-13 16-26-41.png': 'active-magnetic-m20.png',
  'Captura desde 2026-03-13 16-27-36.png': 'active-acoustherm-233.png',
  'Captura desde 2026-03-13 16-27-48.png': 'active-acoustherm-904.png',
  'Captura desde 2026-03-13 16-28-27.png': 'active-reno-938-s38-sp38.png',
  'Captura desde 2026-03-13 16-29-01.png': 'active-absorb-glassfleece.png',
  'Captura desde 2026-03-13 16-29-17.png': 'active-absorb-633.png',
  'Captura desde 2026-03-13 16-29-26.png': 'active-absorb-639.png',
  'Captura desde 2026-03-13 16-29-36.png': 'active-absorb-060.png',
  'Captura desde 2026-03-13 16-30-03.png': 'active-fireprotect-fp-glassfleece.png',
  'Captura desde 2026-03-13 16-30-15.png': 'active-fireprotect-fp78.png',
  'Captura desde 2026-03-13 16-30-33.png': 'active-fireprotect-fp79.png',
  'Captura desde 2026-03-13 16-30-40.png': 'active-fireprotect-fp04.png',
  'Captura desde 2026-03-13 16-31-32.png': 'active-logo-l65.png',
  'Captura desde 2026-03-13 16-31-40.png': 'active-logo-l00.png',
  'Captura desde 2026-03-13 16-32-40.png': 'phantasy-diamond-dust-072.png',
  'Captura desde 2026-03-13 16-32-49.png': 'phantasy-bamboo-050.png',
  'Captura desde 2026-03-13 16-33-10.png': 'phantasy-versailles-080.png',
  'Captura desde 2026-03-13 16-33-30.png': 'phantasy-stardust-073.png',
  'Captura desde 2026-03-13 16-35-03.png': 'pure-structure-633.png',
  'Captura desde 2026-03-13 16-42-33.png': 'pure-jute-004.png',
};

const INFO_MAP = {
  'Captura desde 2026-03-13 16-24-30.png': 'active-category-overview.png',
  'Captura desde 2026-03-13 16-24-40.png': 'systexx-properties.png',
  'Captura desde 2026-03-13 16-24-52.png': 'cover-systexx-collection.png',
  'Captura desde 2026-03-13 16-25-18.png': 'active-magnetic-description.png',
  'Captura desde 2026-03-13 16-25-48.png': 'active-magnetic-collection-overview.png',
  'Captura desde 2026-03-13 16-26-12.png': 'active-magnetic-whiteboard-description.png',
  'Captura desde 2026-03-13 16-26-25.png': 'active-magnetic-whiteboard-overview.png',
  'Captura desde 2026-03-13 16-26-51.png': 'active-acoustherm-intro.png',
  'Captura desde 2026-03-13 16-27-03.png': 'active-acoustherm-description.png',
  'Captura desde 2026-03-13 16-27-23.png': 'active-reno-overview.png',
  'Captura desde 2026-03-13 16-28-00.png': 'active-reno-description.png',
  'Captura desde 2026-03-13 16-28-09.png': 'active-absorb-description.png',
  'Captura desde 2026-03-13 16-28-51.png': 'active-absorb-65pct-overview.png',
  'Captura desde 2026-03-13 16-29-46.png': 'active-fireprotect-overview.png',
  'Captura desde 2026-03-13 16-29-55.png': 'active-fireprotect-description.png',
  'Captura desde 2026-03-13 16-30-49.png': 'active-logo-lifestyle.png',
  'Captura desde 2026-03-13 16-31-00.png': 'active-logo-description.png',
  'Captura desde 2026-03-13 16-31-13.png': 'phantasy-description.png',
  'Captura desde 2026-03-13 16-32-03.png': 'phantasy-diamond-dust-lifestyle.png',
  'Captura desde 2026-03-13 16-32-11.png': 'phantasy-imagination-page.png',
  'Captura desde 2026-03-13 16-32-21.png': 'phantasy-bamboo-lifestyle.png',
  'Captura desde 2026-03-13 16-32-58.png': 'phantasy-orient-lifestyle.png',
  'Captura desde 2026-03-13 16-33-22.png': 'phantasy-versailles-lifestyle.png',
  'Captura desde 2026-03-13 16-33-41.png': 'phantasy-stardust-lifestyle.png',
  'Captura desde 2026-03-13 16-42-33.png': 'back-cover-vitrulan.png',
};

function copyFile(src, dest, label) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`  ✅ ${label}`);
    return true;
  } catch (e) {
    console.log(`  ❌ MISSING: ${label} - ${e.message}`);
    return false;
  }
}

console.log('\n📁 Organizing SYSTEXX catalog images...\n');
console.log('🖼️  Copying WALLPAPER product images → public/wallpapers/');

let wallpaperCount = 0;
for (const [src, dest] of Object.entries(WALLPAPER_MAP)) {
  const srcPath = path.join(SRC, src);
  const destPath = path.join(WALLPAPERS_DIR, dest);
  if (copyFile(srcPath, destPath, dest)) wallpaperCount++;
}

console.log(`\n📋 Copying INFORMATIVE images → public/catalog-info/`);

let infoCount = 0;
for (const [src, dest] of Object.entries(INFO_MAP)) {
  const srcPath = path.join(SRC, src);
  const destPath = path.join(INFO_DIR, dest);
  if (copyFile(srcPath, destPath, dest)) infoCount++;
}

const allFiles = fs.readdirSync(SRC).filter(f => f.endsWith('.png'));
const classified = new Set([...Object.keys(WALLPAPER_MAP), ...Object.keys(INFO_MAP)]);
const unclassified = allFiles.filter(f => !classified.has(f));

if (unclassified.length > 0) {
  console.log(`\n⚠️  Unclassified images (${unclassified.length}) - moved to catalog-info as review-needed:`);
  for (const file of unclassified) {
    const srcPath = path.join(SRC, file);
    const destPath = path.join(INFO_DIR, 'review-' + file.replace(/ /g, '-'));
    copyFile(srcPath, destPath, 'review-' + file);
  }
}

console.log(`\n✨ Done!`);
console.log(`   Wallpaper images: ${wallpaperCount}`);
console.log(`   Informative images: ${infoCount}`);
console.log(`   Unclassified (moved to review): ${unclassified.length}`);
console.log(`\n📌 Next: run 'npx tsx --require dotenv/config scripts/seed-systexx.ts' to seed the DB\n`);
