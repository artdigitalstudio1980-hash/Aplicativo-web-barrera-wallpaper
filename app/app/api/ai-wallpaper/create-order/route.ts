
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CreateOrderRequest {
  generatedImageUrl: string;
  prompt: string;
  material: string;
  type: string;
  orientation: string;
  width: number;
  height: number;
  numCopies?: number;
  borderColor?: string;
  additional?: string[];
  userId?: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingAddress: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
}

function calculatePrice(material: string, width: number, height: number, numCopies: number): number {
  const area = width * height;
  let basePricePerSqIn = 0.15;
  switch (material) {
    case 'canvas': basePricePerSqIn = 0.12; break;
    case 'metal': basePricePerSqIn = 0.25; break;
    case 'acrylic': basePricePerSqIn = 0.30; break;
    case 'paper': basePricePerSqIn = 0.08; break;
  }
  const cost = area * basePricePerSqIn * numCopies * 2.0;
  return Math.max(25.0, Math.min(500.0, cost));
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderRequest = await req.json();
    const {
      generatedImageUrl,
      prompt,
      material,
      type,
      orientation,
      width,
      height,
      numCopies = 1,
      borderColor = 'ffffff',
      additional = [],
      userId,
      customerInfo,
      shippingAddress
    } = body;

    if (!generatedImageUrl || !prompt || !material || !type || !customerInfo || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const orderNumber = `BW-AI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const customerPrice = calculatePrice(material, width, height, numCopies);

    const orderData: any = {
      orderNumber,
      status: 'PENDING',
      subtotal: customerPrice,
      tax: 0,
      shipping: 0,
      total: customerPrice,
      currency: 'USD',
      isAIGenerated: true,
      shippingName: customerInfo.name,
      shippingEmail: customerInfo.email,
      shippingPhone: customerInfo.phone,
      shippingAddress1: shippingAddress.address1,
      shippingAddress2: shippingAddress.address2,
      shippingCity: shippingAddress.city,
      shippingState: shippingAddress.state,
      shippingCountry: shippingAddress.country,
      shippingZip: shippingAddress.zip
    };

    if (userId) {
      orderData.userId = userId;
    }

    const order = await prisma.order.create({ data: orderData });

    const aiOrder = await prisma.aIWallpaperOrder.create({
      data: {
        orderId: order.id,
        userId,
        prompt,
        generatedImageUrl,
        material,
        type,
        orientation,
        width,
        height,
        numCopies,
        borderColor,
        additionalOptions: additional,
        customerPrice,
        status: 'READY_FOR_PAYMENT'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber,
        aiOrderId: aiOrder.id,
        customerPrice,
        status: 'READY_FOR_PAYMENT'
      }
    });

  } catch (error: any) {
    console.error('Create AI order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}
