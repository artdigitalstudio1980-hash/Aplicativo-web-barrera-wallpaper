import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const catalogPath = path.join(process.cwd(), 'public', 'catalogo');
    
    // Check if directory exists
    if (!fs.existsSync(catalogPath)) {
      return NextResponse.json({ success: false, error: 'Directory not found' }, { status: 404 });
    }

    const files = fs.readdirSync(catalogPath);
    const images = files.filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

    // Load master metadata
    const masterPath = path.join(process.cwd(), 'prisma', 'catalog_master.json');
    let masterData: any[] = [];
    if (fs.existsSync(masterPath)) {
      masterData = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
    }

    // Flatten products from master data for easy lookup
    const productsMetadata: any[] = [];
    masterData.forEach(section => {
      section.products.forEach((p: any) => {
        productsMetadata.push({
          ...p,
          categoryName: section.category
        });
      });
    });

    // Map images to product data
    const catalog = images.map(fileName => {
      const lowerFile = fileName.toLowerCase();
      let type: 'pure' | 'active' | 'phantasy' = 'pure';
      
      if (lowerFile.startsWith('active-')) type = 'active';
      else if (lowerFile.startsWith('phantasy-')) type = 'phantasy';
      else if (lowerFile.startsWith('pure-')) type = 'pure';

      // Try to find a match in metadata by SKU or name in the filename
      // e.g. "active-absorb-060.png" might match something with "060" in SKU
      const match = productsMetadata.find(p => {
        const skuPart = p.sku.split('-').pop()?.toLowerCase();
        return skuPart && lowerFile.includes(skuPart);
      });

      return {
        id: fileName.replace(/\.[^/.]+$/, ""), // File name as ID
        fileName,
        imageUrl: `/catalogo/${fileName}`,
        name: match?.name || fileName.split('-').slice(1).join(' ').replace(/\.[^/.]+$/, "").split(' ').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        sku: match?.sku || `SYS-${type.substring(0, 3).toUpperCase()}-${fileName.split('-').pop()?.replace(/\.[^/.]+$/, "") || '000'}`,
        type,
        dimensions: match?.dimensions || '1.00 x 25.00 m',
        description: match?.description || 'Premium German-engineered glass fiber wallcovering.',
        price: match?.price || 45.00
      };
    });

    return NextResponse.json({
      success: true,
      count: catalog.length,
      products: catalog
    });
  } catch (error: any) {
    console.error('Local catalog error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
