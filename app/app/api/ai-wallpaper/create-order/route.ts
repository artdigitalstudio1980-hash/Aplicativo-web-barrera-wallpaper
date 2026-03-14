
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pictoremClient } from '@/lib/pictorem';

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
  
  // Customer details
  userId?: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  
  // Shipping address
  shippingAddress: {
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
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

    // Validate required fields
    if (!generatedImageUrl || !prompt || !material || !type || !customerInfo || !shippingAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `BW-AI-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Calculate pricing
    const pictoremOptions = {
      numCopies,
      material,
      type,
      orientation,
      width,
      height,
      additional
    };

    // Get our markup configuration
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

    let pictoremCost = 0;
    let customerPrice = 0;

    try {
      // Try to get pricing from Pictorem
      const pricing = await pictoremClient.getPrice(
        pictoremOptions,
        '',
        shippingAddress.state,
        shippingAddress.country
      );

      if (pricing.status && pricing.worksheet?.price?.total) {
        pictoremCost = pricing.worksheet.price.total;
      } else {
        // Use fallback pricing
        const area = width * height;
        let basePricePerSqIn = 0.15;
        
        switch (material) {
          case 'canvas': basePricePerSqIn = 0.12; break;
          case 'metal': basePricePerSqIn = 0.25; break;
          case 'acrylic': basePricePerSqIn = 0.30; break;
          case 'paper': basePricePerSqIn = 0.08; break;
        }
        
        pictoremCost = area * basePricePerSqIn * numCopies;
        console.warn('Using fallback pricing for order');
      }
    } catch (pricingError) {
      console.error('Pictorem pricing error, using fallback:', pricingError);
      // Use fallback pricing
      const area = width * height;
      let basePricePerSqIn = 0.15;
      
      switch (material) {
        case 'canvas': basePricePerSqIn = 0.12; break;
        case 'metal': basePricePerSqIn = 0.25; break;
        case 'acrylic': basePricePerSqIn = 0.30; break;
        case 'paper': basePricePerSqIn = 0.08; break;
      }
      
      pictoremCost = area * basePricePerSqIn * numCopies;
    }

    customerPrice = Math.max(minPrice, Math.min(maxPrice, pictoremCost * baseMarkup));
    
    // Generate preorder code
    const preorderCode = `${numCopies}|${material}|${type}|${orientation}|${width}|${height}|${additional.join('|')}`;

    // Create order in database
    const orderData: any = {
      orderNumber,
      status: 'PENDING',
      subtotal: customerPrice,
      tax: 0, // Calculate tax based on location if needed
      shipping: 0, // Pictorem handles shipping
      total: customerPrice,
      currency: 'USD',
      isAIGenerated: true,
      
      // Shipping info
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

    const order = await prisma.order.create({
      data: orderData
    });

    // Create AI wallpaper order
    const aiOrder = await prisma.aIWallpaperOrder.create({
      data: {
        orderId: order.id,
        userId,
        prompt,
        generatedImageUrl,
        pictoremPreorderCode: preorderCode,
        material,
        type,
        orientation,
        width,
        height,
        numCopies,
        borderColor,
        additionalOptions: additional,
        pictoremPrice: pictoremCost,
        ourMarkup: baseMarkup,
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
        preorderCode,
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
