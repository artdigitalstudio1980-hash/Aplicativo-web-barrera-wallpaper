import { prisma } from "./prisma";
import fs from "fs";
import path from "path";

export async function syncCatalog() {
  const filePath = path.join(process.cwd(), "prisma", "catalog_master.json");
  
  if (!fs.existsSync(filePath)) {
    throw new Error("Catalog master file not found");
  }

  const rawData = fs.readFileSync(filePath, "utf-8");
  const catalog = JSON.parse(rawData);

  // Asegurar que existe una categoría por defecto
  let category = await prisma.category.findUnique({ where: { slug: "default-category" } });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "General",
        nameEs: "General",
        slug: "default-category",
      }
    });
  }

  for (const catData of catalog) {
    for (const prodData of catData.products) {
      await prisma.product.upsert({
        where: { sku: prodData.sku },
        update: {
          name: prodData.name,
          nameEs: prodData.nameEs,
          description: prodData.description,
          descriptionEs: prodData.descriptionEs,
          dimensions: prodData.dimensions,
          price: 99.99, // Valor por defecto temporal
        },
        create: {
          sku: prodData.sku,
          name: prodData.name,
          nameEs: prodData.nameEs,
          slug: prodData.sku.toLowerCase().replace(/\s+/g, '-'),
          description: prodData.description,
          descriptionEs: prodData.descriptionEs,
          dimensions: prodData.dimensions,
          price: 99.99,
          categoryId: category.id,
          images: [],
          colors: [],
          styles: [],
        }
      });
    }
  }

  return { message: "Catalog synchronized successfully" };
}
