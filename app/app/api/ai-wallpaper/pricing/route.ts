export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

function calculatePrice(material: string, width: number, height: number, numCopies: number): number {
  const area = width * height;
  let basePricePerSqIn = 0.15;
  switch (material) {
    case 'canvas': basePricePerSqIn = 0.12; break;
    case 'metal': basePricePerSqIn = 0.25; break;
    case 'acrylic': basePricePerSqIn = 0.30; break;
    case 'paper': basePricePerSqIn = 0.08; break;
    case 'wood': basePricePerSqIn = 0.20; break;
  }
  const cost = area * basePricePerSqIn * numCopies * 2.0;
  return Math.max(25.0, Math.min(500.0, cost));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { material = 'paper', width = 24, height = 36, numCopies = 1 } = body;

    const customerPrice = calculatePrice(material, width, height, numCopies);

    return NextResponse.json({
      success: true,
      data: {
        customerPrice: Number(customerPrice.toFixed(2))
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to calculate pricing', details: error.message },
      { status: 500 }
    );
  }
}
