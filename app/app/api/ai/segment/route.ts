import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Segment Anything Model (SAM) - Meta Research
const SAM_MODEL_VERSION = '97f4c10d4c0929753bb5a231808029a7004b3606d79bb64be7713b960be0a571';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { image, x, y } = await req.json();

    if (!image || x === undefined || y === undefined) {
      return NextResponse.json({ success: false, error: 'Image and coordinates (x, y) are required' }, { status: 400 });
    }

    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json({ 
        success: false, 
        error: 'REPLICATE_API_TOKEN not configured' 
      }, { status: 500 });
    }

    // Call Replicate SAM model with point coordinates
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: SAM_MODEL_VERSION,
        input: {
          image: image,
          // Points for SAM: [x, y] coordinates where the user clicked
          input_points: [[x, y]],
          input_labels: [1], // 1 = Foreground (the object we want to select)
          multimask_output: false, // We just want the most likely segment
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Replicate error: ${errorData}`);
    }

    const prediction = await response.json();

    return NextResponse.json({
      success: true,
      predictionId: prediction.id,
      status: prediction.status,
    });

  } catch (error: any) {
    console.error('AI Segmentation Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
