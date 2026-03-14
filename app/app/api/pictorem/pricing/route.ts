
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { pictoremClient } from '@/lib/pictorem';
import { prisma } from '@/lib/prisma';

interface PricingRequest {
  material: string;
  type: string;
  orientation: string;
  width: number;
  height: number;
  numCopies?: number;
  additional?: string[];
  deliveryCountry?: string;
  deliveryProvince?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: PricingRequest = await req.json();
    const {
      material,
      type,
      orientation,
      width,
      height,
      numCopies = 1,
      additional = [],
      deliveryCountry = 'USA',
      deliveryProvince = ''
    } = body;

    // Validate required fields
    if (!material || !type || !orientation || !width || !height) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pictoremOptions = {
      numCopies,
      material,
      type,
      orientation,
      width,
      height,
      additional
    };

    // Get our markup configuration first
    const pictoremProduct = await prisma.pictoremProduct.findUnique({
      where: {
        material_type: {
          material,
          type
        }
      }
    });

    const baseMarkup = pictoremProduct?.baseMarkup || 2.0;
    const minPrice = pictoremProduct?.minPrice || 25.0;
    const maxPrice = pictoremProduct?.maxPrice || 500.0;

    let pictoremTotal = 0;
    let leadTimeDays = null;
    let useFallbackPricing = false;

    try {
      // Try to get pricing from Pictorem
      const pricing = await pictoremClient.getPrice(
        pictoremOptions,
        '', // collection ID
        deliveryProvince,
        deliveryCountry
      );

      if (pricing.status && pricing.worksheet?.price?.total) {
        pictoremTotal = pricing.worksheet.price.total;
      } else {
        console.warn('Pictorem pricing failed, using fallback:', pricing.msg);
        useFallbackPricing = true;
      }

      // Try to get lead time
      try {
        const leadTime = await pictoremClient.getLeadTime(pictoremOptions);
        if (leadTime.status && leadTime.data?.productionLeadTime) {
          leadTimeDays = leadTime.data.productionLeadTime;
        }
      } catch (leadTimeError) {
        console.warn('Failed to get lead time:', leadTimeError);
      }
    } catch (pictoremError) {
      console.error('Pictorem API error:', pictoremError);
      useFallbackPricing = true;
    }

    // Use fallback pricing if Pictorem API failed
    if (useFallbackPricing) {
      // Estimate based on size and material
      const area = width * height;
      let basePricePerSqIn = 0.15; // Default price per square inch
      
      // Adjust base price by material
      switch (material) {
        case 'canvas':
          basePricePerSqIn = 0.12;
          break;
        case 'metal':
          basePricePerSqIn = 0.25;
          break;
        case 'acrylic':
          basePricePerSqIn = 0.30;
          break;
        case 'paper':
          basePricePerSqIn = 0.08;
          break;
      }
      
      pictoremTotal = area * basePricePerSqIn * numCopies;
      leadTimeDays = 7; // Default lead time
    }

    // Calculate our pricing
    const ourPrice = Math.max(minPrice, Math.min(maxPrice, pictoremTotal * baseMarkup));
    const profit = ourPrice - pictoremTotal;
    const profitMargin = (profit / ourPrice) * 100;

    return NextResponse.json({
      success: true,
      data: {
        customerPrice: parseFloat(ourPrice.toFixed(2)),
        pictoremCost: parseFloat(pictoremTotal.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        leadTimeDays,
        preorderCode: `${numCopies}|${material}|${type}|${orientation}|${width}|${height}|${additional.join('|')}`,
        currency: 'USD',
        usingFallbackPricing: useFallbackPricing
      }
    });

  } catch (error: any) {
    console.error('Pictorem pricing error:', error);
    return NextResponse.json(
      { error: 'Failed to get pricing', details: error.message },
      { status: 500 }
    );
  }
}
