import { prisma } from "./prisma";
import fs from "fs";
import path from "path";

export async function syncCatalog() {
  console.log('🚀 Iniciando Sincronización desde API/Dashboard...');

  // 1. Obtener lista de imágenes disponibles
  const catalogDir = path.join(process.cwd(), 'public/catalogo');
  let availableImages: string[] = [];
  if (fs.existsSync(catalogDir)) {
    availableImages = fs.readdirSync(catalogDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'));
  }

  // Helper para buscar imagen con lógica flexible
  const findImage = (category: string, sku: string, name: string) => {
    const lowerCategory = category.toLowerCase();
    const lowerSku = sku.toLowerCase();
    const lowerName = name.toLowerCase();
    
    const skuParts = lowerSku.split('-');
    const skuLastPart = skuParts[skuParts.length - 1];
    const nameParts = lowerName.split(/\s+/).filter(p => p.length > 2);

    for (const img of availableImages) {
      const lowerImg = img.toLowerCase();
      
      // Coincidencia por SKU
      if (lowerImg.includes(skuLastPart) && skuLastPart.length > 1) {
        if (lowerCategory.includes('pure') && lowerImg.includes('pure')) return `/catalogo/${img}`;
        if (lowerCategory.includes('phantasy') && lowerImg.includes('phantasy')) return `/catalogo/${img}`;
        if (lowerCategory.includes('active') && lowerImg.includes('active')) return `/catalogo/${img}`;
        if (!lowerImg.includes('pure') && !lowerImg.includes('phantasy') && !lowerImg.includes('active')) {
             return `/catalogo/${img}`;
        }
      }

      // Coincidencia por partes del nombre
      for (const part of nameParts) {
        if (lowerImg.includes(part) && lowerImg.includes(skuLastPart)) {
          return `/catalogo/${img}`;
        }
      }
    }
    return null;
  };

  const filePath = path.join(process.cwd(), "prisma", "catalog_master.json");
  if (!fs.existsSync(filePath)) {
    throw new Error("Catalog master file not found");
  }

  const rawData = fs.readFileSync(filePath, "utf-8");
  const catalog = JSON.parse(rawData);

  let totalUpdated = 0;

  for (const catData of catalog) {
    const catSlug = catData.category.toLowerCase().replace(/\s+/g, '-');
    const category = await prisma.category.upsert({
      where: { slug: catSlug },
      update: { name: catData.category, nameEs: catData.category },
      create: {
        name: catData.category,
        nameEs: catData.category,
        slug: catSlug,
        isActive: true,
      }
    });

    for (const prodData of catData.products) {
      const imagePath = findImage(catData.category, prodData.sku, prodData.name);
      const images = imagePath ? [imagePath] : [];

      await prisma.product.upsert({
        where: { sku: prodData.sku },
        update: {
          name: prodData.name,
          nameEs: prodData.nameEs,
          description: prodData.description,
          descriptionEs: prodData.descriptionEs,
          dimensions: prodData.dimensions,
          images: images.length > 0 ? images : undefined,
          isActive: true,
          categoryId: category.id,
        },
        create: {
          sku: prodData.sku,
          name: prodData.name,
          nameEs: prodData.nameEs,
          slug: prodData.sku.toLowerCase().replace(/\s+/g, '-'),
          description: prodData.description,
          descriptionEs: prodData.descriptionEs,
          dimensions: prodData.dimensions,
          price: 45.0,
          images: images,
          colors: [],
          styles: [catData.category.split(' ')[1]?.toLowerCase() || 'systexx'],
          material: "Glass Fiber / Fibra de Vidrio",
          materialEs: "Fibra de Vidrio con Tecnología Aqua",
          isActive: true,
          stock: 999,
          categoryId: category.id,
        }
      });
      totalUpdated++;
    }
  }

  return { message: `Catalog synchronized successfully. ${totalUpdated} products processed.` };
}
