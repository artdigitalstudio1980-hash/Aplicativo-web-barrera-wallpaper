
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { pictoremClient } from '@/lib/pictorem';

interface ValidateRequest {
  material: string;
  type: string;
  orientation: string;
  width: number;
  height: number;
  numCopies?: number;
  additional?: string[];
  borderColor?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ValidateRequest = await req.json();
    const {
      material,
      type,
      orientation,
      width,
      height,
      numCopies = 1,
      additional = [],
      borderColor = 'ffffff'
    } = body;

    // Validate required fields
    if (!material || !type || !orientation || !width || !height) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dimensions
    if (width < 8 || width > 60 || height < 8 || height > 60) {
      return NextResponse.json(
        { error: 'Dimensions must be between 8 and 60 inches' },
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

    // Validate with Pictorem
    const validation = await pictoremClient.validatePreorder(
      pictoremOptions,
      borderColor
    );

    return NextResponse.json({
      success: true,
      data: {
        isValid: validation.status,
        preorderCode: `${numCopies}|${material}|${type}|${orientation}|${width}|${height}|${additional.join('|')}`,
        validation
      }
    });

  } catch (error: any) {
    console.error('Pictorem validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate with Pictorem', details: error.message },
      { status: 500 }
    );
  }
}
