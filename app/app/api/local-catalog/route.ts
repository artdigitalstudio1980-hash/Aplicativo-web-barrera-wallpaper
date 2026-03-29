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
    const images = files.filter(f => {
      const isImg = /\.(png|jpg|jpeg|webp)$/i.test(f);
      if (!isImg) return false;
      
      const lower = f.toLowerCase();
      // Filter out non-product informational images
      if (lower.includes('description') || lower.includes('overview') || 
          lower.includes('lifestyle') || lower.includes('glassfleece') ||
          lower.includes('logo')) {
        return false;
      }
      return true;
    });

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
      const lowerFile = fileName.toLowerCase().replace(/\.[^/.]+$/, ""); // remove extension
      const parts = lowerFile.split('-');
      
      let type: 'pure' | 'active' | 'phantasy' = 'pure';
      if (lowerFile.startsWith('active-')) type = 'active';
      else if (lowerFile.startsWith('phantasy-')) type = 'phantasy';
      else if (lowerFile.startsWith('pure-')) type = 'pure';

      // Try to find a match in metadata
      // Algorithm: Check if the SKU ends with the last part of the filename (numeric code)
      // OR check if the product name is contained in the filename
      const match = productsMetadata.find(p => {
        const skuPart = p.sku.split('-').pop()?.toLowerCase();
        const namePart = p.name.toLowerCase().replace(/\s+/g, '-');
        
        // Exact numeric match at the end
        if (skuPart && parts.includes(skuPart)) return true;
        // Name match
        if (lowerFile.includes(namePart)) return true;
        
        return false;
      });

      return {
        id: lowerFile, 
        fileName,
        imageUrl: `/catalogo/${fileName}`,
        name: match?.name || parts.slice(1).map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        sku: match?.sku || `SYS-${type.substring(0, 3).toUpperCase()}-${parts.pop()?.toUpperCase() || '000'}`,
        type,
        dimensions: match?.dimensions || '1.00 x 25.00 m',
        weight: match?.weight || '225 g/m²',
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
